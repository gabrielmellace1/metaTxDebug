import React, { useEffect, useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  VStack, Text, Link, Box, Button, Center, Icon
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, TimeIcon } from '@chakra-ui/icons';

type CoinbaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  linkUrl: string;
  code: string;
  expireTime: string;
};

const CoinbaseModal: React.FC<CoinbaseModalProps> = ({ isOpen, onClose, linkUrl, code, expireTime }) => {
  const expireTimestamp = new Date(expireTime).getTime();
  const [paymentStatus, setPaymentStatus] = useState("Waiting for payment");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(expireTimestamp - Date.now());
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        const remainingTime = expireTimestamp - Date.now();
        setTimeLeft(remainingTime);
        if (remainingTime <= 0) {
          clearInterval(interval);
          setIsExpired(true);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, expireTimestamp]);

  useEffect(() => {
    if (isOpen && !isExpired) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`https://api.dglive.org/v1/binance/payment-status?prepayId=${code}`);
          const data = await response.json();

          if (data.status === 200 && data.data.length > 0) {
            const latestStatus = data.data[data.data.length - 1];
            const { status, transactionHash } = latestStatus;
            setPaymentStatus(status === 'paymentlink_created' || status === 'waiting_blockchain_confirmation' ? 'Waiting for payment' : status);
            setTransactionHash(transactionHash || null);
            if (status === 'paid' || status === 'refund') {
              clearInterval(interval);
              setTimeout(onClose, 5000); // Auto-close after 5 seconds
            }
          }
        } catch (error) {
          console.error("Error fetching payment status:", error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isOpen, isExpired, code]);

  const formattedTimeLeft = new Date(timeLeft).toISOString().substr(11, 8);

  const renderContent = () => {
    if (isExpired) {
      return (
        <Center flexDirection="column">
          <Icon as={TimeIcon} w={10} h={10} color="gray.500" />
          <Text fontSize="lg" color="gray.500">Link expired</Text>
          <Button mt={4} disabled>Link expired</Button>
        </Center>
      );
    }

    switch (paymentStatus) {
      case 'paid':
        return (
          <Center flexDirection="column">
            <Icon as={CheckCircleIcon} w={10} h={10} color="green.500" />
            <Text fontSize="lg" color="green.500">Payment successful</Text>
            <Text>Your payment was successful, here is your transaction hash:</Text>
            <Link href={`https://blastscan.io/tx/${transactionHash}`} color="teal.500" isExternal>
              {transactionHash}
            </Link>
            <Button colorScheme="green" mt={4} onClick={onClose}>Close</Button>
          </Center>
        );
      case 'refund':
        return (
          <Center flexDirection="column">
            <Icon as={WarningIcon} w={10} h={10} color="orange.500" />
            <Text fontSize="lg" color="orange.500">Payment refunded</Text>
            <Text>There was a problem with your payment, you were refunded with BAG tokens, here is the transaction hash:</Text>
            <Link href={`https://blastscan.io/tx/${transactionHash}`} color="teal.500" isExternal>
              {transactionHash}
            </Link>
            <Button colorScheme="orange" mt={4} onClick={onClose}>Close</Button>
          </Center>
        );
      case 'Waiting for payment':
      default:
        return (
          <>
            <Box flex="1" display="flex" justifyContent="center" alignItems="center">
              <Icon as={TimeIcon} w={10} h={10} color="yellow.500" />
            </Box>
            <Box flex="1" p={4}>
              <VStack spacing={4} align="start">
                <Text>Click on the following link to proceed with the payment:</Text>
                <Link href={linkUrl} color="teal.500" isExternal>Click here to pay</Link>
                <Text>Valid for: {formattedTimeLeft}</Text>
                <Text>Payment status: {paymentStatus}</Text>
              </VStack>
            </Box>
          </>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Payment</ModalHeader>
        <ModalCloseButton />
        <ModalBody display="flex">
          {renderContent()}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CoinbaseModal;
