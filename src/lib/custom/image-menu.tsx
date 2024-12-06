import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Menu, Redo, Undo } from "lucide-react";
import { useEffect } from "react";

interface ImageMenuProps {
  onItemClick: (itemName: string) => void;
  states: {
    [key: string]: number;
  };
}

export function ImageMenu({ onItemClick, states }: ImageMenuProps) {
  const handleItemClick = (itemName: string) => {
    if (onItemClick) {
      onItemClick(itemName);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 't') {
        event.preventDefault();
        handleItemClick('New Image');
      }
      if (event.metaKey === false && event.ctrlKey === false) return;
      if (event.key === 'p') {
        handleItemClick('Print');
      } else if (event.key === 'z') {
        handleItemClick('Undo');
      } else if (event.shiftKey && event.key === 'Z') {
        handleItemClick('Redo');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => handleItemClick('New Image')}>
            New Image <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={() => handleItemClick('Print')}>
            Print... <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <Dialog>
            <DialogTrigger asChild>
             <Button className="w-full">Properties</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Properties</DialogTitle>
                <DialogDescription>View the properties of the image</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col space-y-5">
                <Label>
                  Width: {states.width}
                </Label>
                <Label>
                  Height: {states.height}
                </Label>
              </div>
            </DialogContent>
          </Dialog>
         
        </MenubarContent>
      </MenubarMenu>
       
      <MenubarMenu>
        <Button disabled={states.undo <= 0} className="tool" size="icon" onClick={() => handleItemClick('Undo')}>
          <Undo />
        </Button>
        <Button disabled={states.redo <= 0} className="tool" size="icon" onClick={() => handleItemClick('Redo')}>
          <Redo />
        </Button>
      </MenubarMenu>
      <div className="flex grow justify-end px-2">
        {states.undo} changes
      </div>
    </Menubar>
    </>
  );
}