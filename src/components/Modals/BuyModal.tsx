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

import { useTranslation } from 'react-i18next';

import { useAuth } from '../../context/auth.context';
import BinanceModal from './BinanceModal';
import useSendTx from '../../hooks/contracts/useSendTx';

type BuyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  itemCosts: ethers.BigNumber[];
  tokenIds: string[];
  stateSelected: boolean;
};

const BuyModal: React.FC<BuyModalProps> = ({ isOpen, onClose, itemCosts, tokenIds, stateSelected }) => {
  const { t } = useTranslation();
  const bag = useBAG();

  const sendTx = useSendTx();
  const txChecker = useTxChecker();
  const marketplace = useMarketplace();
  let { userAddress } = useAuth();
  
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

  const [showBinanceModal, setShowBinanceModal] = useState(false);
  const [binanceData, setBinanceData] = useState<{ prepayId: string, qrcodeLink: string, checkoutUrl: string, expireTime: number } | null>(null);

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
          setInfoModalHeader(t("insufficientBalance"));
          setInfoModalBody(t("insufficientBalanceBody"));
          setShowInfoModal(true);
          setIsLoading(false);
          return;
        } else {
          if (totalCost.lt(allowance)) {
            if (marketplace && await marketplace.areOrdersActive(nftAddress, tokenIds)) {
              setConfirmPurchaseHeader(t("confirmPurchase"));
              setConfirmPurchaseBody(t("confirmPurchaseBody", { totalCost: ethers.utils.formatEther(totalCost.toString()) }));
              setConfirmPurchase(true);
            } else {
              setInfoModalHeader(t("someElementsNotAvailable"));
              setInfoModalBody(t("someElementsNotAvailableBody"));
              setShowInfoModal(true);
              setIsLoading(false);
              return;
            }
          } else {
            setConfirmModalHeader(t("spendingAuthorizationRequired"));
            setConfirmModalBody(t("spendingAuthorizationBody"));
            setShowConfirmModal(true);
            setIsLoading(false);
            return;
          }
        }
        break;

        case '2':
  try {
    const response = await fetch(`https://api.dglive.org/v1/binance/payment-link?nftAddress=${nftAddress}&tokenIds=${tokenIds.join(',')}&buyerAddress=${userAddress}`);
    const data = await response.json();

    if (data.status === 200 && data.data) {
      const { prepayId, qrcodeLink, checkoutUrl, expireTime } = data.data;
      setBinanceData({ prepayId, qrcodeLink, checkoutUrl, expireTime });
      setShowBinanceModal(true);
    } else {
      console.error("Failed to generate Binance payment link");
    }
  } catch (error) {
    console.error("Error fetching Binance payment link:", error);
  } finally {
    setIsLoading(false);
  }
  break;
        
    }
  };

  const handleAllowanceConfirm = async () => {
    setIsLoading(true);
    try {
      const tx = await sendTx('bag', 'approve', [addresses.marketplace, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"]);
      setInfoModalHeader(t("processingAuthorization"));
      setInfoModalBody(t("authorizationSuccessfulBody", { tx }));
      setShowConfirmModal(false);
      setShowInfoModal(true);

      try {
        if (tx) {
          const status = await txChecker.checkTransactionStatus(tx, setInfoModalHeader, setInfoModalBody);
          if (status?.status) {
            setInfoModalHeader(t("authorizationSuccessful"));
            setInfoModalBody(t("authorizationSuccessfulBody"));
          } else {
            setInfoModalHeader(t("authorizationFailed"));
            setInfoModalBody(t("authorizationFailedBody"));
          }
        }
      } catch (error) {
        console.error("Error getting transaction status:", error);
        setInfoModalHeader(t("transactionStatusUnknown"));
        setInfoModalBody(t("unableToRetrieveTransactionStatus"));
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
      const tx = await sendTx('marketplace', 'buy', [nftAddress, tokenIds, itemCostsString]);

      setShowConfirmModal(false);
      setShowInfoModal(true);
      setInfoModalHeader(t("processingPurchase"));
      setInfoModalBody(t("purchaseSuccessfulBody", { tx }));

      try {
        const status = await txChecker.checkTransactionStatus(tx, setInfoModalHeader, setInfoModalBody);
        if (status?.status) {
          setInfoModalHeader(t("purchaseSuccessful"));
          setInfoModalBody(t("purchaseSuccessfulBody"));

          const totalCostValue = ethers.utils.formatEther(itemCosts.reduce(
            (acc, cost) => acc.add(cost),
            ethers.BigNumber.from("0")
          ).toString());

          twitterPixelEvent('tw-om2cf-om2cg', { value: totalCostValue });
        } else {
          setInfoModalHeader(t("purchaseFailed"));
          setInfoModalBody(t("purchaseFailedBody"));
        }
      } catch (error) {
        console.error("Error getting transaction status:", error);
        setInfoModalHeader(t("transactionStatusUnknown"));
        setInfoModalBody(t("unableToRetrieveTransactionStatus"));
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
          <ModalHeader>{t("buyConfirmation")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>{t("pleaseSelectPaymentOption")}</Text>
            <RadioGroup onChange={handleOptionChange} value={selectedOption}>
              <VStack spacing={2}>
                <Radio value="1">{t("bag")}</Radio>
                <Radio value="2">{t("binance")}</Radio>
                {/* Add more Radio options as needed */}
              </VStack>
            </RadioGroup>
            <Button colorScheme="blue" mt={4} onClick={handleBuyClick} disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : t("buy")}
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
     {showBinanceModal && binanceData && (
  <BinanceModal
    isOpen={showBinanceModal}
    onClose={() => setShowBinanceModal(false)}
    imageUrl={binanceData.qrcodeLink}
    linkUrl={binanceData.checkoutUrl}
    prepayId={binanceData.prepayId}
    expireTime={binanceData.expireTime}
  />
)}

    </>
  );
};

export default BuyModal;
