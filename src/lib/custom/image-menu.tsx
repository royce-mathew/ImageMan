import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Redo, Undo } from "lucide-react";
import { useEffect } from "react";

interface ImageMenuProps {
  onItemClick: (itemName: string) => void;
  states: {
    "undo": number;
    "redo": number;
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
    </Menubar>
    </>
  );
}