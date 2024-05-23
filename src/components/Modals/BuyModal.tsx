import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, VStack, Text, RadioGroup, Radio, Button, Spinner } from '@chakra-ui/react';
import { ethers } from 'ethers';
import InformationModal from './InformationModal';
import ConfirmModal from './ConfirmModal';
import useBAG from '../../hooks/contracts/useBag';
import { addresses } from '../../hooks/contracts/contractConfigs';
import useTxChecker from '../../hooks/contracts/useTxChecker';
import useMarketplace from '../../hooks/contracts/useMarketplace';
import { twitterPixelEvent } from '../../helpers/funcHelper';
import useTx from '../../hooks/contracts/useTx';

type BuyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  itemCosts: ethers.BigNumber[];
  tokenIds: string[];
  stateSelected: boolean;
};

const BuyModal: React.FC<BuyModalProps> = ({ isOpen, onClose, itemCosts, tokenIds, stateSelected }) => {
  const bag = useBAG();
  const txHook = useTx();
  const txChecker = useTxChecker();
  const marketplace = useMarketplace();

  let nftAddress = stateSelected ? addresses.state : addresses.square;

  const [selectedOption, setSelectedOption] = useState('1'); // Initial selected option

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalHeader, setInfoModalHeader] = useState("");
  const [infoModalBody, setInfoModalBody] = useState("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalHeader, setConfirmModalHeader] = useState("");
  const [confirmModalBody, setConfirmModalBody] = useState("");

  const [showConfirmPurchase, setConfirmPurchase] = useState(false);
  const [confirmPurchaseHeader, setConfirmPurchaseHeader] = useState("");
  const [confirmPurchaseBody, setConfirmPurchaseBody] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleOptionChange = (value: string) => setSelectedOption(value);

  const handleBuyClick = async () => {
    setIsLoading(true);
    switch (selectedOption) {
      case '1':
        const balance = await bag?.getBalance();
        const allowance = await bag?.getAllowance(addresses.marketplace);
        const totalCost = itemCosts.reduce(
          (accumulator, currentCost) => accumulator.add(currentCost),
          ethers.BigNumber.from("0")
        );

        if (totalCost.gt(balance)) {
          setInfoModalHeader("Insufficient balance");
          setInfoModalBody("Oops, looks like you don't have enough balance to complete this purchase.");
          setShowInfoModal(true);
          setIsLoading(false);
          return;
        } else {
          if (totalCost.lt(allowance)) {
            if (marketplace && await marketplace.areOrdersActive(nftAddress, tokenIds)) {
              setConfirmPurchaseHeader("Confirm purchase?");
              setConfirmPurchaseBody("You are about to buy squares for a total of " + ethers.utils.formatEther(totalCost.toString()) + " BAG");
              setConfirmPurchase(true);
            } else {
              setInfoModalHeader("Oh no!");
              setInfoModalBody("Oh no! It looks like some of the elements you have selected are no longer available");
              setShowInfoModal(true);
              setIsLoading(false);
              return;
            }
          } else {
            setConfirmModalHeader("Spending authorization required");
            setConfirmModalBody("In order to perform the purchase, you need to authorize the marketplace to spend your BAG tokens and receive your square NFTs");
            setShowConfirmModal(true);
            setIsLoading(false);
            return;
          }
        }
        break;

      case '2':
        console.log("bsd");
        setIsLoading(false);
        break;
    }
  };

  const handleAllowanceConfirm = async () => {
    setIsLoading(true);
    try {
      const tx = await txHook('bag', 'approve', [addresses.marketplace, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"]);
      setInfoModalHeader("Processing authorization");
      setInfoModalBody("The transaction is being processed, one moment please. Tx hash: " + tx);
      setShowConfirmModal(false);
      setShowInfoModal(true);

      try {
        if (tx) {
          const status = await txChecker.checkTransactionStatus(tx, setInfoModalHeader, setInfoModalBody);
          if (status?.status) {
            setInfoModalHeader("Authorization successful");
            setInfoModalBody("The authorization has been processed successfully");
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
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error approving BAG:", error);
      setIsLoading(false);
    }
  };

  const handleBuyConfirm = async () => {
    setIsLoading(true);
    try {
      const itemCostsString = itemCosts.map(num => num.toString());
      const tx = await txHook('marketplace', 'buy', [nftAddress, tokenIds, itemCostsString]);

      setShowConfirmModal(false);
      setShowInfoModal(true);
      setInfoModalHeader("Processing purchase");
      setInfoModalBody("The purchase is being processed, one moment please. Tx hash: " + tx);

      try {
        const status = await txChecker.checkTransactionStatus(tx, setInfoModalHeader, setInfoModalBody);
        if (status?.status) {
          setInfoModalHeader("Purchase successful");
          setInfoModalBody("The purchase has been processed successfully");

          const totalCostValue = ethers.utils.formatEther(itemCosts.reduce(
            (acc, cost) => acc.add(cost),
            ethers.BigNumber.from("0")
          ).toString());

          twitterPixelEvent('tw-om2cf-om2cg', { value: totalCostValue });
        } else {
          setInfoModalHeader("Upps, purchase failed");
          setInfoModalBody("There was an error processing the purchase");
        }
      } catch (error) {
        console.error("Error getting transaction status:", error);
        setInfoModalHeader("Transaction Status Unknown");
        setInfoModalBody("Unable to retrieve transaction status. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("There was an error processing your purchase", error);
      setIsLoading(false);
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
            <Button colorScheme="blue" mt={4} onClick={handleBuyClick} disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : "Buy"}
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
