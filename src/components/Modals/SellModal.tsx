import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, VStack, Text, Button, Input, Spinner } from '@chakra-ui/react';
import { ethers } from 'ethers';
import InformationModal from './InformationModal';
import ConfirmModal from './ConfirmModal';
import useTxChecker from '../../hooks/contracts/useTxChecker';
import useMarketplace from '../../hooks/contracts/useMarketplace';
import useSquare from '../../hooks/contracts/useSquare';
import useStateContract from '../../hooks/contracts/useState';
import { addresses } from '../../hooks/contracts/contractConfigs';
import useTx from '../../hooks/contracts/useTx';

type SellModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tokenIds: string[];
  stateSelected: boolean;
};

const SellModal: React.FC<SellModalProps> = ({ isOpen, onClose, tokenIds, stateSelected }) => {
  const txHook = useTx();
  const txChecker = useTxChecker();
  const marketplace = useMarketplace();
  const square = useSquare();
  const state = useStateContract();

  let nftAddress = stateSelected ? addresses.state : addresses.square;
  const displayText = stateSelected 
    ? "Please enter the price for your states, the price is for each element" 
    : "Please enter the price for your squares, the price is for each element";

  const [showApproveSell, setApproveSell] = useState(false);
  const [approveHeader, setApproveHeader] = useState("");
  const [approveBody, setApproveBody] = useState("");

  const [price, setPrice] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalHeader, setInfoModalHeader] = useState("");
  const [infoModalBody, setInfoModalBody] = useState("");

  const [isLoading, setIsLoading] = useState(false);


  const handleSellClick = async () => {
    setIsLoading(true);
    if (!marketplace) {
      setInfoModalHeader("Marketplace not available");
      setInfoModalBody("The marketplace contract is not available at the moment.");
      setShowInfoModal(true);
      setIsLoading(false);
      return;
    }
    try {

      

      const isApproved = stateSelected 
        ? await state?.isApprovedForAll(addresses.marketplace) 
        : await square?.isApprovedForAll(addresses.marketplace);

      if (isApproved) {
        const priceInWei = ethers.utils.parseUnits(price, "ether").toString(); // Convert ETH to wei
        const pricesToSend = new Array(tokenIds.length).fill(priceInWei).map(String); // Create an array of strings

        if (await marketplace.areOrdersActive(nftAddress, tokenIds)) {
          setInfoModalHeader("Sell failed");
          setInfoModalBody("One or more of the items you have selected are already for sale");
          setShowInfoModal(true);
          setIsLoading(false);
          return;
        }

        try {
          const tx = await txHook('marketplace', 'sell', [nftAddress, tokenIds, pricesToSend]);
          setInfoModalHeader("Processing sell");
          setInfoModalBody("The transaction is being processed, one moment please. Tx hash: " + tx);
          setApproveSell(false);
          setShowInfoModal(true);

          try {
            const status = await txChecker.checkTransactionStatus(tx, setInfoModalHeader, setInfoModalBody);

            if (status?.status) {
              setInfoModalHeader("Sell successful");
              setInfoModalBody("Your items have been published to the marketplace");
            } else {
              setInfoModalHeader("Upps, sell failed");
              setInfoModalBody("There was an error while putting your items for sale");
            }
          } catch (error) {
            console.error("Error getting transaction status:", error);
            setInfoModalHeader("Transaction Status Unknown");
            setInfoModalBody("Unable to retrieve transaction status. Please try again later.");
          }
        } catch (error) {
          console.error("Error approving BAG:", error);
        }
      } else {
        setApproveHeader("Authorization required");
        setApproveBody("In order to put your NFTs for sale, you need to give permission to the marketplace to sell them. Please click on confirm to allow the marketplace.");
        setApproveSell(true);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveConfirm = async () => {
   
    const activeContract = stateSelected ? 'state' : 'square';

    try {
      const tx = await txHook(activeContract, 'setApprovalForAll', [addresses.marketplace, 1]);
      setInfoModalHeader("Processing authorization");
      setInfoModalBody("The transaction is being processed, one moment please. Tx hash: " + tx);
      setApproveSell(false);
      setShowInfoModal(true);

      try {
        const status = await txChecker.checkTransactionStatus(tx, setInfoModalHeader, setInfoModalBody);

        if (status?.status) {
          setInfoModalHeader("Authorization successful");
          setInfoModalBody("The authorization has been processed successfully");
        } else {
          setInfoModalHeader("Upps, authorization failed");
          setInfoModalBody("There was an error processing the authorization");
        }
      } catch (error) {
        console.error("Error getting transaction status:", error);
        setInfoModalHeader("Transaction Status Unknown");
        setInfoModalBody("Unable to retrieve transaction status. Please try again later.");
      }
    } catch (error) {
      console.error("Error making the approval, please try again:", error);
    } finally {
    
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
              <Button colorScheme="red" mt={4} onClick={handleSellClick} isDisabled={!price || isLoading}>
                {isLoading ? <Spinner size="sm" /> : "Confirm Sell"}
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
