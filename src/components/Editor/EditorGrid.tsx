import React, { useRef, useEffect } from 'react';

interface Square {
  x: number;
  y: number;
}

interface EditorGridProps {
  previewUrl: string;
  ownedSquares: Square[];
  minX:number;
  minY:number;
  maxX:number;
  maxY:number;
  squareSize:number;
  gridRows:number;
  gridCols:number;
}

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
    const offsetY = square.y * squareSize;
    const srcWidth = image.width / width;
    const srcHeight = image.height / height;
    const srcX = (square.x * srcWidth);
    const srcY = (square.y * srcHeight);

    ctx.clearRect(offsetX, offsetY, squareSize, squareSize); // Clear just this square area before drawing the new image
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
      <canvas ref={canvasRef} width={5000} height={5000} style={{ border: '1px solid black', marginLeft: '10px' }} />
    </div>
  );
};

export default EditorGrid;
