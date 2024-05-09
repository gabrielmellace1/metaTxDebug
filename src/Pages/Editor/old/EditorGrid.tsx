import React, { useRef, useEffect, useState } from 'react';
import { EditorGridProps, EditorSquare, Square } from '../../types/allTypes';



const EditorGrid: React.FC<EditorGridProps> = ({ previewUrl, editorSquares, setEditorSquares,minX,minY,maxX,maxY,squareSize,gridRows,gridCols }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);


  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  

  

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 500 * squareSize, 500 * squareSize); // Clear the canvas
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        ctx.strokeRect(col * squareSize, row * squareSize, squareSize, squareSize);
      }
    }
  };

  const drawSquareImage = (image: HTMLImageElement, square: EditorSquare, ctx: CanvasRenderingContext2D) => {
    const offsetX = square.normalizedSquare.x * squareSize;
    const offsetY = (height - 1 - square.normalizedSquare.y) * squareSize;
    const srcWidth = image.width / width;
    const srcHeight = image.height / height;
    const srcX = square.normalizedSquare.x * srcWidth;
    const srcY = (height - 1 - square.normalizedSquare.y) * srcHeight;
  
    ctx.clearRect(offsetX, offsetY, squareSize, squareSize);
    ctx.drawImage(image, srcX, srcY, srcWidth, srcHeight, offsetX, offsetY, squareSize, squareSize);
    captureSquareBlob(ctx, offsetX, offsetY, square);  // Pass the full 'square' object
  };
  
  
  const captureSquareBlob = (ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, square: EditorSquare) => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) return;
  
    tempCanvas.width = squareSize;
    tempCanvas.height = squareSize;
  
    // Draw the specific square from the main canvas to the temporary canvas
    tempCtx.drawImage(ctx.canvas, offsetX, offsetY, squareSize, squareSize, 0, 0, squareSize, squareSize);
  
    // Create blob from the temporary canvas
    tempCanvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result; // base64 string
  
          // Update state with new blob and base64 data
          setEditorSquares(prevSquares => prevSquares.map(sq => {
            if (sq.tokenId === square.tokenId) {
              return { ...sq, blob: blob, base64: base64data };
            }
            return sq;
          }));
        };
        reader.readAsDataURL(blob);  // Start reading the blob as base64
      }
    }, 'image/png');
  };
  
  
  
  
  
  

  useEffect(() => {
    if (canvasRef.current && previewUrl) {
      const ctx = canvasRef.current.getContext('2d');
      const image = new Image();
      image.onload = () => {
        ctx.clearRect(0, 0, 500 * squareSize, 500 * squareSize);
        drawGrid(ctx);
        editorSquares.forEach(square => {
          drawSquareImage(image, square, ctx);  // Pass the whole 'square' object
        });
        
      };
      image.src = previewUrl;
    }
  }, [previewUrl, squareSize, gridRows, gridCols]);

  

useEffect(() => {
  console.log("Updated editorSquares:", editorSquares);
}, [editorSquares]);



  return (
    <div>
      <canvas ref={canvasRef} width={1000} height={1000} style={{ border: '1px solid black', marginLeft: '10px' }} />
    </div>
  );
};

export default EditorGrid;
