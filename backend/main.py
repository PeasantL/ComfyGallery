import os
import json
import re
import uuid
import random
import io
import urllib.request
from PIL import Image
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from websocket import create_connection
from fastapi.responses import JSONResponse
from typing import Optional
from heapq import nlargest

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

THUMBNAILS_FOLDER = "./thumbnails"
os.makedirs(THUMBNAILS_FOLDER, exist_ok=True)

def save_image(image_data, base_filename, character, artist):
    """Save the image and generate a thumbnail."""
    index = 1
    image = Image.open(io.BytesIO(image_data))
    
    # Create a unique filename for the original image
    while True:
        filename = f"{character}_{artist}_{index}.png"
        sanitized_filename = sanitize_filename(filename)
        file_path = os.path.join(IMAGES_FOLDER, sanitized_filename)
        if not os.path.exists(file_path):
            break
        index += 1

    # Save the original image
    image.save(file_path)

    # Generate and save a thumbnail
    thumbnail_size = (350, 350)  # Adjust thumbnail size as needed
    thumbnail_filename = f"{character}_{artist}_{index}.png"
    sanitized_thumbnail_filename = sanitize_filename(thumbnail_filename)
    thumbnail_path = os.path.join(THUMBNAILS_FOLDER, sanitized_thumbnail_filename)
    image.thumbnail(thumbnail_size)
    image.save(thumbnail_path)

    return {"original": file_path, "thumbnail": thumbnail_path}


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

TAGS_FOLDER = "./tags"

def load_and_filter_tags(file_name: str, query: Optional[str]) -> list:
    """Load and filter tags from a given JSON file, optimized for speed."""
    file_path = os.path.join(TAGS_FOLDER, file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"{file_name} not found")

    try:
        with open(file_path, "r") as file:
            data = json.load(file)
            # Filter by query if provided, using a generator
            filtered_data = (
                tag for tag in data if not query or query.lower() in tag["tag"].lower()
            )
            # Use a heap to get the top 8 entries by count, converting count to int
            top_tags = nlargest(
                8,
                filtered_data,
                key=lambda x: x.get("count", "0")  # Convert count to int
            )
            return top_tags
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing {file_name}: {str(e)}")

@app.get("/tags/artist/")
def get_artist_tags(q: Optional[str] = Query(None, description="Search query for artist tags")):
    return {"tags": load_and_filter_tags("artist.json", q)}

@app.get("/tags/character/")
def get_character_tags(q: Optional[str] = Query(None, description="Search query for character tags")):
    return {"tags": load_and_filter_tags("char.json", q)}

@app.get("/tags/danbooru/")
def get_danbooru_tags(q: Optional[str] = Query(None, description="Search query for Danbooru tags")):
    return {"tags": load_and_filter_tags("danbooru.json", q)}

@app.get("/tags/participant/")
def get_danbooru_tags(q: Optional[str] = Query(None, description="Search query for Participant tags")):
    return {"tags": load_and_filter_tags("participant.json", q)}

@app.get("/tags/artist/random")
def get_random_artist_tag():
    """Select a random artist tag from artist.json."""
    return get_random_tag_from_file("artist.json")

@app.get("/tags/character/random")
def get_random_character_tag():
    """Select a random character tag from char.json."""
    return get_random_tag_from_file("char.json")

@app.get("/tags/danbooru/random")
def get_random_danbooru_tag():
    """Select a random Danbooru tag from danbooru.json."""
    return get_random_tag_from_file("danbooru.json")

@app.get("/tags/participant/random")
def get_random_participant_tag():
    """Select a random participant tag from participant.json."""
    return get_random_tag_from_file("participant.json")

def get_random_tag_from_file(file_name: str):
    """Helper function to select a random tag from a JSON file."""
    file_path = os.path.join(TAGS_FOLDER, file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"{file_name} not found")

    try:
        with open(file_path, "r") as file:
            data = json.load(file)

            if not data:
                raise HTTPException(status_code=404, detail=f"No tags found in {file_name}")

            # Select a random tag
            random_tag = random.choice(data)
            return {"tag": random_tag}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing {file_name}: {str(e)}")

@app.get("/thumb/{filename}")
def get_thumbnail(filename: str):
    """Serve a specific thumbnail."""
    file_path = os.path.join(THUMBNAILS_FOLDER, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    return FileResponse(file_path)

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

    titles = []
    for node_id, image_data_list in images.items():
        for image_data in image_data_list:
            character = prompt.character_tags[0].split(",")[0] if prompt.character_tags else "char"
            artist = prompt.artist_tags[0] if prompt.artist_tags else "artist"
            paths = save_image(image_data, node_id, character, artist)
            title = os.path.basename(paths["original"])
            titles.append(title)

    return {"titles": titles}

@app.get("/images/")
def list_images():
    """List all images and their thumbnails."""
    images = []
    for filename in os.listdir(IMAGES_FOLDER):
        if filename.endswith(".png"):  # Only include PNG files
            thumbnail_filename = filename
            thumbnail_path = os.path.join(THUMBNAILS_FOLDER, thumbnail_filename)
            images.append({
                "original": f"/images/{filename}",
                "thumbnail": f"/thumb/{thumbnail_filename}" if os.path.exists(thumbnail_path) else None,
                "title": filename.split(".")[0]
            })
    return {"images": images}

@app.get("/images/{filename}")
def get_image(filename: str):
    """Serve a specific image."""
    file_path = os.path.join(IMAGES_FOLDER, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)

@app.delete("/images/{filename}")
def delete_image(filename: str):
    """Delete a specific image and its thumbnail."""
    image_path = os.path.join(IMAGES_FOLDER, filename)
    thumbnail_path = os.path.join(THUMBNAILS_FOLDER, filename)

    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Image not found")

    # Delete the image
    try:
        os.remove(image_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")

    # Delete the thumbnail if it exists
    if os.path.exists(thumbnail_path):
        try:
            os.remove(thumbnail_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to delete thumbnail: {str(e)}")

    return JSONResponse(content={"message": "Image and thumbnail deleted successfully"})

import subprocess

if __name__ == "__main__":
    subprocess.run([
        "uvicorn",
        "main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload"
    ])
