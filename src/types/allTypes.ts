export interface Square {
    x: number;
    y: number;
  }

  // export  interface EditorGridProps {
  //   previewUrl: string;
  //   ownedSquares: Square[];
  //   minX:number;
  //   minY:number;
  //   maxX:number;
  //   maxY:number;
  //   squareSize:number;
  //   gridRows:number;
  //   gridCols:number;
  // }


  export  interface EditorGridProps {
   previewUrl: string;
   editorSquares: EditorSquare[];
    setEditorSquares: React.Dispatch<React.SetStateAction<EditorSquare[]>>;
    minX:number;
  minY:number;
   maxX:number;
   maxY:number;
   squareSize:number;
   gridRows:number;
  gridCols:number;
  }

  export interface EditorSquare {
    originalSquare: Square;
    tokenId: number;
    stateId: number;
    normalizedSquare?: Square;
    hashId?: string;
    blob?: Blob; // Changed from string to Blob
    base64?: string;
  }
  