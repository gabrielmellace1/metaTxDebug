import React, { useEffect, useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Box, HStack, VStack, Text, RadioGroup, Radio, Button } from '@chakra-ui/react';
import { useMarketplace } from '../../context/marketplace.context';
import { ethers } from 'ethers';
import InformationModal from './InformationModal';
import ConfirmModal from './ConfirmModal';
import { DGMarketplaceInstance } from 'dg-marketplace-sdk';


type BuyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  totalCost:number;
  tokenIds:string[];
  stateSelected:boolean;
};

const BuyModal: React.FC<BuyModalProps> = ({ isOpen, onClose,totalCost,tokenIds,stateSelected }) => {
  const [selectedOption, setSelectedOption] = useState('1'); // Initial selected option
  const { getUserBalanceAndAllowance, approveIce,fetchTransactionStatus } = useMarketplace();


  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalHeader,setInfoModalHeader] = useState("");
  const [infoModalBody,setInfoModalBody] = useState("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalHeader, setConfirmModalHeader] = useState("");
  const [confirmModalBody, setConfirmModalBody] = useState("");
  
  const [txHash, setTxHash] = useState(null); // To store the transaction hash
  const [transactionStatus, setTransactionStatus] = useState(null);

  const handleOptionChange = (value: string) => setSelectedOption(value);

  const handleBuyClick = async () => {
        switch(selectedOption) {
            case '1':
                const { balance, allowance } = await getUserBalanceAndAllowance();
                const balanceInWei = ethers.utils.parseEther(balance.toString()).toBigInt();
                console.log(balance);
                console.log(balanceInWei);
                if (balanceInWei >= totalCost) {
                  console.log("Balance okay");
                  
                } else {
                    console.log(balance);
                  
                  setInfoModalHeader("Insufficient balance")
                  setInfoModalBody("Oops, looks like you don't have enough balance to complete this purchase.")
                  setShowInfoModal(true);
                }
          
                console.log(allowance);
                if (allowance >= totalCost*5000000000000000000000000000000000000000000000000000000000000000000000000000000) {
                  console.log("Allowance okay");
                } else {

                    setConfirmModalHeader("Spending authorization required");
                    setConfirmModalBody("In order to perform the purchase, you need to authorize the marketplace to spend your BAG tokens and receive your square NFTs");
                    setShowConfirmModal(true);
                    
                    console.log("Allowance not enough");
                    return;
                }

            break;

            case '2':
                console.log("bsd");
            break;
        }
  };


  const handleConfirmModal = async () => { // Function to handle user confirmation
    try {
      const tx = await approveIce();
      setTxHash(tx); // Store the transaction hash
      setInfoModalHeader("Processing authorization");
      setInfoModalBody("The transaction is being processed, one moment please. Tx hash: " + tx);
      setShowConfirmModal(false); // Close confirmation modal
      setShowInfoModal(true); // Open informative modal

      try {
        const status = await fetchTransactionStatus(tx,setInfoModalHeader,setInfoModalBody); // Use the context function
        setTransactionStatus(status);

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
        setTxHash(null);
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
            <ConfirmModal isOpen={showConfirmModal} header={confirmModalHeader} body={confirmModalBody} onConfirm={handleConfirmModal} setShowConfirmModal={setShowConfirmModal} />
        )}
    </>
  );
};

export default BuyModal;