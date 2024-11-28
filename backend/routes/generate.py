# routes/generate.py
from fastapi import APIRouter
import random
import json
from websocket import create_connection
import os

from constants import SERVER_ADDRESS, CLIENT_ID, PROMPT_TEMPLATE_PATH
from models import Prompt
from utils import get_images_via_websocket, save_image

router = APIRouter()

@router.post("/generate-image/")
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
