from fastapi import FastAPI, Request, HTTPException
import api.image as image

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

image_store = None

@app.get("/api/")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}

@app.post("/api/upload")
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
    try:
        global image_store
        body = await request.json()
        b64 = body.get("image")

        img = image.base64_to_rgb_image(b64)
        image_store = image.Image(img)
    except Exception as e:
        raise HTTPException(status_code=400,detail=f"Error uploading image to the server: {str(e)}")

@app.post("/api/resize")
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
    image: base64
    success: True
    }
    """
    try:
        body = await request.json()
        image_b64 = body.get("image")
        height = int(body.get("height")) if body.get("height") else None
        width = int(body.get("width")) if body.get("width") else None
        aspect_ratio = bool(body.get("aspect_ratio")) if body.get("aspect_ratio") else True

        img = image.base64_to_rgb_image(image_b64)

        if height is None and width is None:
            raise HTTPException(status_code=400, detail="Both width and height must be provided.")
        if height is None:
            new_img = image.resize_image(img,height=height,aspect_ratio=aspect_ratio)
        if width is None:
            new_img = image.resize_image(img,width=width,aspect_ratio=aspect_ratio)
        else:
            new_img = image.resize_image(img,width=width,height=height,aspect_ratio=aspect_ratio)
        
        new_img_b64 = image.rgb_image_to_base64(new_img)

        return {"image": new_img_b64}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/api/grayscale")
async def make_grayscale(request: Request):
    """
    Expects request object
    {
        "image": base64
    }

    Convert image to grayscale

    returns response
    {
        "image": base64
    }
    """
    try:
        body = await request.json()
        image_b64 = body.get("image")
       
        img = image.base64_to_rgb_image(image_b64)

        new_img = image.convert_to_grayscale(img)
        
        new_img_b64 = image.rgb_image_to_base64(new_img)

        return {"image": new_img_b64}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
