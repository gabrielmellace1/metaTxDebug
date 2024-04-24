import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { ImageAvatarAttributes } from '../../types/ImageAvatarAttributes';



export const handleScale = (e: ChangeEvent<HTMLInputElement>, setState: Dispatch<SetStateAction<ImageAvatarAttributes>>) => {
    const scale = parseFloat(e.target.value);
    setState(prev => ({ ...prev, scale }));
  };


export const rotateScale = (e: ChangeEvent<HTMLInputElement>, setState: Dispatch<SetStateAction<ImageAvatarAttributes>>) => {
  const rotate = parseFloat(e.target.value);
  setState(prev => ({ ...prev, rotate }));
};



  


