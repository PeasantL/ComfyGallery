import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from websocket import create_connection
import json
import uuid
import urllib.request
import io
from PIL import Image
import random
import uvicorn

# Constants
SERVER_ADDRESS = "127.0.0.1:8188"
CLIENT_ID = str(uuid.uuid4())
IMAGES_FOLDER = "./images"  # Base folder to store images

# Create folder if it doesn't exist
os.makedirs(IMAGES_FOLDER, exist_ok=True)

# FastAPI instance
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # List of allowed origins
    allow_credentials=True, # Allow cookies and credentials
    allow_methods=["*"],    # Allow all HTTP methods
    allow_headers=["*"],    # Allow all HTTP headers
)


# Request model
class Prompt(BaseModel):
    positive_clip: str
    negative_clip: str

# Queue the prompt with the backend server
def queue_prompt(prompt):
    p = {"prompt": prompt, "client_id": CLIENT_ID}
    data = json.dumps(p).encode("utf-8")
    req = urllib.request.Request(f"http://{SERVER_ADDRESS}/prompt", data=data)
    return json.loads(urllib.request.urlopen(req).read())

# Save the image to a folder
def save_image(image_data, base_filename):
    image = Image.open(io.BytesIO(image_data))
    
    # Ensure filename uniqueness by incrementing an index
    index = 1
    while True:
        filename = f"{base_filename}_{index}.png"
        file_path = os.path.join(IMAGES_FOLDER, filename)
        if not os.path.exists(file_path):  # Break if file does not exist
            break
        index += 1
    
    # Save the image
    image.save(file_path)
    return file_path


# WebSocket image retrieval
def get_images_via_websocket(ws, prompt):
    prompt_id = queue_prompt(prompt)["prompt_id"]
    output_images = {}
    current_node = ""

    while True:
        out = ws.recv()
        if isinstance(out, str):
            message = json.loads(out)
            if message["type"] == "executing":
                data = message["data"]
                if data["prompt_id"] == prompt_id:
                    if data["node"] is None:
                        break  # Execution is complete
                    else:
                        current_node = data["node"]
        else:
            if current_node == "save_image_websocket_node":
                images_output = output_images.get(current_node, [])
                images_output.append(out[8:])
                output_images[current_node] = images_output

    return output_images

@app.post("/generate-image/")
async def generate_image(prompt: Prompt):
    # Build the prompt text dynamically
    prompt_text = {
        "71": {
            "inputs": {
                "ckpt_name": "noobaiXLNAIXL_vPred06Version.safetensors"
            },
            "class_type": "CheckpointLoaderSimple",
            "_meta": {
                "title": "Load Checkpoint"
            }
        },
        "72": {
            "inputs": {
                "width": 832,
                "height": 1216,
                "batch_size": 1
            },
            "class_type": "EmptyLatentImage",
            "_meta": {
                "title": "Empty Latent Image"
            }
        },
        "73": {
            "inputs": {
                "text": prompt.positive_clip,  # Use positive clip from the request
                "clip": [
                    "71",
                    1
                ]
            },
            "class_type": "CLIPTextEncode",
            "_meta": {
                "title": "CLIP Text Encode (Positive)"
            }
        },
        "74": {
            "inputs": {
                "text": prompt.negative_clip,  # Use negative clip from the request
                "clip": [
                    "71",
                    1
                ]
            },
            "class_type": "CLIPTextEncode",
            "_meta": {
                "title": "CLIP Text Encode (Negative)"
            }
        },
        "75": {
            "inputs": {
                "vae_name": "sdxl.vae.safetensors"
            },
            "class_type": "VAELoader",
            "_meta": {
                "title": "Load VAE"
            }
        },
        "76": {
            "inputs": {
                "unet_name": "Pred.06Dyn_$dyn-b-1-4-1-h-832-1216-1216-w-832-1216-832_00001_.engine",
                "model_type": "sdxl_base"
            },
            "class_type": "TensorRTLoader",
            "_meta": {
                "title": "TensorRT Loader"
            }
        },
        "77": {
            "inputs": {
                "sampling": "v_prediction",
                "zsnr": True,
                "model": [
                    "76",
                    0
                ]
            },
            "class_type": "ModelSamplingDiscrete",
            "_meta": {
                "title": "ModelSamplingDiscrete"
            }
        },
        "94": {
            "inputs": {
                "model_name": "bbox/face_yolov8m.pt"
            },
            "class_type": "UltralyticsDetectorProvider",
            "_meta": {
                "title": "UltralyticsDetectorProvider"
            }
        },
        "95": {
            "inputs": {
                "model_name": "segm/person_yolov8m-seg.pt"
            },
            "class_type": "UltralyticsDetectorProvider",
            "_meta": {
                "title": "UltralyticsDetectorProvider"
            }
        },
        "96": {
            "inputs": {
                "model_name": "sam_vit_b_01ec64.pth",
                "device_mode": "AUTO"
            },
            "class_type": "SAMLoader",
            "_meta": {
                "title": "SAMLoader (Impact)"
            }
        },
        "98": {
            "inputs": {
                "model": [
                    "77",
                    0
                ],
                "clip": [
                    "71",
                    1
                ],
                "vae": [
                    "75",
                    0
                ],
                "positive": [
                    "73",
                    0
                ],
                "negative": [
                    "74",
                    0
                ]
            },
            "class_type": "ToBasicPipe",
            "_meta": {
                "title": "ToBasicPipe"
            }
        },
        "99": {
            "inputs": {
                "seed": random.randint(1000000000, 9999999999),  # Random seed
                "steps": 28,
                "cfg": 5,
                "sampler_name": "euler",
                "scheduler": "normal",
                "denoise": 1,
                "basic_pipe": [
                    "98",
                    0
                ],
                "latent_image": [
                    "72",
                    0
                ]
            },
            "class_type": "ImpactKSamplerBasicPipe",
            "_meta": {
                "title": "KSampler (pipe)"
            }
        },
        "100": {
            "inputs": {
                "samples": [
                    "99",
                    1
                ],
                "vae": [
                    "99",
                    2
                ]
            },
            "class_type": "VAEDecode",
            "_meta": {
                "title": "VAE Decode"
            }
        },
        "101": {
            "inputs": {
                "wildcard": "",
                "Select to add LoRA": "Select the LoRA to add to the text",
                "Select to add Wildcard": "Select the Wildcard to add to the text",
                "basic_pipe": [
                    "98",
                    0
                ],
                "bbox_detector": [
                    "94",
                    0
                ],
                "sam_model_opt": [
                    "96",
                    0
                ],
                "segm_detector_opt": [
                    "95",
                    1
                ]
            },
            "class_type": "BasicPipeToDetailerPipe",
            "_meta": {
                "title": "BasicPipe -> DetailerPipe"
            }
        },
        "106": {
            "inputs": {
                "guide_size": 512,
                "guide_size_for": True,
                "max_size": 1024,
                "seed": random.randint(1000000000, 9999999999),  # Random seed
                "steps": 20,
                "cfg": 8,
                "sampler_name": "euler",
                "scheduler": "normal",
                "denoise": 0.5,
                "feather": 5,
                "noise_mask": True,
                "force_inpaint": True,
                "bbox_threshold": 0.5,
                "bbox_dilation": 10,
                "bbox_crop_factor": 3,
                "sam_detection_hint": "center-1",
                "sam_dilation": 0,
                "sam_threshold": 0.93,
                "sam_bbox_expansion": 0,
                "sam_mask_hint_threshold": 0.7,
                "sam_mask_hint_use_negative": "False",
                "drop_size": 10,
                "refiner_ratio": 0.2,
                "cycle": 1,
                "inpaint_model": False,
                "noise_mask_feather": 20,
                "image": [
                    "100",
                    0
                ],
                "detailer_pipe": [
                    "101",
                    0
                ]
            },
            "class_type": "FaceDetailerPipe",
            "_meta": {
                "title": "FaceDetailer (pipe)"
            }
        },
        "save_image_websocket_node": {
        "class_type": "SaveImageWebsocket",
        "inputs": {
            "images": [
                "106",
                0
            ]
        }
    }
}

    # Connect to WebSocket
    ws = create_connection(f"ws://{SERVER_ADDRESS}/ws?clientId={CLIENT_ID}")
    
    # Generate images
    images = get_images_via_websocket(ws, prompt_text)
    ws.close()
    
    saved_files = []
    for node_id in images:
        for index, image_data in enumerate(images[node_id]):
            filename = f"{node_id}"
            file_path = save_image(image_data, filename)
            saved_files.append(file_path)
    
    return {"saved_files": saved_files}

@app.get("/images/")
def list_images():
    """List all images in the folder."""
    files = os.listdir(IMAGES_FOLDER)
    return {"images": files}

@app.get("/images/{filename}")
def get_image(filename: str):
    """Serve a specific image."""
    file_path = os.path.join(IMAGES_FOLDER, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)  # Listen on all interfaces