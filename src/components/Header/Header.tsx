import React from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  useColorMode,
  IconButton,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import { useAuth } from "../../context/auth.context";

const Header: React.FC<{ onHeaderClick: (type: string) => void }> = ({
  onHeaderClick,
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { logout, login, isLoggedIn, userAddress } = useAuth();

  return (
    <Flex
      as="header"
      w="full"
      bg="teal.500"
      p={4}
      justifyContent="space-between"
      alignItems="center"
      boxShadow="md"
    >
      <Box>
        <Button
          onClick={() => onHeaderClick("town")}
          colorScheme="yellow"
          mr={2}
        >
          Town
        </Button>
        <Button
          onClick={() => onHeaderClick("marketplace")}
          colorScheme="pink"
          mr={2}
        >
          Marketplace
        </Button>
        <Button
          onClick={() => onHeaderClick("myAssets")}
          colorScheme="purple"
          mr={2}
        >
          My Assets
        </Button>
        <Button onClick={() => onHeaderClick("editor")} colorScheme="orange">
          Editor
        </Button>
      </Box>
      <Flex alignItems="center">
        <Text fontSize="md" color="white" mr={4}>
          {isLoggedIn ? `Connected: ${userAddress}` : "Not connected"}
        </Text>
        <Button onClick={isLoggedIn ? logout : login} colorScheme="green">
          {isLoggedIn ? "Logout" : "Connect Wallet"}
        </Button>
        <IconButton
          aria-label="Toggle theme"
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          ml={2}
        />
      </Flex>
    </Flex>
  );
};

export default Header;
