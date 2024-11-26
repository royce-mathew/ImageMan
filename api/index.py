from fastapi import FastAPI, Request, HTTPException
from PIL import Image
from base64 import b64decode, b64encode
import numpy as np
import cv2

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

image_store = None

@app.get("/api/")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}

@app.post("/api/resize")
async def resize_image(request: Request):
    """
    Expected request object:
    {
    image: base64,
    height: int,
    width: int,
    aspect_ratio: True
    }

    Resizes image based on given width and height

    response object

    {
    image: base64
    }
    """
    try:
        body = await request.json()
        image_b64 = body["image"]
        
    except Exception as e:
        raise HTTPException

def base64_to_rgb_image(b64):
    image_data = b64decode(b64)
    np_data = np.frombuffer(image_data, np.uint8)
    img_bgr = cv2.imdecode(np_data, np.uint8)
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    return img_rgb

def rgb_image_to_base64(img_rgb):
    img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
    _, img_enc = cv2.imencode('.png', img_bgr)
    img_b64 = b64encode(img_enc).decode('utf-8')

    return img_b64