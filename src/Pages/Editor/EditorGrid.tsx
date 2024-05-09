import React, { useRef, useEffect } from 'react';
import { EditorGridProps, Square } from '../../types/allTypes';



const EditorGrid: React.FC<EditorGridProps> = ({ previewUrl, ownedSquares,minX,minY,maxX,maxY,squareSize,gridRows,gridCols }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  


  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  
  const normalizedSquares = ownedSquares.map(sq => ({
      x: sq.x - minX,
      y: sq.y - minY
      
  }));

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 500 * squareSize, 500 * squareSize); // Clear the canvas
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        ctx.strokeRect(col * squareSize, row * squareSize, squareSize, squareSize);
      }
    }
  };

  const drawSquareImage = (image: HTMLImageElement, square: Square, ctx: CanvasRenderingContext2D) => {
    const offsetX = square.x * squareSize;
    const offsetY = (height - 1 - square.y) * squareSize; // Invert Y coordinate
    const srcWidth = image.width / width; // Width of one slice
    const srcHeight = image.height / height; // Height of one slice
    const srcX = square.x * srcWidth; // X position to start slice
    const srcY = (height - 1 - square.y) * srcHeight; // Y position to start slice (adjust if necessary)
  
    ctx.clearRect(offsetX, offsetY, squareSize, squareSize); // Clear the area
    ctx.drawImage(image, srcX, srcY, srcWidth, srcHeight, offsetX, offsetY, squareSize, squareSize);
  };
  
  

  useEffect(() => {
    if (canvasRef.current && previewUrl) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const image = new Image();
        image.onload = () => {
          ctx.clearRect(0, 0, 500 * squareSize, 500 * squareSize);
          drawGrid(ctx);
          normalizedSquares.forEach(square => {
            drawSquareImage(image, square, ctx);
          });
        };
        image.src = previewUrl;
      }
    }
  }, [previewUrl, ownedSquares]); // Re-run effect when previewUrl or ownedSquares changes

  return (
    <div>
      <canvas ref={canvasRef} width={1000} height={1000} style={{ border: '1px solid black', marginLeft: '10px' }} />
    </div>
  );
};

export default EditorGrid;