from fastapi import FastAPI, Request, HTTPException
import api.image as image
from api.utils import validate_image, server_exception_handler

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

image_store = None

@app.get("/api/py")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}


@app.post("/api/py/upload")
@server_exception_handler(status_code=400,detail=f"Error uploading image to the server:")
async def upload_image(request: Request):
    """
    Uploads image to backend and puts it in image store
    Request object
    {
        image: base64
    }
    Response object
    {
        success: True
    }
    """
    global image_store
    body = await request.json()

    b64 = body.get("image")

    img = image.base64_to_rgb_image(b64)

    image_store = image.Image(img)

    return {"success": True}


@app.post("/api/py/resize")
@server_exception_handler(detail=f"Error processing image:")
@validate_image
async def resize_image(request: Request):
    """
    Expected request object:
    {
    height: int,
    width: int,
    aspect_ratio: True
    }

    Resizes image based on given width and height

    response object

    {
    image: base64 or null,
    success: Bool
    }
    """
    body = await request.json()
    height = int(body.get("height")) if body.get("height") else None
    width = int(body.get("width")) if body.get("width") else None
    aspect_ratio = bool(body.get("aspect_ratio")) if body.get("aspect_ratio") else True

    if height is None and width is None:
        raise HTTPException(status_code=400, detail="Both width and height must be provided.")
    if height is None:
        new_img = image.resize_image(image_store.image,height=height,aspect_ratio=aspect_ratio)
    if width is None:
        new_img = image.resize_image(image_store.image,width=width,aspect_ratio=aspect_ratio)
    else:
        new_img = image.resize_image(image_store.image,width=width,height=height,aspect_ratio=aspect_ratio)
    
    image_store.apply_changes(new_img)
    new_img_b64 = image.rgb_image_to_base64(new_img)

    return {"image": new_img_b64, "success": True}


@app.get("/api/py/grayscale")
@server_exception_handler(detail=f"Error processing image:")
@validate_image
async def make_grayscale():
    """
    Convert image to grayscale

    returns response
    {
        "image": base64 or null,
        "success": bool
    }
    """

    image.plt.imshow(image_store.image)
    image.plt.show()
    new_img = image.convert_to_grayscale(image_store.image)
    image.plt.imshow(new_img)
    image.plt.show()
    image_store.apply_changes(new_img)
    new_img_b64 = image.rgb_image_to_base64(new_img)

    return {"image": new_img_b64, "success": True}

@app.get("/api/py/download")
@server_exception_handler(detail=f"Error downloading image from the server:")
@validate_image
async def download_image():
    return {"image": image.rgb_image_to_base64(image_store.image), "success": True}

@app.get("/api/py/undo")
@server_exception_handler(detail=f"Error in undo state:") 
@validate_image
async def undo():
    if image_store is not None:
        image_store.undo()
    return {"image": image.rgb_image_to_base64(image_store.image), "success": True}

@app.get("/api/py/redo")
@server_exception_handler(detail=f"Error in redo state:") 
@validate_image
async def redo():
    if image_store is not None:
        image_store.redo()
    return {"image": image.rgb_image_to_base64(image_store.image), "success": True}