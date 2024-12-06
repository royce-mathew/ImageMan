import cv2
import numpy as np
# from PIL import Image
from base64 import b64decode, b64encode
import matplotlib.pyplot as plt
from fastapi import HTTPException

class Image:
    def __init__(self, numpy_array, layers=None):
        '''
        self.image is current image
        layers is a dictionary with "key": image, image is ndarray
        '''
        if numpy_array is None:
            raise ValueError("Input array cannot be None.")
        if not isinstance(numpy_array, np.ndarray):
            raise TypeError("Input must be a NumPy ndarray.")
        self.image = numpy_array
        self.layers = layers if layers is not None else {"layer1": self.image.copy()}

        if not self.layers:
            raise ValueError("Layers dictionary cannot be empty.")  

        self.layer_count = len(self.layers)
        self.current_layer = next(iter(self.layers))
        self.undo_stack = []
        self.redo_stack = []

    def __array__(self, dtype=None): # doesn't work for numpy operation call Image.image for that
            return self.image.astype(dtype) if dtype else self.image

    def __repr__(self):
        return f"Image({repr(self.image)})"

    def __str__(self):
        return f"{self.image}"

    def add_layer(self, layer, layer_name=None):
        self.layer_count += 1
        if not layer_name:
            layer_name = f"layer{self.layer_count}"
        self._save_state()
        self.layers[layer_name] = layer
    
    def change_layer(self, new_layer):
        raise NotImplementedError

    def remove_layer(self, layer_to_remove):
        raise NotImplementedError
    
    def _save_state(self):
        state = (self.image.copy(), {k: v.copy() for k, v in self.layers.items()})
        self.undo_stack.append(state)
    
    def apply_changes(self, new_image):
        if not isinstance(new_image, np.ndarray):
            raise ValueError("Input must be a NumPy array.")
        self._save_state()
        self.image = new_image
        self.layers[self.current_layer] = self.image
        self.redo_stack.clear()
    
    def undo(self):
        if not self.undo_stack:
            raise HTTPException(400, detail={"message":"Nothing to undo", "success":False})
        self.redo_stack.append((self.image.copy(), {k: v.copy() for k, v in self.layers.items()}))
        self.image, self.layers = self.undo_stack.pop()
    
    def redo(self):
        if not self.redo_stack:
            raise HTTPException(400, detail={"message":"Nothing to redo", "success":False})
        self.undo_stack.append((self.image.copy(), {k: v.copy() for k, v in self.layers.items()}))
        
        self.image, self.layers = self.redo_stack.pop()
        
    def get_states(self):
        print(self.redo_stack)
        return {"undo": len(self.undo_stack), "redo": len(self.redo_stack)}

def apply_selection(image, mask, function, *args, invert=False, **kwargs):
    mask = mask / 255
    if invert:
        mask = cv2.bitwise_not(mask)
    
    return function(image, mask, args, kwargs)

def crop_image(image, mask):
    image = cv2.convertScaleAbs(image)
    mask = cv2.convertScaleAbs(mask) # ensure mask is binary (0 or 1) and the shape is (rows, cols) no channels
    cropped = cv2.bitwise_and(image, image, mask=mask)
    return cv2.convertScaleAbs(cropped)

def resize_image(image, width=None, height=None, aspect_ratio=True, interpolation=cv2.INTER_AREA): 
    """
    Resizes image with aspect ratio (toggleable) using bilinear interpolation
    """
    if None == width and None == height:
        return image
    
    new_size = None
    img_h, img_w = image.shape[:2]

    if aspect_ratio:
        if  width:
            scale_h = width / img_w
            new_size = (int(scale_h * img_h), width)
        else:
            scale_w = height / img_h
            new_size =  (height,(int(scale_w * img_w)))
    else:
        if width is None:  
            new_size = (height, img_w)
        elif height is None:
            new_size = (img_h, width)
        else:
            new_size = (height, width)
    
    return cv2.resize(image, new_size, interpolation=interpolation) 

def base64_to_rgb_image(b64):
    """
    Convert a base64 string into numpy rgb image array
    """
    image_data = b64decode(b64)
    np_data = np.frombuffer(image_data, np.uint8)
    img_bgr = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    # plt.imshow(img_rgb)
    # plt.show()
    return img_rgb

def rgb_image_to_base64(img_rgb):
    """
    Convert an rgb numpy image array to base64 string
    """
    img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
    _, img_enc = cv2.imencode('.png', img_bgr)
    img_b64 = b64encode(img_enc).decode('utf-8')

    return img_b64

def convert_to_grayscale(img_rgb):
    if len(img_rgb.shape) == 2:
        img_rgb = np.stack([img_rgb] * 3, axis=-1)
        
    return cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY) 

def rotate_image():
    pass

def white_balance(image,mode='gray'):
    if "white" == mode:
        image = image.astype(np.float32)
        max_r = np.amax(image[:,:,0])
        max_g = np.amax(image[:,:,1])
        max_b = np.amax(image[:,:,2])

        scale_r = max_g / max_r
        scale_g = 1
        scale_b = max_g / max_b

        image[:,:,0] *= scale_r
        image[:,:,1] *= scale_g
        image[:,:,2] *= scale_b

        return cv2.convertScaleAbs(image)
        
    image = image.astype(np.float32)
    avg_r = np.mean(image[:,:,0])
    avg_g = np.mean(image[:,:,1])
    avg_b = np.mean(image[:,:,2])

    scale_r = avg_g / avg_r
    scale_g = 1
    scale_b = avg_g / avg_b

    image[:,:,0] *= scale_r
    image[:,:,1] *= scale_g
    image[:,:,2] *= scale_b

    return cv2.convertScaleAbs(image)

def gaussian_blur():
    pass

