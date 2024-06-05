import React, { useEffect, useState } from 'react';
import { HStack, Text, Button, Flex } from '@chakra-ui/react';
import { AtlasToken } from '../../types/atlasTypes';
import BuyModal from '../Modals/BuyModal';
import SellModal from '../Modals/SellModal';
import CancelModal from '../Modals/CancelModal';
import { ethers } from 'ethers';
import styles from './ActionBar.module.css';
import ConfirmModal from '../Modals/ConfirmModal';
//import useMetaTx from '../../hooks/contracts/useMetaTx';
import useTxChecker from '../../hooks/contracts/useTxChecker';
import InformationModal from '../Modals/InformationModal';
import TransferModal from '../Modals/TransferModal';
import { useNavigate } from 'react-router-dom';
import useTx from '../../hooks/contracts/useTx';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/auth.context';

type ActionBarProps = {
  userAddress: string | undefined;
  selectedTiles: AtlasToken[];
  stateSelected: boolean;
  buttons: {
    sell?: boolean;
    buy?: boolean;
    cancel?: boolean;
    group?: boolean;
    ungroup?: boolean;
    upload?: boolean;
    transfer?: boolean;
  };
};

const ActionBar: React.FC<ActionBarProps> = ({ userAddress, selectedTiles, stateSelected, buttons }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const txHook = useTx();
  const txChecker = useTxChecker();
   const { login, isLoggedIn } = useAuth();

  // Action buttons
  const [canBuy, setCanBuy] = useState(true);
  const [canSell, setCanSell] = useState(true);
  const [canCancel, setCanCancel] = useState(true);

  const [canGroup, setCanGroup] = useState(false);
  const [canUnGroup, setCanUnGroup] = useState(false);
  const [canUpload, setCanUpload] = useState(false);
  const [canTransfer, setCanTransfer] = useState(false);

  // Info
  const [itemCosts, setItemCosts] = useState<ethers.BigNumber[]>([]);
  const [tokenIds, setTokenIds] = useState<string[]>([]); // Initialize tokenIds as an empty array

  // Modals
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [showConfirmGroup, setShowConfirmGroup] = useState(false);
  const [showConfirmUnGroup, setShowConfirmUnGroup] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalHeader, setInfoModalHeader] = useState("");
  const [infoModalBody, setInfoModalBody] = useState("");

  useEffect(() => {
    if (selectedTiles.length === 0) {
      setCanBuy(false);
      setCanSell(false);
      setCanCancel(false);
      setCanGroup(false);
      setCanUnGroup(false);
      setCanUpload(false);
      setCanTransfer(false);
      setItemCosts([]);
      setTokenIds([]);
      return; // Early return for empty selection
    }

    setCanBuy(true);
    setCanSell(true);
    setCanCancel(true);

    if (selectedTiles.length > 0) {
      setItemCosts(selectedTiles.map(tile => ethers.BigNumber.from(tile.price?.toString() || "0")));
      setTokenIds(selectedTiles.map(tile => tile.tokenId?.toString() || ''));
      setCanTransfer(true);

      if (stateSelected) {
        setCanGroup(false);
        if (selectedTiles.length > 1) {
          setCanGroup(true);
          setCanUpload(false);
          setCanUnGroup(false);
        } else {
          setCanUpload(true);
          setCanUnGroup(true);
        }
      } else {
        setCanUnGroup(false);
        if (selectedTiles.length > 1) {
          setCanGroup(true);
        } else {
          setCanGroup(false);
        }
        setCanUpload(true);
      }

      selectedTiles.forEach(tile => {
        if (tile.owner !== userAddress) {
          setCanGroup(false);
          setCanUnGroup(false);
          setCanUpload(false);
          setCanTransfer(false);
        }

        if (tile.owner !== userAddress || !tile.forSale) {
          setCanCancel(false);
        }

        if (tile.owner !== userAddress || tile.forSale) {
          setCanSell(false);
        }

        if (tile.owner === userAddress || !tile.forSale) {
          setCanBuy(false);
        }
      });
    }
  }, [selectedTiles, userAddress]);

  const handleGroupConfirm = async () => {
    try {
      const sortedTokenIds = [...tokenIds].sort((a, b) => Number(a) - Number(b));
      console.log(sortedTokenIds);
      console.log(stateSelected);
      
      let tx;

      if(stateSelected) {
         tx = await txHook('state', 'mergeStates', [sortedTokenIds]);
      }
      else {
         tx = await txHook('state', 'mintState', [sortedTokenIds]);
      }
      

      console.log("Tx is:" + tx);

      setInfoModalHeader(t('processingStateCreation'));
      setInfoModalBody(t('stateIsBeingProcessed', { tx }));
      setShowConfirmGroup(false); // Close confirmation modal
      setShowInfoModal(true); // Open informative modal

      try {
        if (tx) {
          const status = await txChecker.checkTransactionStatus(tx, setInfoModalHeader, setInfoModalBody); // Use the context function

          if (status?.status) {
            setInfoModalHeader(t('stateCreationSuccessful'));
            setInfoModalBody(t('stateCreationSuccessful'));
          } else {
            setInfoModalHeader(t('stateCreationFailed'));
            setInfoModalBody(t('stateCreationFailed'));
          }
        }
      } catch (error) {
        console.error("Error getting transaction status:", error);
        setInfoModalHeader(t('transactionStatusUnknown'));
        setInfoModalBody(t('unableToRetrieveTransactionStatus'));
      } finally {
        // Reset txHash after checking status
      }
    } catch (error) {
      console.error("Error approving BAG:", error);
      // Handle error appropriately, e.g., show error message to user
    }
  };

  const handleUnGroupConfirm = async () => {
    try {
      const tx = await txHook('state', 'deleteState', [tokenIds[0]]);

      console.log("Tx is:" + tx);

      setInfoModalHeader(t('processingStateCreation'));
      setInfoModalBody(t('stateIsBeingProcessed', { tx }));
      setShowConfirmUnGroup(false); // Close confirmation modal
      setShowInfoModal(true); // Open informative modal

      try {
        if (tx) {
          const status = await txChecker.checkTransactionStatus(tx, setInfoModalHeader, setInfoModalBody); // Use the context function

          if (status?.status) {
            setInfoModalHeader(t('stateDissolutionSuccessful'));
            setInfoModalBody(t('stateDissolutionSuccessful'));
          } else {
            setInfoModalHeader(t('stateDissolutionFailed'));
            setInfoModalBody(t('stateDissolutionFailed'));
          }
        }
      } catch (error) {
        console.error("Error getting transaction status:", error);
        setInfoModalHeader(t('transactionStatusUnknown'));
        setInfoModalBody(t('unableToRetrieveTransactionStatus'));
      } finally {
        // Reset txHash after checking status
      }
    } catch (error) {
      console.error("Error approving BAG:", error);
      // Handle error appropriately, e.g., show error message to user
    }
  };

  const handleUploadContent = () => {
    console.log("hey");
    if (canUpload) {  // Ensuring the button functionality is in sync with its enabled state
      navigate('/editor', { state: { tokenIds, stateSelected } });
    }
  };

  return (
    <Flex p="4" bg="black.100" align="center" className={styles.actionBar} w="100%">
      {/* Flex container to align items to the right */}
      <Flex ml="auto" alignItems="center">
        {/* Conditional rendering for "Amount in BAG" */}
        {canBuy && (
          <HStack spacing="4" mr="8"> {/* Right margin to ensure spacing between text and buttons */}
            <Text fontSize="lg" fontWeight="bold">{t('amountInBag')}:</Text>
            <Text fontSize="md">{ethers.utils.formatEther(itemCosts.reduce((a, b) => a.add(b), ethers.BigNumber.from(0)))}</Text>
          </HStack>
        )}

        {/* Button group */}
        <HStack spacing="4">
  {buttons.buy && (
    <Button
      colorScheme="blue"
      isDisabled={!canBuy}
      onClick={() => {
        if (!isLoggedIn || !userAddress) {
          login();
        } else {
          setBuyModalOpen(true);
        }
      }}
    >
      {t('buy')}
    </Button>
  )}
  {buttons.sell && (
    <Button
      colorScheme="green"
      isDisabled={!canSell}
      onClick={() => {
        if (!isLoggedIn || !userAddress) {
          login();
        } else {
          setSellModalOpen(true);
        }
      }}
    >
      {t('sell')}
    </Button>
  )}
  {buttons.cancel && (
    <Button
      colorScheme="red"
      isDisabled={!canCancel}
      onClick={() => {
        if (!isLoggedIn || !userAddress) {
          login();
        } else {
          setCancelModalOpen(true);
        }
      }}
    >
      {t('cancel')}
    </Button>
  )}
  {buttons.group && (
    <Button
      colorScheme="purple"
      isDisabled={!canGroup}
      onClick={() => {
        if (!isLoggedIn || !userAddress) {
          login();
        } else {
          setShowConfirmGroup(true);
        }
      }}
    >
      {t('group')}
    </Button>
  )}
  {buttons.ungroup && (
    <Button
      colorScheme="orange"
      isDisabled={!canUnGroup}
      onClick={() => {
        if (!isLoggedIn || !userAddress) {
          login();
        } else {
          setShowConfirmUnGroup(true);
        }
      }}
    >
      {t('ungroup')}
    </Button>
  )}
  {buttons.upload && (
    <Button
      colorScheme="cyan"
      isDisabled={!canUpload}
      onClick={() => {
        if (!isLoggedIn || !userAddress) {
          login();
        } else {
          handleUploadContent();
        }
      }}
    >
      {t('uploadContent')}
    </Button>
  )}
  {buttons.transfer && (
    <Button
      colorScheme="yellow"
      isDisabled={!canTransfer}
      onClick={() => {
        if (!isLoggedIn || !userAddress) {
          login();
        } else {
          setTransferModalOpen(true);
        }
      }}
    >
      {t('transfer')}
    </Button>
  )}
</HStack>

      </Flex>

      {/* Modals */}
      {buyModalOpen && (
        <BuyModal
          isOpen={buyModalOpen}
          onClose={() => setBuyModalOpen(false)}
          itemCosts={itemCosts}
          tokenIds={tokenIds}
          stateSelected={stateSelected}
        />
      )}
      {sellModalOpen && (
        <SellModal
          isOpen={sellModalOpen}
          onClose={() => setSellModalOpen(false)}
          tokenIds={tokenIds}
          stateSelected={stateSelected}
        />
      )}
      {cancelModalOpen && (
        <CancelModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          tokenIds={tokenIds}
          stateSelected={stateSelected}
        />
      )}
      {transferModalOpen && (
        <TransferModal
          isOpen={transferModalOpen}
          onClose={() => setTransferModalOpen(false)}
          tokenIds={tokenIds}
          stateSelected={stateSelected}
        />
      )}
      {showInfoModal && (
        <InformationModal isOpen={showInfoModal} header={infoModalHeader} text={infoModalBody} setShowInfoModal={setShowInfoModal} />
      )}
      {showConfirmGroup && (
        <ConfirmModal isOpen={showConfirmGroup} header={t('stateCreation')} body={t('stateCreationBody')} onConfirm={handleGroupConfirm} setShowConfirmModal={setShowConfirmGroup} />
      )}
      {showConfirmUnGroup && (
        <ConfirmModal isOpen={showConfirmUnGroup} header={t('stateDissolution')} body={t('stateDissolutionBody')} onConfirm={handleUnGroupConfirm} setShowConfirmModal={setShowConfirmUnGroup} />
      )}
    </Flex>
  );
};

export default ActionBar;
