import React, { useState } from 'react';
import EditorGrid from './EditorGrid';
import EditorPicture from './EditorPicture';

interface Square {
  x: number;
  y: number;
}

const ParentComponent: React.FC = () => {
  const [previewUrl, setPreviewUrl] = useState('');

  const squareSize: number = 10; // Size of each square
  const gridRows: number = 50; // Total number of squares vertically
  const gridCols: number = 50; // Total number of squares horizontally


  const ownedSquares: Square[] = [
    { x: 500, y: 500 }, { x: 501, y: 500 }, { x: 502, y: 500 }, { x: 503, y: 500 }, { x: 504, y: 500 },
    { x: 505, y: 500 }, { x: 506, y: 500 }, { x: 507, y: 500 }, { x: 508, y: 500 }, { x: 509, y: 500 },
    { x: 500, y: 501 }, { x: 501, y: 501 }, { x: 502, y: 501 }, { x: 503, y: 501 }, { x: 504, y: 501 },
    { x: 505, y: 501 }, { x: 506, y: 501 }, { x: 507, y: 501 }, { x: 508, y: 501 }, { x: 509, y: 501 },
    { x: 500, y: 502 }, { x: 501, y: 502 }, { x: 502, y: 502 }, { x: 503, y: 502 }, { x: 504, y: 502 },
    { x: 505, y: 502 }, { x: 506, y: 502 }, { x: 507, y: 502 }, { x: 508, y: 502 }, { x: 509, y: 502 },
    
    { x: 500, y: 505 }, { x: 501, y: 505 }, { x: 502, y: 505 }, { x: 503, y: 505 }, { x: 504, y: 505 },
    { x: 505, y: 505 }, { x: 506, y: 505 }, { x: 507, y: 505 }, { x: 508, y: 505 }, { x: 509, y: 505 },
    { x: 500, y: 506 }, { x: 501, y: 506 }, { x: 502, y: 506 }, { x: 503, y: 506 }, { x: 504, y: 506 },
    { x: 505, y: 506 }, { x: 506, y: 506 }, { x: 507, y: 506 }, { x: 509, y: 506 },
    { x: 500, y: 507 }, { x: 501, y: 507 }, { x: 502, y: 507 }, { x: 503, y: 507 }, { x: 504, y: 507 },
    { x: 505, y: 507 }, { x: 506, y: 507 }, { x: 507, y: 507 }, { x: 508, y: 507 }, { x: 509, y: 507 },
    { x: 500, y: 508 }, { x: 501, y: 508 }, { x: 502, y: 508 }, { x: 503, y: 508 }, { x: 504, y: 508 },
    { x: 505, y: 508 }, { x: 506, y: 508 }, { x: 507, y: 508 }, { x: 508, y: 508 }, { x: 509, y: 508 },
    { x: 500, y: 509 }, { x: 501, y: 509 }, { x: 502, y: 509 }, { x: 503, y: 509 }, { x: 504, y: 509 },
    { x: 505, y: 509 }, { x: 506, y: 509 }, { x: 507, y: 509 }, { x: 508, y: 509 }, { x: 509, y: 509 }
  ];
  
  

  const minX = Math.min(...ownedSquares.map(sq => sq.x));
  const minY = Math.min(...ownedSquares.map(sq => sq.y));
  const maxX = Math.max(...ownedSquares.map(sq => sq.x));
  const maxY = Math.max(...ownedSquares.map(sq => sq.y));

  const pictureWidth = (maxX - minX + 1) * squareSize; // 10 pixels per square
  const pictureHeight = (maxY - minY + 1) * squareSize; // 10 pixels per square

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <div style={{ flex: 1 }}>
        <EditorPicture setPreviewUrl={setPreviewUrl} width={pictureWidth} height={pictureHeight}   />
      </div>
      <div style={{ flex: 1 }}>
        <EditorGrid previewUrl={previewUrl} ownedSquares={ownedSquares} 
        minX={minX} minY={minY} maxX={maxX} maxY={maxY} 
        squareSize={squareSize} gridRows={gridRows} gridCols={gridCols} />
      </div>
    </div>
  );
};

export default ParentComponent;
