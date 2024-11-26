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
import { on } from "events";


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


  function onCommandRan(command: string, base64Image: string, params?: {}) {
    console.log("Command ran:", command);
    if (command === "Grayscale") {
      fetch("http://localhost:5000/grayscale", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      })
      .then(setImageOnResponse)
      .catch((error) => {
        console.error('Error:', error);
      });
    }
  }

  
  function setImageOnResponse(response: Response) {
    if (response.ok) {
      response.json().then((data) => {
        const base64Image = data.image;
        const byteCharacters = atob(base64Image);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        const newFile = new File([blob], 'grayscale.png', { type: 'image/png' });
        setCurrentImage(newFile);
      }).catch((error) => {
        console.error("Error parsing JSON response:", error);
      });
    } else {
      console.error("Error in response:", response.statusText);
    }
  }


  function onButtonPressed(buttonName: string, params?: {}) {
    if (!currentImage) return;
    // Convert to base64 image
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result?.toString();
      if (result) {
        const base64Image = result.split(',')[1];
        if (base64Image) {
          onCommandRan(buttonName, base64Image, params);
        }
      }
    };
    // When the file is read, set the current image to the file
    reader.readAsDataURL(currentImage);
  }

  

  // useEffect(() => {
  //   setCurrentImage("/next.svg");
  // }, []); // Add an empty dependency array to run this effect only once

  return (
    <main>
      {/* Canvas */}
      <div className="flex w-full py-10 px-10 justify-center">
        <div className="w-[2000px]">
          <ImageMenu />
          <div className="bg-foreground/10 mx-3 py-2 px-2 flex flex-row justify-between space-x-3">
            <Toolset onButtonPressed={onButtonPressed} />
            <div className="flex-1">
              {currentImage ? (
                <Image
                  src={URL.createObjectURL(currentImage)}
                  alt="Vercel Logo"
                  width={1080}
                  height={1920}
                  className="w-full max-h-[800px] object-contain py-2 bg-background/20 rounded"
                />
              ) : (
                <FileUploader onValueChange={setCurrentFile}/>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}