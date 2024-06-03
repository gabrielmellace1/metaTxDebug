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
import { useTranslation } from 'react-i18next';
import metaTx from '../../hooks/contracts/useMetaTx';

type SellModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tokenIds: string[];
  stateSelected: boolean;
};

const SellModal: React.FC<SellModalProps> = ({ isOpen, onClose, tokenIds, stateSelected }) => {
  const { t } = useTranslation();
  const txHook = useTx();
  const meta = metaTx();
  const txChecker = useTxChecker();
  const marketplace = useMarketplace();
  const square = useSquare();
  const state = useStateContract();

  let nftAddress = stateSelected ? addresses.state : addresses.square;
  const displayText = stateSelected 
    ? t("enterPriceForStates") 
    : t("enterPriceForSquares");

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
      setInfoModalHeader(t("marketplaceNotAvailable"));
      setInfoModalBody(t("marketplaceNotAvailableBody"));
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
          setInfoModalHeader(t("sellFailed"));
          setInfoModalBody(t("sellFailedBody"));
          setShowInfoModal(true);
          setIsLoading(false);
          return;
        }

        try {
          const tx = await meta('marketplace', 'sell', [nftAddress, tokenIds, pricesToSend]);
          setInfoModalHeader(t("processingSell"));
          setInfoModalBody(t("processingSellBody", { tx }));
          setApproveSell(false);
          setShowInfoModal(true);

          try {
            const status = await txChecker.checkTransactionStatus(tx, setInfoModalHeader, setInfoModalBody);

            if (status?.status) {
              setInfoModalHeader(t("sellSuccessful"));
              setInfoModalBody(t("sellSuccessfulBody"));
            } else {
              setInfoModalHeader(t("sellFailedGeneral"));
              setInfoModalBody(t("sellFailedGeneralBody"));
            }
          } catch (error) {
            console.error("Error getting transaction status:", error);
            setInfoModalHeader(t("transactionStatusUnknown"));
            setInfoModalBody(t("unableToRetrieveTransactionStatus"));
          }
        } catch (error) {
          console.error("Error approving BAG:", error);
        }
      } else {
        setApproveHeader(t("authorizationRequired"));
        setApproveBody(t("authorizationRequiredBody"));
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
      setInfoModalHeader(t("processingAuthorization"));
      setInfoModalBody(t("processingSellBody", { tx }));
      setApproveSell(false);
      setShowInfoModal(true);

      try {
        const status = await txChecker.checkTransactionStatus(tx, setInfoModalHeader, setInfoModalBody);

        if (status?.status) {
          setInfoModalHeader(t("authorizationSuccessful"));
          setInfoModalBody(t("authorizationSuccessfulBody"));
        } else {
          setInfoModalHeader(t("authorizationFailed"));
          setInfoModalBody(t("authorizationFailedBody"));
        }
      } catch (error) {
        console.error("Error getting transaction status:", error);
        setInfoModalHeader(t("transactionStatusUnknown"));
        setInfoModalBody(t("unableToRetrieveTransactionStatus"));
      }
    } catch (error) {
      console.error("Error making the approval, please try again:", error);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("placeElementsForSale")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>{displayText}</Text>
              <Input
                placeholder={t("enterPriceInBag")}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                step="0.01"
              />
              <Button colorScheme="red" mt={4} onClick={handleSellClick} isDisabled={!price || isLoading}>
                {isLoading ? <Spinner size="sm" /> : t("confirmSell")}
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
