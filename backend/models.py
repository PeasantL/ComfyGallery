# models.py
from pydantic import BaseModel
from typing import List

class Prompt(BaseModel):
    positive_clip: str
    negative_clip: str
    character_tags: List[str]
    artist_tags: List[str]
