# app.py
import os
import shutil
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from constants import IMAGES_FOLDER, THUMBNAILS_FOLDER
from routes.images import router as images_router
from routes.tags import router as tags_router
from routes.generate import router as generate_router
from routes.restore import router as restore_router

# Constants
PUBLIC_TAGS_FOLDER = "./public/tags"
DEFAULT_TAGS_FOLDER = "./default/tags"

def ensure_tags_folder():
    """Ensure the ./public/tags folder exists, copying from ./default/tags if necessary."""
    if not os.path.exists(PUBLIC_TAGS_FOLDER):
        if not os.path.exists(DEFAULT_TAGS_FOLDER):
            raise FileNotFoundError(f"Default tags folder not found at {DEFAULT_TAGS_FOLDER}")
        shutil.copytree(DEFAULT_TAGS_FOLDER, PUBLIC_TAGS_FOLDER)
    else:
        print(f"Tags folder found at {PUBLIC_TAGS_FOLDER}")

# Ensure folders exist
os.makedirs(IMAGES_FOLDER, exist_ok=True)
os.makedirs(THUMBNAILS_FOLDER, exist_ok=True)
ensure_tags_folder()

# FastAPI app setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(images_router)
app.include_router(tags_router)
app.include_router(generate_router)
app.include_router(restore_router)
