import { Button } from '@/components/ui/button';
import { CropIcon, RotateCwIcon } from 'lucide-react';
import React from 'react';

interface ToolsetProps {
    onButtonPressed: (ButtonName: string) => void;
}

const Toolset: React.FC<ToolsetProps> = ({ onButtonPressed }) => {
    const handleButtonClick = (ButtonName: string) => {
        onButtonPressed(ButtonName);
    };

    return (
        <div className="grid space-y-2 place-content-start">
                <Button className="tool" size='icon' onClick={() => handleButtonClick('Rotate')}><RotateCwIcon/></Button>
                <Button className="tool" size='icon' onClick={() => handleButtonClick('Crop')}><CropIcon/></Button>
                <Button className="tool" size='icon' onClick={() => handleButtonClick('Draw')}>Draw</Button>
                <Button className="tool" size='icon' onClick={() => handleButtonClick('Text')}>Text</Button>
                <Button className="tool" size='icon' onClick={() => handleButtonClick('Shapes')}>Shapes</Button>
                <Button className="tool" size='icon' onClick={() => handleButtonClick('Filters')}>Filters</Button>
            </div>
    );
};

export default Toolset;