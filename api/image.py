import cv2
import numpy as np
class Image:
    def __init__(self, numpy_array, layers={}):
        self.image = numpy_array
        if not layers:
            self.layers["layer1"] = self.image
    def add_layer(self, layer):
        self.layers.update(layer)

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