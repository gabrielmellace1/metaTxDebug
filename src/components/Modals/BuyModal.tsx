import React, { useEffect, useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Box, HStack, VStack, Text, RadioGroup, Radio, Button } from '@chakra-ui/react';
import { useMarketplace } from '../../context/marketplace.context';
import { ethers } from 'ethers';
import InformationModal from './InformationModal';
import ConfirmModal from './ConfirmModal';
import { DGMarketplaceInstance } from 'dg-marketplace-sdk';
import { useAuth } from '../../context/auth.context';


type BuyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  totalCost:number;
  tokenIds:string[];
  stateSelected:boolean;
};

const BuyModal: React.FC<BuyModalProps> = ({ isOpen, onClose,totalCost,tokenIds,stateSelected }) => {


    let { userAddress } = useAuth();
     
  const [selectedOption, setSelectedOption] = useState('1'); // Initial selected option
  const { getUserBalanceAndAllowance, approveIce,fetchTransactionStatus,buyNFT } = useMarketplace();


  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalHeader,setInfoModalHeader] = useState("");
  const [infoModalBody,setInfoModalBody] = useState("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalHeader, setConfirmModalHeader] = useState("");
  const [confirmModalBody, setConfirmModalBody] = useState("");

  const [showConfirmPurchase, setConfirmPurchase] = useState(false);
  const [confirmPurchaseHeader, setConfirmPurchaseHeader] = useState("");
  const [confirmPurchaseBody, setConfirmPurchaseBody] = useState("");
  


  const handleOptionChange = (value: string) => setSelectedOption(value);

  const handleBuyClick = async () => {
        switch(selectedOption) {
            case '1':
                const { balance, allowance } = await getUserBalanceAndAllowance();
                const balanceInWei = ethers.utils.parseEther(balance.toString()).toBigInt();
                console.log(totalCost);
                

                if (balanceInWei < totalCost) {
                    setInfoModalHeader("Insufficient balance")
                    setInfoModalBody("Oops, looks like you don't have enough balance to complete this purchase.")
                    setShowInfoModal(true);

                }
                else {

                    if (allowance >= totalCost*999999999999999999999999999999999999999999999999999999999) {
                        
                        setConfirmPurchaseHeader("Confirm purchase?");
                        setConfirmPurchaseBody("You are about to buy squares for a total of "+ethers.utils.formatEther(totalCost.toString())+" BAG");
                        console.log(totalCost);
                        setConfirmPurchase(true);


                      } else {
      
                          setConfirmModalHeader("Spending authorization required");
                          setConfirmModalBody("In order to perform the purchase, you need to authorize the marketplace to spend your BAG tokens and receive your square NFTs");
                          setShowConfirmModal(true);
                          
                          
                          console.log("Allowance not enough");
                          return;
                      }

                } 

                
                

            break;

            case '2':
                console.log("bsd");
            break;
        }
  };


  const handleAllowanceConfirm = async () => { // Function to handle user confirmation
    try {
      const tx = await approveIce();
      
      setInfoModalHeader("Processing authorization");
      setInfoModalBody("The transaction is being processed, one moment please. Tx hash: " + tx);
      setShowConfirmModal(false); // Close confirmation modal
      setShowInfoModal(true); // Open informative modal

      try {
        const status = await fetchTransactionStatus(tx,setInfoModalHeader,setInfoModalBody); // Use the context function
        

        if (status?.status) {
          setInfoModalHeader("Authorization succesfull");
          setInfoModalBody("The authorization has been process sucesfully");
        } else {
          setInfoModalHeader("Upps, authorization failed");
          setInfoModalBody("There was an error processing the authorization");
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
  };

  
  const handleBuyConfirm = async () => {
    try {


        let nftAddress = stateSelected? "0xA77aC08d191c2390f692e5d1Fa0B98c7e40F573f":"0x9Dbd35E3c27d4494f2d87539De830cfd42037c5E";
        
        if(userAddress) {
            const tx = await buyNFT(userAddress,nftAddress,tokenIds[0],totalCost.toString());
            setInfoModalHeader("Processing purchase");
            setInfoModalBody("The purchase is being processed, one moment please. Tx hash: " + tx);
            setShowConfirmModal(false); // Close confirmation modal
            setShowInfoModal(true); // Open informative modal
    
            try {
            const status = await fetchTransactionStatus(tx,setInfoModalHeader,setInfoModalBody); // Use the context function
            
    
            if (status?.status) {
                setInfoModalHeader("Purchase succesfull");
                setInfoModalBody("The purchase has been process succesfully");
            } else {
                setInfoModalHeader("Upps, purchase failed");
                setInfoModalBody("There was an error processing the purchase");
            }
            } catch (error) {
            console.error("Error getting transaction status:", error);
            setInfoModalHeader("Transaction Status Unknown");
            setInfoModalBody("Unable to retrieve transaction status. Please try again later.");
            } finally {
            // Reset txHash after checking status
            
            }
        }
        
        
        
  
  
      } catch (error) {
        console.error("Error approving BAG:", error);
        // Handle error appropriately, e.g., show error message to user
      }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Buy Confirmation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Please select your payment option:</Text>
            <RadioGroup onChange={handleOptionChange} value={selectedOption}>
              <VStack spacing={2}>
                <Radio value="1">BAG</Radio>
                <Radio value="2">Binance</Radio>
                {/* Add more Radio options as needed */}
              </VStack>
            </RadioGroup>
            <Button colorScheme="blue" mt={4} onClick={handleBuyClick}>
              Buy
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
      {showInfoModal && (
      <InformationModal isOpen={showInfoModal} header={infoModalHeader} text={infoModalBody} setShowInfoModal={setShowInfoModal} />
        )}
        {showConfirmModal && (
            <ConfirmModal isOpen={showConfirmModal} header={confirmModalHeader} body={confirmModalBody} onConfirm={handleAllowanceConfirm} setShowConfirmModal={setShowConfirmModal} />
        )}
        {showConfirmPurchase && (
            <ConfirmModal isOpen={showConfirmPurchase} header={confirmPurchaseHeader} body={confirmPurchaseBody} onConfirm={handleBuyConfirm} setShowConfirmModal={setConfirmPurchase} />
        )}
    </>
  );
};

export default BuyModal;