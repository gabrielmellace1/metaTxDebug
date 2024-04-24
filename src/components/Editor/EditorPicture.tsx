import React, { useRef, useState, ChangeEvent } from 'react';
import AvatarEditor from 'react-avatar-editor';
import Dropzone from 'react-dropzone';
import { ImageAvatarAttributes } from '../../types/ImageAvatarAttributes';
import {
  handleScale as originalHandleScale,
  rotateScale as originalRotateScale,
} from './EditorPictureHandlers';

interface EditorPictureProps {
  setPreviewUrl: (url: string) => void;
  width: number;
  height: number;
}

const EditorPicture: React.FC<EditorPictureProps> = ({ setPreviewUrl, width, height }) => {
  const editorRef = useRef<AvatarEditor | null>(null);
  const [avatarAttributes, setAvatarAttributes] = useState<ImageAvatarAttributes>({
    image: '/avatar.png',
    width: width,
    height: height,
    border: 50,
    borderRadius: 0,
    color: [255, 255, 255, 0.6],
    scale: 1.2,
    rotate: 0,
    disableCanvasRotation: true,
    isTransparent: false,
    showGrid: false,
    disableBoundaryChecks: true,
    allowZoomOut: true,
    backgroundColor: undefined
  });

  const handleImageChange = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      const imageUrl = canvas.toDataURL();
      setPreviewUrl(imageUrl);
    }
  };

  const handleFileChange = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      // Assert that e.target is not null with the non-null assertion operator (!)
      const target = e.target!;
      if (target.result) {
        setAvatarAttributes(prev => ({ ...prev, image: target.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };


  const handleScale = (e: ChangeEvent<HTMLInputElement>) => originalHandleScale(e, setAvatarAttributes);
  const rotateScale = (e: ChangeEvent<HTMLInputElement>) => originalRotateScale(e, setAvatarAttributes);
 

  return (
    <div style={{ maxWidth: '200px', float: 'left' }}>
      <Dropzone onDrop={handleFileChange} noClick noKeyboard>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            <AvatarEditor
              ref={editorRef}
              {...avatarAttributes}
              onImageChange={handleImageChange}
              onImageReady={handleImageChange}
            />
          </div>
        )}
      </Dropzone>
      <br />
      <h3>Props</h3>
      Zoom: <input
        name="scale"
        type="range"
        onChange={handleScale}
        min={avatarAttributes.allowZoomOut ? '0.1' : '1'}
        max="2"
        step="0.01"
        defaultValue="1"
      />
      <br />
      Rotation:
      <input
        name="rotation"
        type="range"
        onChange={rotateScale}
        min="0"
        max="180"
        step="1"
        defaultValue="0"
      />
     
    </div>
  );
};

export default EditorPicture;
