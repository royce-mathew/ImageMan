"use client";

import { ImageMenu } from "@/lib/custom/image-menu";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FileUploader } from "@/lib/custom/file-uploader";
import Toolset from "@/lib/custom/toolset";


export default function Home() {
  const [currentFile, setCurrentFile] = useState<File[]>([]);
  const [currentImage, setCurrentImage] = useState<File>();
  const [states, setStates] = useState<{ undo: number; redo: number }>({
    "undo": 0,
    "redo": 0,
  });

  // When the currentFile changes, update the currentImage
  useEffect(() => {
    if (currentFile.length > 0) {
      setCurrentImage(currentFile[0])

      // Convert to base64 image
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result?.toString();
        if (result) {
          const base64Image = result.split(',')[1];
          if (base64Image) {
            // Upload the image to the server
            fetch("/api/py/upload", {
              method: 'POST',
              cache: 'no-cache',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ image: base64Image }),
            })
            .then((response) => {
              if (response.ok) {
                console.log("File uploaded successfully");
              } else {
                console.error("Error uploading file:", response.statusText);
              }
            })
            .catch((error) => {
              console.error('Error:', error);
            });
          }
        }
      };
      reader.readAsDataURL(currentFile[0]);
    }
  }, [currentFile]);


  // Fetch the states from the server
  useEffect(() => {
    fetch("/api/py/states", {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          setStates(data.states);
        }).catch((error) => {
          console.error("Error parsing JSON response:", error);
        });
      } else {
        console.error("Error fetching states:", response.statusText);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }, [currentImage]);

  function onCommandRan(command: string, base64Image?: string, params?: {}) {
    // Other Image functions
    if (command === "Grayscale") {
      fetch("/api/py/grayscale", {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(setImageOnResponse)
      .catch((error) => {
        console.error('Error:', error);
      });

    // Undo last action
    } else if (command === "Undo") {
      console.log("Undoing last action");
      fetch("/api/py/undo", {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(setImageOnResponse)
      .catch((error) => {
        console.error('Error:', error);
      });

    // Redo last action
    } else if (command === "Redo") {
      console.log("Redoing last action");
      fetch("/api/py/redo", {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
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
        console.log("Response:", data);
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

  

  // useEffect(() => {
  //   setCurrentImage("/next.svg");
  // }, []); // Add an empty dependency array to run this effect only once

  return (
    <main>
      {/* Canvas */}
      <div className="flex w-full py-10 px-10 justify-center">
        <div className="w-[2000px]">
          <ImageMenu onItemClick={onCommandRan} states={states}/>
          <div className="bg-foreground/10 mx-3 py-2 px-2 flex flex-row justify-between space-x-3">
            <Toolset onButtonPressed={onCommandRan} />
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