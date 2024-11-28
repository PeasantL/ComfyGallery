# utils.py
import os
import re
import json
import random
import io
import urllib.request
from PIL import Image
from typing import Optional
from heapq import nlargest
from fastapi import HTTPException

from constants import (
    SERVER_ADDRESS,
    CLIENT_ID,
    IMAGES_FOLDER,
    THUMBNAILS_FOLDER,
    DEFAULT_TAGS_FOLDER,
    DELETED_TAGS_FILE,
)

def sanitize_filename(filename: str) -> str:
    """Sanitize filenames to prevent invalid characters and overly long names."""
    sanitized = re.sub(r'[<>:"/\\|?*]', '_', filename)
    max_length = 255
    return sanitized[:max_length]

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

def ensure_deleted_tags_file():
    """Ensure that the deleted_tags.json file exists with a valid structure."""
    if not os.path.exists(DELETED_TAGS_FILE):
        with open(DELETED_TAGS_FILE, "w") as file:
            json.dump({"characterTags": [], "artistTags": []}, file, indent=4)

def load_and_filter_tags(file_name: str, query: Optional[str]) -> list:
    """Load and filter tags from a given JSON file, optimized for speed."""
    file_path = os.path.join(DEFAULT_TAGS_FOLDER, file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"{file_name} not found")

    try:
        with open(file_path, "r") as file:
            data = json.load(file)
            # Filter by query if provided
            filtered_data = (
                tag for tag in data if not query or query.lower() in tag["tag"].lower()
            )
            # Use a heap to get the top 8 entries by count
            top_tags = nlargest(
                8,
                filtered_data,
                key=lambda x: int(x.get("count", "0"))
            )
            return top_tags
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing {file_name}: {str(e)}")

def get_random_tag_from_file(file_name: str):
    """Helper function to select a random tag from a JSON file."""
    file_path = os.path.join(DEFAULT_TAGS_FOLDER, file_name)
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
