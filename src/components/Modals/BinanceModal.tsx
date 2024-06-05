import React, { useEffect, useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  VStack, Text, Link, Box, Button, Center, Icon
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, TimeIcon } from '@chakra-ui/icons';

type BinanceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  linkUrl: string;
  prepayId: string;
  expireTime: number;
};

const BinanceModal: React.FC<BinanceModalProps> = ({ isOpen, onClose, imageUrl, linkUrl, prepayId, expireTime }) => {
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [timeLeft, setTimeLeft] = useState(expireTime - Date.now());
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        const remainingTime = expireTime - Date.now();
        setTimeLeft(remainingTime);
        if (remainingTime <= 0) {
          clearInterval(interval);
          setIsExpired(true);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, expireTime]);

  useEffect(() => {
    if (isOpen && !isExpired) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`https://api.dglive.org/v1/binance/payment-status?prepayId=${prepayId}`);
          const data = await response.json();

          if (data.status === 200 && data.data.length > 0) {
            const latestStatus = data.data[data.data.length - 1].status;
            setPaymentStatus(latestStatus === 'paymentlink_created' ? 'Pending' : latestStatus);
            if (latestStatus === 'paid' || latestStatus === 'failed') {
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
  }, [isOpen, isExpired, prepayId]);

  const formattedTimeLeft = new Date(timeLeft).toISOString().substr(11, 8);

  const renderContent = () => {
    if (isExpired) {
      return (
        <Center flexDirection="column">
          <Icon as={TimeIcon} w={10} h={10} color="gray.500" />
          <Text fontSize="lg" color="gray.500">QR code expired</Text>
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
            <Button colorScheme="green" mt={4} onClick={onClose}>Close</Button>
          </Center>
        );
      case 'failed':
        return (
          <Center flexDirection="column">
            <Icon as={WarningIcon} w={10} h={10} color="red.500" />
            <Text fontSize="lg" color="red.500">Payment failed</Text>
            <Button colorScheme="red" mt={4} onClick={onClose}>Close</Button>
          </Center>
        );
      case 'Pending':
      default:
        return (
          <>
            <Box flex="1" display="flex" justifyContent="center" alignItems="center">
              <img src={imageUrl} alt="Payment QR Code" style={{ maxHeight: '100%', maxWidth: '100%' }} />
            </Box>
            <Box flex="1" p={4}>
              <VStack spacing={4} align="start">
                <Text>Scan this QR code with the Binance app or click on the following link:</Text>
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

export default BinanceModal;
