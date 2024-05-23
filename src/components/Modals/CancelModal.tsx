import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, VStack, Text, Button, Spinner } from '@chakra-ui/react';

import InformationModal from './InformationModal';
import useTxChecker from '../../hooks/contracts/useTxChecker';
import useMarketplace from '../../hooks/contracts/useMarketplace';
import { addresses } from '../../hooks/contracts/contractConfigs';
import useTx from '../../hooks/contracts/useTx';

type CancelModalProps = {
    isOpen: boolean;
    onClose: () => void;
    tokenIds:string[];
    stateSelected:boolean;
};

const CancelModal: React.FC<CancelModalProps> = ({ isOpen, onClose, tokenIds, stateSelected }) => {
    const txHook = useTx();
    const txChecker = useTxChecker();
    const marketplace = useMarketplace();
    let nftAddress = stateSelected ? addresses.state : addresses.square;

    const [showInfoModal, setShowInfoModal] = useState(false);
    const [infoModalHeader, setInfoModalHeader] = useState("");
    const [infoModalBody, setInfoModalBody] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleCancelClick = async () => {
        if (!marketplace) {
            setInfoModalHeader("Marketplace not available");
            setInfoModalBody("The marketplace contract is not available at the moment.");
            setShowInfoModal(true);
            return;
        }
        setIsLoading(true);
        try {
            if (!await marketplace.areOrdersActive(nftAddress, tokenIds)) {
                setInfoModalHeader("Cancelation failed");
                setInfoModalBody("One or more of the items you have selected are no longer for sale");
                setShowInfoModal(true);
                setIsLoading(false);
                return;
            }
            try {
                const tx = await txHook('marketplace', 'cancel', [nftAddress, tokenIds]);
                console.log("Tx is:" + tx);
                setInfoModalHeader("Processing cancel");
                setInfoModalBody("The transaction is being processed, one moment please. Tx hash: " + tx);
                setShowInfoModal(true);

                try {
                    if (tx) {
                        const status = await txChecker.checkTransactionStatus(tx, setInfoModalHeader, setInfoModalBody);
                        if (status?.status) {
                            setInfoModalHeader("Cancel successful");
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
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
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
                            <Button colorScheme="red" mt={4} onClick={handleCancelClick} disabled={isLoading}>
                                {isLoading ? <Spinner size="sm" /> : "Confirm"}
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
