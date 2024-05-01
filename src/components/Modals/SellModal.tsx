import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, VStack, Text, Button, Input } from '@chakra-ui/react';

import { ethers } from 'ethers';
import InformationModal from './InformationModal';
import ConfirmModal from './ConfirmModal';

import useMetaTx from '../../hooks/contracts/useMetaTx';
import useTxChecker from '../../hooks/contracts/useTxChecker';
import useMarketplace from '../../hooks/contracts/useMarketplace';
import useSquare from '../../hooks/contracts/useSquare';
import useStateContract from '../../hooks/contracts/useState';
import { addresses } from '../../hooks/contracts/contractConfigs';

type SellModalProps = {
    isOpen: boolean;
    onClose: () => void;
    tokenIds:string[];
    stateSelected:boolean;
};

const SellModal: React.FC<SellModalProps> = ({ isOpen, onClose, tokenIds,stateSelected }) => {
  
  console.log("asd");

  const metaTx = useMetaTx();
  const txChecker = useTxChecker();
  const marketplace = useMarketplace();
  const square = useSquare();
  let state = useStateContract();

  let nftAddress = stateSelected? addresses.state:addresses.square;
  const displayText = stateSelected 
        ? "Please enter the price for your states, the price is for each element" 
        : "Please enter the price for your squares,the price is for each element";

  const [showApproveSell, setApproveSell] = useState(false);
  const [approveHeader, setApproveHeader] = useState("");
  const [approveBody, setaAproveBody] = useState("");  


  const [price, setPrice] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalHeader, setInfoModalHeader] = useState("");
  const [infoModalBody, setInfoModalBody] = useState("");

  const handleSellClick = async () => {
    if (!marketplace) {
      setInfoModalHeader("Marketplace not available");
      setInfoModalBody("The marketplace contract is not available at the moment.");
      setShowInfoModal(true);
      return;
    }
    try {

      let isApproved = stateSelected? await state?.isApprovedForAll(addresses.marketplace) : await square?.isApprovedForAll(addresses.marketplace) ;

    if(isApproved) {
        const priceInWei = ethers.utils.parseUnits(price, "ether").toString(); // Convert ETH to wei
     
      const pricesToSend = new Array(tokenIds.length).fill(priceInWei).map(String); // Create an array of strings


      console.log(await marketplace.areOrdersActive(nftAddress,tokenIds));
      if(await marketplace.areOrdersActive(nftAddress,tokenIds)) {
  
        setInfoModalHeader("Sell failed");
        setInfoModalBody("One or more of the items you have selected are already for sale");
        setShowInfoModal(true); // Open informative modal
        return;
      }


      try {
        
        const tx = await metaTx('marketplace','sell',[ nftAddress,tokenIds,pricesToSend]);
        console.log("Tx is:"+tx);
  
        setInfoModalHeader("Processing sell");
        setInfoModalBody("The transaction is being processed, one moment please. Tx hash: " + tx);
        setApproveSell(false); // Close confirmation modal
        setShowInfoModal(true); // Open informative modal
  
        try {
          if(tx){
            const status = await txChecker.checkTransactionStatus(tx,setInfoModalHeader,setInfoModalBody); // Use the context function
          
  
            if (status?.status) {
              setInfoModalHeader("Sell succesfull");
              setInfoModalBody("Your items have been published to the marketplace");
            } else {
              setInfoModalHeader("Upps, sell failed");
              setInfoModalBody("There was an error while putting your items for sale");
            }
          }
          
        } catch (error) {
          console.error("Error getting transaction status:", error);
          setInfoModalHeader("Transaction Status Unknown");
          setInfoModalBody("Unable to retrieve transaction status. Please try again later.");
        } finally {
          // Reset txHash after checking status
         
        }
  
  
      } catch (error) {
        console.error("Error approving BAG:", error);
        // Handle error appropriately, e.g., show error message to user
      }

    }
    else {
        setApproveHeader("Authorization required");
        setaAproveBody("In order to put your NFTs for sale, you need to give permission to the marketplace to sell them. Please click on confirm to allow the marketplace.");
        setApproveSell(true);
    }

    } catch (error) {
      
    }
  };

  const handleApproveConfirm = async () => {

    const activeContract = stateSelected? 'state':'square';

    try {
        const tx = await metaTx(activeContract,'setApprovalForAll',[ addresses.marketplace,1]);
        console.log("Tx is:"+tx);
  
        setInfoModalHeader("Processing authorization");
        setInfoModalBody("The transaction is being processed, one moment please. Tx hash: " + tx);
        setApproveSell(false); // Close confirmation modal
        setShowInfoModal(true); // Open informative modal
  
        try {
          if(tx){
            const status = await txChecker.checkTransactionStatus(tx,setInfoModalHeader,setInfoModalBody); // Use the context function
          
  
            if (status?.status) {
              setInfoModalHeader("Authorization succesfull");
              setInfoModalBody("The authorization has been process succesfully");
            } else {
              setInfoModalHeader("Upps, authorization failed");
              setInfoModalBody("There was an error processing the authorization");
            }
          }
          
        } catch (error) {
          console.error("Error getting transaction status:", error);
          setInfoModalHeader("Transaction Status Unknown");
          setInfoModalBody("Unable to retrieve transaction status. Please try again later.");
        } finally {
          // Reset txHash after checking status
         
        }
  
  
      } catch (error) {
        console.error("Error making the approval, please try again:", error);
        // Handle error appropriately, e.g., show error message to user
      }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Place your elements for sale</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>{displayText}</Text>
              <Input
                placeholder="Enter price in BAG"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                step="0.01"
              />
              <Button colorScheme="red" mt={4} onClick={handleSellClick} isDisabled={!price}>
                Confirm Sell
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      {showInfoModal && (
        <InformationModal isOpen={showInfoModal} header={infoModalHeader} text={infoModalBody} setShowInfoModal={setShowInfoModal} />
      )}
      {showApproveSell && (
            <ConfirmModal isOpen={showApproveSell} header={approveHeader} body={approveBody} onConfirm={handleApproveConfirm} setShowConfirmModal={setApproveSell} />
        )}
    </>
  );
};

export default SellModal;
