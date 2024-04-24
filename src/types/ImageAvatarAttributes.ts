// ImageAvatarAttributes.ts
export type ImageAvatarAttributes = {
  image: string | File;
  width: number;
  height: number;
  border?: number | number[];
  borderRadius?: number;
  color?: number[];
  backgroundColor?: string;
  style?: React.CSSProperties;
  scale: number;
  position?: { x: number, y: number };
  rotate?: number;
  crossOrigin?: 'anonymous' | 'use-credentials';
  className?: string;
  disableCanvasRotation: boolean;
  isTransparent: boolean;
  showGrid: boolean;
  preview?: {
    img: string;
    rect: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    scale: number;
    width: number;
    height: number;
    borderRadius: number;
  };
  onLoadFailure?: (event: Event) => void;
  onLoadSuccess?: (imgInfo: any) => void;
  onImageReady?: (event: Event) => void;
  onMouseUp?: () => void;
  onMouseMove?: (event: MouseEvent) => void;
  onImageChange?: () => void;
  onPositionChange?: (position: { x: number, y: number }) => void;
  disableBoundaryChecks?: boolean;
  disableHiDPIScaling?: boolean;
  allowZoomOut?:boolean;
};
