import os
import json
import re
import uuid
import random
import io
import urllib.request
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from websocket import create_connection

# Constants
SERVER_ADDRESS = "127.0.0.1:8188"
CLIENT_ID = str(uuid.uuid4())
IMAGES_FOLDER = "./images"
PROMPT_TEMPLATE_PATH = "./prompt.json"  # Path to the prompt JSON template

# Ensure folders exist
os.makedirs(IMAGES_FOLDER, exist_ok=True)

# FastAPI app setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Prompt(BaseModel):
    positive_clip: str
    negative_clip: str
    character_tags: list[str]
    artist_tags: list[str]

def sanitize_filename(filename: str) -> str:
    """Sanitize filenames to prevent invalid characters and overly long names."""
    sanitized = re.sub(r'[<>:"/\\|?*]', '_', filename)
    max_length = 255
    return sanitized[:max_length]

def save_image(image_data, base_filename, character, artist):
    """Save the image to the folder, avoiding filename collisions."""
    index = 1
    image = Image.open(io.BytesIO(image_data))
    
    # Create a unique filename
    while True:
        filename = f"{character}_{artist}_{index}.png"
        sanitized_filename = sanitize_filename(filename)
        file_path = os.path.join(IMAGES_FOLDER, sanitized_filename)
        if not os.path.exists(file_path):
            break
        index += 1

    # Save the image
    image.save(file_path)
    return file_path

def queue_prompt(prompt):
    """Send the prompt to the backend server."""
    data = json.dumps({"prompt": prompt, "client_id": CLIENT_ID}).encode("utf-8")
    req = urllib.request.Request(f"http://{SERVER_ADDRESS}/prompt", data=data)
    return json.loads(urllib.request.urlopen(req).read())

def get_images_via_websocket(ws, prompt):
    """Retrieve images via WebSocket."""
    prompt_id = queue_prompt(prompt)["prompt_id"]
    output_images = {}
    current_node = ""

    while True:
        out = ws.recv()
        if isinstance(out, str):
            message = json.loads(out)
            if message["type"] == "executing" and message["data"]["prompt_id"] == prompt_id:
                current_node = message["data"].get("node")
                if current_node is None:
                    break
        else:
            if current_node == "save_image_websocket_node":
                images_output = output_images.get(current_node, [])
                images_output.append(out[8:])
                output_images[current_node] = images_output

    return output_images

@app.post("/generate-image/")
async def generate_image(prompt: Prompt):
    """Generate an image based on the given prompt."""
    # Load and modify the prompt template
    with open(PROMPT_TEMPLATE_PATH, "r") as file:
        prompt_text = json.load(file)
    
    # Update the prompt with data from the request
    prompt_text["73"]["inputs"]["text"] = prompt.positive_clip
    prompt_text["74"]["inputs"]["text"] = prompt.negative_clip
    prompt_text["99"]["inputs"]["seed"] = random.randint(1000000000, 9999999999)
    prompt_text["106"]["inputs"]["seed"] = random.randint(1000000000, 9999999999)

    # Establish a WebSocket connection
    ws = create_connection(f"ws://{SERVER_ADDRESS}/ws?clientId={CLIENT_ID}")
    images = get_images_via_websocket(ws, prompt_text)
    ws.close()

    saved_files = []
    for node_id, image_data_list in images.items():
        for image_data in image_data_list:
            character = prompt.character_tags[0].split(",")[0] if prompt.character_tags else "char"
            artist = prompt.artist_tags[0] if prompt.artist_tags else "artist"
            file_path = save_image(image_data, node_id, character, artist)
            saved_files.append(file_path)

    return {"saved_files": saved_files}

@app.get("/images/")
def list_images():
    """List all images in the folder."""
    return {"images": os.listdir(IMAGES_FOLDER)}

@app.get("/images/{filename}")
def get_image(filename: str):
    """Serve a specific image."""
    file_path = os.path.join(IMAGES_FOLDER, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)

import subprocess

if __name__ == "__main__":
    subprocess.run([
        "uvicorn",
        "main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload"
    ])
