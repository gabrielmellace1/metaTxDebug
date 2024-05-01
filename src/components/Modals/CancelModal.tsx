import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, VStack, Text, Button } from '@chakra-ui/react';


import InformationModal from './InformationModal';


import useMetaTx from '../../hooks/contracts/useMetaTx';
import useTxChecker from '../../hooks/contracts/useTxChecker';
import useMarketplace from '../../hooks/contracts/useMarketplace';

import { addresses } from '../../hooks/contracts/contractConfigs';

type CancelModalProps = {
    isOpen: boolean;
    onClose: () => void;
    tokenIds:string[];
    stateSelected:boolean;
};

const CancelModal: React.FC<CancelModalProps> = ({ isOpen, onClose, tokenIds,stateSelected }) => {
  
 

  const metaTx = useMetaTx();
  const txChecker = useTxChecker();
  const marketplace = useMarketplace();


  let nftAddress = stateSelected? addresses.state:addresses.square;
 
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalHeader, setInfoModalHeader] = useState("");
  const [infoModalBody, setInfoModalBody] = useState("");

  const handleCancelClick = async () => {
    if (!marketplace) {
      setInfoModalHeader("Marketplace not available");
      setInfoModalBody("The marketplace contract is not available at the moment.");
      setShowInfoModal(true);
      return;
    }
    try {

     

      if(!await marketplace.areOrdersActive(nftAddress,tokenIds)) {
        setInfoModalHeader("Cancelation failed");
        setInfoModalBody("One or more of the items you have selected are no longer for sale");
        setShowInfoModal(true); // Open informative modal
        return;
      }
      try {
        const tx = await metaTx('marketplace','cancel',[ nftAddress,tokenIds]);
        console.log("Tx is:"+tx);
        setInfoModalHeader("Processing cancel");
        setInfoModalBody("The transaction is being processed, one moment please. Tx hash: " + tx);
        setShowInfoModal(true); // Open informative modal
  
        try {
          if(tx){
            const status = await txChecker.checkTransactionStatus(tx,setInfoModalHeader,setInfoModalBody); // Use the context function
          
  
            if (status?.status) {
              setInfoModalHeader("Cancel succesfull");
              setInfoModalBody("Your items have been removed from the marketplace");
            } else {
              setInfoModalHeader("Upps, cancel failed");
              setInfoModalBody("There was an error while removing your items for sale");
            }
          }
          
        } catch (error) {
          console.error("Error getting transaction status:", error);
          setInfoModalHeader("Transaction Status Unknown");
          setInfoModalBody("Unable to retrieve transaction status. Please try again later.");
        } 
  
  
      } catch (error) {
        console.error("Error approving BAG:", error);
        // Handle error appropriately, e.g., show error message to user
      }

    
    

    } catch (error) {
      
    }
  };



  return (
    <>
     <Modal isOpen={isOpen} onClose={onClose}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Cancel marketplace listing</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <VStack spacing={4}>
        <Text>You are about to cancel the selected items published for sale.</Text>
        <Button colorScheme="red" mt={4} onClick={handleCancelClick}>
          Confirm
        </Button>
        <Button colorScheme="gray" mt={4} onClick={onClose}>
          Close
        </Button>
      </VStack>
    </ModalBody>
  </ModalContent>
</Modal>
{showInfoModal && (
  <InformationModal isOpen={showInfoModal} header={infoModalHeader} text={infoModalBody} setShowInfoModal={setShowInfoModal} />
)}

     
    </>
  );
};

export default CancelModal;
