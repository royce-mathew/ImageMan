import cv2
import numpy as np
from PIL import Image
from base64 import b64decode, b64encode

class Image:
    def __init__(self, numpy_array, layers=None):
        self.image = numpy_array
        self.layers = layers if layers is not None else {"layer1": self.image.copy()}
        self.layer_count = 1
        self.current_layer = next(iter(layers))
        self.undo_stack = []
        self.redo_stack = []

    def __array__(self, dtype=None):
        return self.image.astype(dtype) if dtype else self.image
    
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
        self.undo_stack(state)
    
    def apply_changes(self, new_image):
        if not isinstance(new_image, np.ndarray):
            raise ValueError("Input must be a NumPy array.")
        self._save_state()
        self.image = new_image
        self.layers[self.current_layer] = self.image
        self.redo_stack.clear()
    
    def undo(self):
        if not self.undo_stack:
            raise ValueError("Nothing to undo")
        self.redo_stack.append((self.image.copy(), {k: v.copy() for k, v in self.layers.items()}))
        self.image, self.layers = self.undo_stack.pop()
    
    def redo(self):
        if not self.redo_stack:
            raise ValueError("Nothing to redo")
        self.undo_stack.append((self.image.copy(), {k: v.copy() for k, v in self.layers.items()}))
        
        self.image, self.layers = self.redo_stack.pop()

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
    return cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)