import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DialogDescription, DialogTrigger } from '@radix-ui/react-dialog';
import { CropIcon, RotateCwIcon, Sparkles, ZapIcon } from 'lucide-react';
import React from 'react';

interface ToolsetProps {
    onButtonPressed: (ButtonName: string) => void;
}

const Toolset: React.FC<ToolsetProps> = ({ onButtonPressed }) => {
    const handleButtonClick = (ButtonName: string, params?: {}) => {
        onButtonPressed(ButtonName);
    };

    return (
        <div className="grid space-y-2 place-content-start">
            <Button className="tool" size='icon' onClick={() => handleButtonClick('Rotate')}><RotateCwIcon/></Button>
            <Button className="tool" size='icon' onClick={() => handleButtonClick('Crop')}><CropIcon/></Button>
            <Button className="tool" size='icon' onClick={() => handleButtonClick('Draw')}>Draw</Button>
            <Button className="tool" size='icon' onClick={() => handleButtonClick('Text')}>Text</Button>
            <Button className="tool" size='icon' onClick={() => handleButtonClick('Shapes')}>Shapes</Button>
            <Dialog>
                <DialogTrigger asChild>
                <Button className="tool" size='icon' onClick={() => handleButtonClick('Filters')}>
                    <Sparkles/>
                </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Filters</DialogTitle>
                        <DialogDescription>Apply filters to the image</DialogDescription>
                    </DialogHeader>
                    <div className="grid space-y-2 place-content-start">
                        <Button className="tool text-xs" onClick={() => handleButtonClick('Grayscale')}>Grayscale</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="tool" size='icon' onClick={() => handleButtonClick('Settings')}><ZapIcon/></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adjustments</DialogTitle>
                        <DialogDescription>Make visual adjustments to the image</DialogDescription>
                    </DialogHeader>
                    <div className="grid space-y-2 place-content-start">
                        <Button className="tool" size='icon' onClick={() => handleButtonClick('Settings')}>Settings</Button>
                        <Button className="tool" size='icon' onClick={() => handleButtonClick('Help')}>Help</Button>
                    </div>
                </DialogContent>
                    
            </Dialog>
        </div>
    );
};

export default Toolset;