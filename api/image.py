import cv2
import numpy as np
# from PIL import Image
from base64 import b64decode, b64encode
import matplotlib.pyplot as plt
from fastapi import HTTPException
from scipy.signal import convolve2d

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
        return {
            "undo": len(self.undo_stack), 
            "redo": len(self.redo_stack),
            "height": self.image.shape[0],
            "width": self.image.shape[1]
        }

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
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    gray_rgb = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
    return gray_rgb


def rotate_image(image, angle=90, center=None):
    (h, w) = image.shape[:2]
    angle = -angle

    if center == None:
        center = (w // 2, h // 2)
    
    rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated_image = cv2.warpAffine(image, rotation_matrix, (w, h))

    return rotated_image

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

def gaussian_blur(image, half_width):
    gauss_filter = create_gaussian_filter(half_width)
    blurred_image = np.zeros_like(image)

    for i in range(3):
        blurred_image[:, :, i] = convolve2d(image[:, :, i], gauss_filter, mode="same", boundary='symm')

    return cv2.convertScaleAbs(blurred_image)

def create_gaussian_filter(half_width) -> np.ndarray:
    filter_width = 2 * half_width + 1
    s = filter_width // 2
    x = np.linspace(-s, s, filter_width)
    y = np.linspace(-s, s, filter_width)
    xc, yc = np.meshgrid(x, y)
    gaussian_filter = create_gaussian_xy(xc, yc, half_width)
    normalized = gaussian_filter / np.sum(gaussian_filter) # normalize the filter

    return normalized

def create_gaussian_xy(xc, yc, half_width):
    sigma = (1/3) * half_width 
    x_gauss = g(xc, sigma)
    y_gauss = g(yc, sigma)

    return x_gauss * y_gauss

def g(x_or_y, sigma):
    input = -1 * ((x_or_y ** 2)/(2 * sigma ** 2))
    const = 1 / (np.sqrt(2 * np.pi) * sigma)
    
    return const * np.exp(input)

def adjust_saturation(image_rgb, saturation_value):
    image_hsv = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2HSV).astype(np.float32)
    image_hsv[:,:,1] = np.clip(image_hsv[:,:,1].astype(np.int16) + saturation_value, 0, 255)
    image_rgb = cv2.cvtColor(cv2.convertScaleAbs(image_hsv), cv2.COLOR_HSV2RGB)
    
    return image_rgb

def change_contrast(image, value):
    value = value / 1000
    image = image.astype(np.float32)
    constrast_image = logistics_function(image, alpha=value)

    return cv2.convertScaleAbs(constrast_image)
    
def logistics_function(x, alpha, beta=127.5):
    return 255 / (1 + np.exp(-alpha*(x - beta)))

def change_tone(image, tone_value):
    image = image.astype(np.float32)
    image[:,:,0] = image[:,:,0] + tone_value
    image[:,:,2] = image[:,:,2] - tone_value

    return cv2.convertScaleAbs(image)

def make_sepia(image):
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    gray = gray.astype(np.float32) / 255

    sepia = np.ones_like(image,dtype=np.float32)

    sepia[:,:,0] *= 255 * gray
    sepia[:,:,1] *= 204 * gray
    sepia[:,:,2] *= 153 * gray

    return cv2.convertScaleAbs(sepia)

def make_ghost(image): # very cool filter, inverts sepia to create a ghostly image
    inverted_image = cv2.bitwise_not(image)
    return inverted_image