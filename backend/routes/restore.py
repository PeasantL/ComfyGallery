# routes/restore.py
from fastapi import APIRouter, HTTPException
import os
import json

from utils import ensure_deleted_tags_file
from constants import DELETED_TAGS_FILE, DEFAULT_TAGS_FOLDER, PUBLIC_TAGS_FOLDER

router = APIRouter()

@router.post("/restore-deleted-tags")
async def restore_deleted_tags(request: dict):
    """
    Restore only the deleted tags provided in the request
    to their respective active tag lists, sorted alphabetically by tag.
    """
    try:
        # Parse the incoming tags
        character_tags_to_restore = request.get("characterTags", [])
        artist_tags_to_restore = request.get("artistTags", [])

        # Ensure we have tags to restore
        if not character_tags_to_restore and not artist_tags_to_restore:
            raise HTTPException(
                status_code=400, detail="No tags provided for restoration"
            )

        # Load deleted tags file
        ensure_deleted_tags_file()
        with open(DELETED_TAGS_FILE, "r") as file:
            deleted_tags = json.load(file)

        # Restore character tags
        char_file_path = os.path.join(PUBLIC_TAGS_FOLDER, "char.json")
        with open(char_file_path, "r") as file:
            current_character_tags = json.load(file)

        restored_character_tags = [
            tag for tag in deleted_tags["characterTags"]
            if tag["tag"] in character_tags_to_restore
        ]
        current_character_tags.extend(restored_character_tags)
        # Deduplicate and sort alphabetically by "tag"
        current_character_tags = sorted(
            {tag["tag"]: tag for tag in current_character_tags}.values(),
            key=lambda x: x["tag"]
        )

        with open(char_file_path, "w") as file:
            json.dump(current_character_tags, file, indent=4)

        # Restore artist tags
        artist_file_path = os.path.join(PUBLIC_TAGS_FOLDER, "artist.json")
        with open(artist_file_path, "r") as file:
            current_artist_tags = json.load(file)

        restored_artist_tags = [
            tag for tag in deleted_tags["artistTags"]
            if tag["tag"] in artist_tags_to_restore
        ]
        current_artist_tags.extend(restored_artist_tags)
        # Deduplicate and sort alphabetically by "tag"
        current_artist_tags = sorted(
            {tag["tag"]: tag for tag in current_artist_tags}.values(),
            key=lambda x: x["tag"]
        )

        with open(artist_file_path, "w") as file:
            json.dump(current_artist_tags, file, indent=4)

        # Remove the restored tags from the deleted_tags file
        deleted_tags["characterTags"] = [
            tag for tag in deleted_tags["characterTags"]
            if tag["tag"] not in character_tags_to_restore
        ]
        deleted_tags["artistTags"] = [
            tag for tag in deleted_tags["artistTags"]
            if tag["tag"] not in artist_tags_to_restore
        ]
        with open(DELETED_TAGS_FILE, "w") as file:
            json.dump(deleted_tags, file, indent=4)

        return {"message": "Deleted tags restored successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error restoring tags: {str(e)}"
        )


@router.post("/restore-database")
async def restore_database():
    """Restore the database to its original state."""
    try:
        if not os.path.exists(DEFAULT_TAGS_FOLDER):
            raise HTTPException(status_code=404, detail="Backup folder not found")

        for file_name in os.listdir(DEFAULT_TAGS_FOLDER):
            backup_file_path = os.path.join(DEFAULT_TAGS_FOLDER, file_name)
            original_file_path = os.path.join(PUBLIC_TAGS_FOLDER, file_name)

            if os.path.exists(backup_file_path):
                with open(backup_file_path, "r") as backup_file:
                    data = json.load(backup_file)

                with open(original_file_path, "w") as original_file:
                    json.dump(data, original_file, indent=4)

        # Clear deleted tags
        if os.path.exists(DELETED_TAGS_FILE):
            with open(DELETED_TAGS_FILE, "w") as file:
                json.dump({"characterTags": [], "artistTags": []}, file, indent=4)

        return {"message": "Database restored to original state"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error restoring database: {str(e)}")

@router.post("/remove-tags")
async def remove_tags(request: dict):
    """Remove specified tags and track them in deleted_tags.json."""
    try:
        character_tags = request.get("characterTags", [])
        artist_tags = request.get("artistTags", [])

        if not character_tags and not artist_tags:
            raise HTTPException(status_code=400, detail="No tags provided for removal")

        # Load current tags
        char_file_path = os.path.join(PUBLIC_TAGS_FOLDER, "char.json")
        artist_file_path = os.path.join(PUBLIC_TAGS_FOLDER, "artist.json")

        with open(char_file_path, "r") as file:
            current_character_tags = json.load(file)
        with open(artist_file_path, "r") as file:
            current_artist_tags = json.load(file)

        # Remove specified tags and save them to deleted_tags.json
        deleted_tags = {"characterTags": [], "artistTags": []}

        for tag in character_tags:
            for item in current_character_tags:
                if item["tag"] == tag:
                    deleted_tags["characterTags"].append(item)
                    current_character_tags.remove(item)

        for tag in artist_tags:
            for item in current_artist_tags:
                if item["tag"] == tag:
                    deleted_tags["artistTags"].append(item)
                    current_artist_tags.remove(item)

        with open(char_file_path, "w") as file:
            json.dump(current_character_tags, file, indent=4)
        with open(artist_file_path, "w") as file:
            json.dump(current_artist_tags, file, indent=4)

        # Update deleted_tags.json
        if os.path.exists(DELETED_TAGS_FILE):
            with open(DELETED_TAGS_FILE, "r") as file:
                existing_deleted_tags = json.load(file)
            deleted_tags["characterTags"].extend(existing_deleted_tags.get("characterTags", []))
            deleted_tags["artistTags"].extend(existing_deleted_tags.get("artistTags", []))

        with open(DELETED_TAGS_FILE, "w") as file:
            json.dump(deleted_tags, file, indent=4)

        return {"message": "Tags removed and tracked successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing tags: {str(e)}")
