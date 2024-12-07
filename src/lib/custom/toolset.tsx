import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent } from '@/components/ui/tooltip';
import { DialogDescription, DialogTrigger } from '@radix-ui/react-dialog';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { TooltipTrigger } from '@radix-ui/react-tooltip';
// import { stat } from 'fs';
import { Contrast, CropIcon, Palette, RotateCwIcon, Shell, Sparkles, SwatchBook } from 'lucide-react';
import React, { useEffect } from 'react';
import Image from 'next/image';

interface ToolsetProps {
    onButtonPressed: (ButtonName: string, params?: {}) => void;
    states: {
        [key: string]: number;
    };
}

const Toolset: React.FC<ToolsetProps> = ({ onButtonPressed, states}) => {
    const handleButtonClick = (ButtonName: string, params?: {}) => {
        onButtonPressed(ButtonName, params);
    };

    const [rotateAngle, setRotateAngle] = React.useState(90);
    const [blurAmount, setBlurAmount] = React.useState(0);
    const [contrastAmount, setContrastAmount] = React.useState(0);
    const [saturationAmount, setSaturationAmount] = React.useState(0);
    const [tonesAmount, setTonesAmount] = React.useState(0);
    const [resizeWidth, setResizeWidth] = React.useState(states.width);
    const [resizeHeight, setResizeHeight] = React.useState(states.height);
    const [aspectRatio, setAspectRatio] = React.useState(true);

    useEffect(() => {
        setResizeWidth(states.width);
        setResizeHeight(states.height);
    }, [states.width, states.height]);

    return (
        <div className="grid space-y-2 place-content-start">
            <DropdownMenu>
                <Tooltip>
                    <DropdownMenuTrigger asChild>
                        <TooltipTrigger asChild>
                            <Button className="tool" size='icon'><RotateCwIcon/></Button>
                        </TooltipTrigger>
                    </DropdownMenuTrigger>
                    <TooltipContent sideOffset={5} align='center' side='right'>
                        Rotate
                    </TooltipContent>
                </Tooltip>
                <DropdownMenuContent side='right'>
                    <DropdownMenuLabel>Rotate {rotateAngle}°</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <Slider 
                        min={0}
                        max={360} 
                        value={[rotateAngle]} 
                        onValueChange={(value) => setRotateAngle(value[0])}
                        className='w-52'
                    />
                    <Button className="tool mt-5 w-full px-5" onClick={() => handleButtonClick('Rotate', {angle: rotateAngle})}>Apply</Button>
                </DropdownMenuContent>

            </DropdownMenu>
            <Dialog>
                <Tooltip>
                    <DialogTrigger asChild>
                        <TooltipTrigger asChild>
                            <Button className="tool" size='icon'><CropIcon/></Button>
                        </TooltipTrigger>
                    </DialogTrigger>
                    <TooltipContent sideOffset={5} align='center' side='right'>
                        Resize
                    </TooltipContent>
                </Tooltip>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resize</DialogTitle>
                        <DialogDescription>Specify the new dimensions for the image</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col space-y-5">
                        <label>
                            Width:
                            <Input type="number" className="input mt-2" value={resizeWidth} onChange={(e) => setResizeWidth(Number(e.target.value))} />
                        </label>
                        <label>
                            Height:
                            <Input type="number" className="input mt-2" value={resizeHeight} onChange={(e) => setResizeHeight(Number(e.target.value))} />
                        </label>
                        <label>
                            Keep Aspect Ratio:
                            <Checkbox className='ml-2' checked={aspectRatio} onCheckedChange={(checked) => setAspectRatio(checked === true)} />
                        </label>
                        <Button className="tool" onClick={() => handleButtonClick('Resize', {
                            width: resizeWidth,
                            height: resizeHeight,
                            aspectRatio: !aspectRatio
                        })}>Apply</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog>
                <Tooltip>
                    <DialogTrigger asChild>
                        <TooltipTrigger asChild>
                            <Button className="tool" size='icon' onClick={() => handleButtonClick('Filters')}>
                                <Sparkles/>
                            </Button>
                        </TooltipTrigger>
                    </DialogTrigger>
                    <TooltipContent sideOffset={5} align='center' side='right'>
                        Filters
                    </TooltipContent>
                </Tooltip>
                <DialogContent className='flex flex-col'>
                    <DialogHeader>
                        <DialogTitle>Filters</DialogTitle>
                        <DialogDescription>Apply filters to the image</DialogDescription>
                    </DialogHeader>
                    <div className='flex flex-col space-y-3'>
                        White Balancing
                        <Separator/>
                        <Button variant="secondary" className="tool text-xs outline outline-1" onClick={() => handleButtonClick('WhiteBalance', {mode: 'gray'})}>Grey World</Button>
                        <Button variant="secondary" className="tool text-xs outline outline-1" onClick={() => handleButtonClick('WhiteBalance', {mode: 'white'})}>White World</Button>
                    </div>
                    <div className='flex flex-col space-y-3'>
                        Other
                        <Separator className=''/>
                        <div className='flex space-x-2 h-full'>
                            <Button className='p-0 w-full h-full' onClick={() => handleButtonClick('Filter', {filter: "sepia"})}>
                                <div className='w-full h-full relative group'>
                                    <Image src="/sepia.png" alt="Sepia" width={150} height={150} className='w-full h-full aspect-square transition rounded-lg group-hover:brightness-50'/>
                                    <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition'>Sepia</div>
                                </div>
                            </Button>
                            <Button className='p-0 w-full h-full' onClick={() => handleButtonClick('Filter', {filter: "grayscale"})}>
                                <div className='w-full h-full relative group'>
                                    <Image src="/grayscale.png" alt="Grayscale" width={150} height={150} className='w-full h-full aspect-square transition rounded-lg group-hover:brightness-50'/>
                                    <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition'>Grayscale</div>
                                </div>
                            </Button>
                            <Button className='p-0 w-full h-full' onClick={() => handleButtonClick('Filter', {filter: "ghost"})}>
                                <div className='w-full h-full relative group'>
                                    <Image src="/ghast.png" alt="Invert" width={150} height={150} className='w-full h-full aspect-square transition rounded-lg group-hover:brightness-50'/>
                                    <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition'>Ghost</div>
                                </div>
                            </Button>
                        </div>
                    </div>
                   
                </DialogContent>
            </Dialog>
        <DropdownMenu>
            <Tooltip>
                <DropdownMenuTrigger asChild>
                    <TooltipTrigger asChild>
                        <Button className="tool" size='icon'>
                            <Shell/>
                        </Button>
                    </TooltipTrigger>
                </DropdownMenuTrigger>
                <TooltipContent sideOffset={5} align='center' side='right'>
                    Blur
                </TooltipContent>
            </Tooltip>
            <DropdownMenuContent side='right'>
                <DropdownMenuLabel>Blur Amount {blurAmount}</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <Slider 
                    min={0}
                    max={15} 
                    value={[blurAmount]} 
                    onValueChange={(value) => setBlurAmount(value[0])}
                    className='w-52'
                />
                <Button className="tool mt-5 w-full px-5" onClick={() => handleButtonClick('Blur', {half_width: blurAmount})}>Apply</Button>
            </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
            <Tooltip>
                <DropdownMenuTrigger asChild>
                    <TooltipTrigger asChild>
                        <Button className="tool" size='icon'>
                            <Contrast/>
                        </Button>
                    </TooltipTrigger>
                </DropdownMenuTrigger>
                <TooltipContent sideOffset={5} align='center' side='right'>
                    Contrast
                </TooltipContent>
            </Tooltip>
            <DropdownMenuContent side='right'>
                <DropdownMenuLabel>Contrast Amount {contrastAmount}</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <Slider 
                    min={0}
                    max={50} 
                    value={[contrastAmount]} 
                    onValueChange={(value) => setContrastAmount(value[0])}
                    className='w-52'
                />
                <Button className="tool mt-5 w-full px-5" onClick={() => handleButtonClick('Contrast', {amount: states.contrast || 50})}>Apply</Button>
            </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
            <Tooltip>
                <DropdownMenuTrigger asChild>
                    <TooltipTrigger asChild>
                        <Button className="tool" size='icon'>
                            <Palette/>
                        </Button>
                    </TooltipTrigger>
                </DropdownMenuTrigger>
                <TooltipContent sideOffset={5} align='center' side='right'>
                    Saturation
                </TooltipContent>
            </Tooltip>
            <DropdownMenuContent side='right'>
                <DropdownMenuLabel>Saturation Amount {saturationAmount}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Slider
                    min={-100}
                    max={100}
                    value={[saturationAmount]}
                    onValueChange={(value) => setSaturationAmount(value[0])}
                    className='w-52'
                />
                <Button className="tool mt-5 w-full px-5" onClick={() => handleButtonClick('Saturation', { amount: saturationAmount })}>Apply</Button>
            </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
            <Tooltip>
                <DropdownMenuTrigger asChild>
                    <TooltipTrigger asChild>
                        <Button className="tool" size='icon'>
                            <SwatchBook/>
                        </Button>
                    </TooltipTrigger>
                </DropdownMenuTrigger>
                <TooltipContent sideOffset={5} align='center' side='right'>
                    Tones
                </TooltipContent>
            </Tooltip>
            <DropdownMenuContent side='right'>
                <DropdownMenuLabel>Tone Adjustment</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Slider
                    min={-50}
                    max={50}
                    value={[tonesAmount]}
                    onValueChange={(value) => setTonesAmount(value[0])}
                    className='w-52'
                    style={{
                        background: 'linear-gradient(to right, blue, red)',
                    }}
                />
                <Button className="tool mt-5 w-full px-5" onClick={() => handleButtonClick('Tone', { amount: tonesAmount })}>Apply</Button>
            </DropdownMenuContent>
        </DropdownMenu>
        </div>
    );
};

export default Toolset;