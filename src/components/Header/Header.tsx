import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useAuth } from "../../context/auth.context";
import useSendTx from "../../hooks/contracts/useSendTx";





const Header = () => {

  const { logout, login, isLoggedIn, userAddress } = useAuth();
  const sendTx = useSendTx(); // Initialize sendTx



  // Function to handle button click and send transaction
  const handleButtonClick = async () => {
    try {
      const tx = await sendTx('marketplace', 'sell', ["0x2933f1a981b40409a26864284fd8169e5da159c8", [246001], [1000]]);
      console.log("Transaction sent:", tx);
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  return (
    <Box as="header" w="full" boxShadow="md">
      <Flex
        bg="teal.500"
        p={4}
        justifyContent="space-between"
        alignItems="center"
      >
        <Box display="flex" alignItems="center">
        <Button onClick={handleButtonClick} colorScheme="red" ml={2}>
            Send Tx
          </Button>
        </Box>
        <Flex alignItems="center">
          <Text fontSize="md" color="white" mr={4}>
            {isLoggedIn ? `Connected: ${userAddress}` : "Not connected"}
          </Text>
          <Button onClick={isLoggedIn ? logout : login} colorScheme="green">
            {isLoggedIn ? "Logout" : "Connect"}
          </Button>
         
         
        </Flex>
      </Flex>
      <Flex bg="teal.300" p={2} justifyContent="center">
        <Text fontSize="sm" color="white">
          {/* Additional header text */}
        </Text>
      </Flex>
    </Box>
  );
};

export default Header;
