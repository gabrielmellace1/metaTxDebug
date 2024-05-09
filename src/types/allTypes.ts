export interface Square {
    x: number;
    y: number;
  }
  
  export  interface EditorGridProps {
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