# constants.py
import uuid

# Constants
SERVER_ADDRESS = "127.0.0.1:8188"
CLIENT_ID = str(uuid.uuid4())
IMAGES_FOLDER = "./public/images"
THUMBNAILS_FOLDER = "./public/thumbnails"
TAGS_FOLDER = "./default/tags"
PROMPT_TEMPLATE_PATH = "./default/prompt.json"  # Path to the prompt JSON template
DELETED_TAGS_FILE = "./public/tags/deleted_tags.json"
BACKUP_TAGS_FOLDER = "./public/tags"
