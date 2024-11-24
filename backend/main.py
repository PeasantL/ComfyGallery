import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from websocket import WebSocket
import json
import uuid
import urllib.request
import io
from PIL import Image

# Constants
SERVER_ADDRESS = "127.0.0.1:8188"
CLIENT_ID = str(uuid.uuid4())
IMAGES_FOLDER = "./images"  # Base folder to store images

# Create folder if it doesn't exist
os.makedirs(IMAGES_FOLDER, exist_ok=True)

# FastAPI instance
app = FastAPI()

class Prompt(BaseModel):
    prompt_text: str

def queue_prompt(prompt):
    p = {"prompt": prompt, "client_id": CLIENT_ID}
    data = json.dumps(p).encode("utf-8")
    req = urllib.request.Request(f"http://{SERVER_ADDRESS}/prompt", data=data)
    return json.loads(urllib.request.urlopen(req).read())

def get_images(ws, prompt):
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
                        break  # Execution is done
                    else:
                        current_node = data["node"]
        else:
            if current_node == "save_image_websocket_node":
                images_output = output_images.get(current_node, [])
                images_output.append(out[8:])
                output_images[current_node] = images_output

    return output_images

# Save the image to a folder
def save_image(image_data, filename):
    image = Image.open(io.BytesIO(image_data))
    file_path = os.path.join(IMAGES_FOLDER, filename)
    image.save(file_path)
    return file_path

@app.post("/generate-image/")
async def generate_image(prompt: Prompt):
    ws = WebSocket()
    ws.connect(f"ws://{SERVER_ADDRESS}/ws?clientId={CLIENT_ID}")
    
    # Generate images
    images = get_images(ws, json.loads(prompt.prompt_text))
    ws.close()
    
    saved_files = []
    for node_id in images:
        for index, image_data in enumerate(images[node_id]):
            filename = f"{node_id}_{index}.png"
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
