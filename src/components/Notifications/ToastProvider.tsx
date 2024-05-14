// src/components/ToastProvider.tsx
import React, { useEffect, ReactNode } from 'react';
import { Flip, ToastContainer, toast } from 'react-toastify';
import { ethers } from 'ethers';
import 'react-toastify/dist/ReactToastify.css';
import { getContractConfig,addresses } from '../../hooks/contracts/contractConfigs';
import { tokenIdToPosition } from '../../helpers/GridHelper';

interface ToastProviderProps {
    children: ReactNode;
  }
  

  const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  useEffect(() => {
    const provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com');

    const marketplace = getContractConfig('marketplace');
    const square = getContractConfig('square');


    const marketplaceContract = new ethers.Contract(marketplace.address,marketplace.abi , provider);
    const squareContract =  new ethers.Contract(square.address,square.abi , provider);

    // Example event listener for the Buy event
    marketplaceContract.on('Buy', (nftAddress, tokenIds, msgSender, _beneficiaries, _event) => {
      if (nftAddress.toLowerCase() === square.address.toLowerCase() ) {
        const position = tokenIdToPosition(tokenIds[0]);
            
        toast(`🦄 ${msgSender} bought the square at [${position.x},${position.y}]`, {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Flip,
            });
      }
      else if(nftAddress.toLowerCase() === addresses.state.toLowerCase() ) {
        toast(`🦄 ${msgSender} bought the state number ${tokenIds[0]}`, {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Flip,
            });


       
      }
    });
    squareContract.on('SquaresImagesUpdated', (tokenIds, _squareImageCID, _clickableURL, _title, _event) => {

          const position = tokenIdToPosition(tokenIds[0]);
              
          toast(`🦄 Content at [${position.x},${position.y}] has been updated`, {
              position: "bottom-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              transition: Flip,
              });
        
      
      });

    // Clean up the listener when the component unmounts
    return () => {
        marketplaceContract.removeAllListeners();
    };
  }, []);

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      {children}
    </>
  );
};

export default ToastProvider;
