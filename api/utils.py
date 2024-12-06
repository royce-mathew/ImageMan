from functools import wraps
from fastapi import HTTPException 
def validate_image(func):
    """
    make sure the function is async

    checks if image_store exists (None or not None)
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        from api.index import image_store, HTTPException
        if image_store is None:
            raise HTTPException(status_code=400, success=False, detail="No image stored in backend")
        return await func(*args, **kwargs)
    
    return wrapper

def server_exception_handler(status_code=500, detail=""):
    """
    default status_code=500

    default detail="" + Exception as string

    raises HTTPException if something goes wrong
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                raise HTTPException(status_code=status_code, detail=f"{detail} {str(e)}")
        return wrapper
    return decorator
