import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { DialogDescription, DialogTrigger } from '@radix-ui/react-dialog';
import { DropdownMenuSubContent, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { stat } from 'fs';
import { CropIcon, RotateCwIcon, Sparkles, ZapIcon } from 'lucide-react';
import React, { useEffect } from 'react';

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
                <DropdownMenuTrigger asChild>
                    <Button className="tool" size='icon' onClick={() => handleButtonClick('Rotate')}><RotateCwIcon/></Button>
                </DropdownMenuTrigger>
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
                    <Button className="tool mt-5" onClick={() => handleButtonClick('Rotate', {angle: rotateAngle})}>Apply</Button>
                </DropdownMenuContent>

            </DropdownMenu>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="tool" size='icon'><CropIcon/></Button>
                </DialogTrigger>
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
                <DialogTrigger asChild>
                <Button className="tool" size='icon' onClick={() => handleButtonClick('Filters')}>
                    <Sparkles/>
                </Button>
                </DialogTrigger>
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
                    <Button className="w-full" onClick={() => handleButtonClick('Grayscale')}>Grayscale</Button>
                    </div>
                   
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Toolset;