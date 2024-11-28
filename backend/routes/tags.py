# routes/tags.py
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import json
import os

from utils import load_and_filter_tags, get_random_tag_from_file, ensure_deleted_tags_file
from constants import DELETED_TAGS_FILE

router = APIRouter()

@router.get("/tags/artist/")
def get_artist_tags(q: Optional[str] = Query(None, description="Search query for artist tags")):
    return {"tags": load_and_filter_tags("artist.json", q)}

@router.get("/tags/character/")
def get_character_tags(q: Optional[str] = Query(None, description="Search query for character tags")):
    return {"tags": load_and_filter_tags("char.json", q)}

@router.get("/tags/danbooru/")
def get_danbooru_tags(q: Optional[str] = Query(None, description="Search query for Danbooru tags")):
    return {"tags": load_and_filter_tags("danbooru.json", q)}

@router.get("/tags/participant/")
def get_participant_tags(q: Optional[str] = Query(None, description="Search query for Participant tags")):
    return {"tags": load_and_filter_tags("participant.json", q)}

@router.get("/tags/artist/random")
def get_random_artist_tag():
    """Select a random artist tag from artist.json."""
    return get_random_tag_from_file("artist.json")

@router.get("/tags/character/random")
def get_random_character_tag():
    """Select a random character tag from char.json."""
    return get_random_tag_from_file("char.json")

@router.get("/tags/danbooru/random")
def get_random_danbooru_tag():
    """Select a random Danbooru tag from danbooru.json."""
    return get_random_tag_from_file("danbooru.json")

@router.get("/tags/participant/random")
def get_random_participant_tag():
    """Select a random participant tag from participant.json."""
    return get_random_tag_from_file("participant.json")

@router.get("/tags/deleted-character")
async def get_deleted_character_tags():
    """Retrieve deleted character tags."""
    try:
        # Ensure the file exists
        ensure_deleted_tags_file()

        # Read and return the characterTags from deleted_tags.json
        with open(DELETED_TAGS_FILE, "r") as file:
            deleted_tags = json.load(file)
        return {"tags": deleted_tags.get("characterTags", [])}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching deleted character tags: {str(e)}"
        )

@router.get("/tags/deleted-artist")
async def get_deleted_artist_tags():
    """Retrieve deleted artist tags."""
    try:
        # Ensure the file exists
        ensure_deleted_tags_file()

        # Read and return the artistTags from deleted_tags.json
        with open(DELETED_TAGS_FILE, "r") as file:
            deleted_tags = json.load(file)
        return {"tags": deleted_tags.get("artistTags", [])}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching deleted artist tags: {str(e)}"
        )
