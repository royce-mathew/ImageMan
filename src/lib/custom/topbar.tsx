import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { ModeToggle } from '@/lib/custom/mode-toggle'
import { Brush } from 'lucide-react';

const Topbar: React.FC = () => {
    return (
         <div className="flex w-full">
            <div className="flex items-center justify-between w-full px-4 py-2 bg-background">
                <div className="flex items-center space-x-2 justify-center">
                    <p className="text-primary">Image Man</p>
                    <Brush className="h-6 w-6 text-primary" />
                </div>
                <ModeToggle />
            </div>
        </div>
    );
};
export default Topbar;