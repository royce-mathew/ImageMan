"use client";

import { ImageMenu } from "@/lib/custom/image-menu";
import { ModeToggle } from "@/lib/custom/mode-toggle";
import Image from "next/image";
import { Input } from "@/components/ui/input"
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { FileUploader } from "@/lib/custom/file-uploader";
import Toolset from "@/lib/custom/toolset";

export default function Home() {
  const [currentFile, setCurrentFile] = useState<File[]>([]);
  const [currentImage, setCurrentImage] = useState<File>();

  // When the currentFile changes, update the currentImage
  useEffect(() => {
    if (currentFile.length > 0) {
      console.log(currentFile[0]);
      setCurrentImage(currentFile[0]);
    }
  }, [currentFile]);
  

  // useEffect(() => {
  //   setCurrentImage("/next.svg");
  // }, []); // Add an empty dependency array to run this effect only once

  return (
    <main>
      {/* Canvas */}
      <div className="flex flex-col mx-10 py-10 px-10">
        <ImageMenu />
        <div className="bg-foreground/10 mx-3 py-2 px-2 aspect-square max-h-fit flex flex-row justify-between space-x-3">
          <Toolset onButtonPressed={(ButtonName) => { console.log(ButtonName); return ButtonName; }} />
          <div className="flex-1">
            {currentImage ? (
              <Image
                src={URL.createObjectURL(currentImage)}
                alt="Vercel Logo"
                width={1080}
                height={1920}
                className="w-full h-full object-contain bg-background/20 rounded"
              />
            ) : (
              <FileUploader onValueChange={setCurrentFile}/>
            )}
          </div>
        </div>
        
      </div>
    </main>
  );
}