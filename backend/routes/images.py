# routes/images.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, JSONResponse
import os

from constants import IMAGES_FOLDER, THUMBNAILS_FOLDER

router = APIRouter()

@router.get("/images/")
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

@router.get("/images/{filename}")
def get_image(filename: str):
    """Serve a specific image."""
    file_path = os.path.join(IMAGES_FOLDER, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)

@router.delete("/images/{filename}")
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

@router.get("/thumb/{filename}")
def get_thumbnail(filename: str):
    """Serve a specific thumbnail."""
    file_path = os.path.join(THUMBNAILS_FOLDER, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    return FileResponse(file_path)
