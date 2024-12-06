from fastapi import FastAPI, Request, HTTPException
import api.image as image
from api.utils import validate_image, server_exception_handler

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

image_store = None

@app.get("/api/py")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}

@server_exception_handler(detail="Error uploading image to server:")
@app.post("/api/py/upload")
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

        return {
            "states": image_store.get_states(),
            "success": True
        }


@server_exception_handler(detail=f"Error processing image:")
@validate_image
@app.post("/api/py/resize")
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
    aspect_ratio = bool(body.get("aspectRatio")) if body.get("aspectRatio") else True

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


@server_exception_handler(detail=f"Error processing image:")
@validate_image
@app.post("/api/py/grayscale")
async def make_grayscale():
    """
    Convert image to grayscale

    returns response
    {
        "image": base64 or null,
        "success": bool
    }
    """

    # image.plt.imshow(image_store.image)
    # image.plt.show()
    new_img = image.convert_to_grayscale(image_store.image)
    # image.plt.imshow(new_img)
    # image.plt.show()
    image_store.apply_changes(new_img)
    new_img_b64 = image.rgb_image_to_base64(new_img)

    return {"image": new_img_b64, "success": True}


@server_exception_handler(detail=f"Error downloading image from the server:")
@validate_image
@app.post("/api/py/download")
async def download_image():
    """
    downloads the current image on the backend
    """
    return {"image": image.rgb_image_to_base64(image_store.image), "success": True}


@server_exception_handler(detail=f"Error in undo state:") 
@validate_image
@app.post("/api/py/undo")
async def undo():
    """
    undo an image to a previous state
    """
    if image_store is not None:
        image_store.undo()
    return {"image": image.rgb_image_to_base64(image_store.image), "success": True}


@server_exception_handler(detail=f"Error in redo state:") 
@validate_image
@app.post("/api/py/redo")
async def redo():
    """
    redo an image to a previous state before undo
    """
    if image_store is not None:
        image_store.redo()
    return {"image": image.rgb_image_to_base64(image_store.image), "success": True}


@server_exception_handler(detail=f"Error in getting image states")
@validate_image
@app.get("/api/py/states")
async def get_states():
    """
    Get the current states of the image
    """
    if image_store is not None:
        return {"states": image_store.get_states(), "success": True}
    else:
        return {"states": { "undo": 0, "redo": 0 , "height": 0, "width": 0}, "success": False}

@server_exception_handler(detail=f"Error processing image:")
@validate_image
@app.post("/api/py/rotate")
async def rotate_image(request: Request):
    """
    Rotates image by a certain angle

    Request
    {
        angle: int (degrees)
    }
    """
    body = await request.json()
    angle = int(body.get("angle"))

    rotated = image.rotate_image(image_store.image, angle)
    
    image_store.apply_changes(rotated)
    rotated_b64 = image.rgb_image_to_base64(rotated)
    
    return {"image": rotated_b64, "success": True}

@server_exception_handler(detail=f"Error processing image:")
@validate_image
@app.post("/api/py/whitebalance")
async def white_balance(request: Request):
    """
    Applies white balancing (white world or gray world)

    Request
    {
        mode: string of type white | gray
    }
    """
    body = await request.json()
    mode = body.get("mode")

    if mode == "white":
        wb_image = image.white_balance(image_store.image, mode='white')
    else:
        wb_image = image.white_balance(image_store.image)
    
    image_store.apply_changes(wb_image)
    wb_b64 = image.rgb_image_to_base64(wb_image)
    
    return {"image": wb_b64, "success": True}