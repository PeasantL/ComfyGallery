import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from websocket import create_connection
import json
import uuid
import urllib.request
import io
from PIL import Image
import random

# Constants
SERVER_ADDRESS = "127.0.0.1:8188"
CLIENT_ID = str(uuid.uuid4())
IMAGES_FOLDER = "./images"  # Base folder to store images

# Create folder if it doesn't exist
os.makedirs(IMAGES_FOLDER, exist_ok=True)

# FastAPI instance
app = FastAPI()

# Allow CORS
origins = [
    "http://localhost:5173",  # Replace with your frontend's domain or port during development
    "http://127.0.0.1:5173", # Common alternative for localhost
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True, # Allow cookies and credentials
    allow_methods=["*"],    # Allow all HTTP methods
    allow_headers=["*"],    # Allow all HTTP headers
)


# Request model
class Prompt(BaseModel):
    positive_clip: str
    negative_clip: str

# Queue the prompt with the backend server
def queue_prompt(prompt):
    p = {"prompt": prompt, "client_id": CLIENT_ID}
    data = json.dumps(p).encode("utf-8")
    req = urllib.request.Request(f"http://{SERVER_ADDRESS}/prompt", data=data)
    return json.loads(urllib.request.urlopen(req).read())

# Save the image to a folder
def save_image(image_data, base_filename):
    image = Image.open(io.BytesIO(image_data))
    
    # Ensure filename uniqueness by incrementing an index
    index = 1
    while True:
        filename = f"{base_filename}_{index}.png"
        file_path = os.path.join(IMAGES_FOLDER, filename)
        if not os.path.exists(file_path):  # Break if file does not exist
            break
        index += 1
    
    # Save the image
    image.save(file_path)
    return file_path


# WebSocket image retrieval
def get_images_via_websocket(ws, prompt):
    prompt_id = queue_prompt(prompt)["prompt_id"]
    output_images = {}
    current_node = ""

    while True:
        out = ws.recv()
        if isinstance(out, str):
            message = json.loads(out)
            if message["type"] == "executing":
                data = message["data"]
                if data["prompt_id"] == prompt_id:
                    if data["node"] is None:
                        break  # Execution is complete
                    else:
                        current_node = data["node"]
        else:
            if current_node == "save_image_websocket_node":
                images_output = output_images.get(current_node, [])
                images_output.append(out[8:])
                output_images[current_node] = images_output

    return output_images

@app.post("/generate-image/")
async def generate_image(prompt: Prompt):
    # Build the prompt text dynamically
    prompt_text = {
        3: {
            "class_type": "KSampler",
            "inputs": {
                "cfg": 8,
                "denoise": 1,
                "latent_image": ["5", 0],
                "model": ["4", 0],
                "negative": ["7", 0],
                "positive": ["6", 0],
                "sampler_name": "euler",
                "scheduler": "normal",
                "seed": random.randint(100000,999999),
                "steps": 20,
            },
        },
        4: {
            "class_type": "CheckpointLoaderSimple",
            "inputs": {
                "ckpt_name": "noobaiXLNAIXL_vPred06Version.safetensors",
            },
        },
        5: {
            "class_type": "EmptyLatentImage",
            "inputs": {
                "batch_size": 1,
                "height": 1216,
                "width": 832,
            },
        },
        6: {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "clip": ["4", 1],
                "text": prompt.positive_clip,  # Use positive clip from the request
            },
        },
        7: {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "clip": ["4", 1],
                "text": prompt.negative_clip,  # Use negative clip from the request
            },
        },
        8: {
        "class_type": "VAEDecode",
        "inputs": {
            "samples": [
                "3",
                0
            ],
            "vae": [
                "4",
                2
            ]
        }
    },
    "save_image_websocket_node": {
        "class_type": "SaveImageWebsocket",
        "inputs": {
            "images": [
                "8",
                0
            ]
          }
      }
  }

    # Connect to WebSocket
    ws = create_connection(f"ws://{SERVER_ADDRESS}/ws?clientId={CLIENT_ID}")
    
    # Generate images
    images = get_images_via_websocket(ws, prompt_text)
    ws.close()
    
    saved_files = []
    for node_id in images:
        for index, image_data in enumerate(images[node_id]):
            filename = f"{node_id}"
            file_path = save_image(image_data, filename)
            saved_files.append(file_path)
    
    return {"saved_files": saved_files}

@app.get("/images/")
def list_images():
    """List all images in the folder."""
    files = os.listdir(IMAGES_FOLDER)
    return {"images": files}

@app.get("/images/{filename}")
def get_image(filename: str):
    """Serve a specific image."""
    file_path = os.path.join(IMAGES_FOLDER, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)
