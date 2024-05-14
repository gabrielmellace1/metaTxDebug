
import { Box, Button, Flex, Text, useColorMode, IconButton, Link } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import { useAuth } from "../../context/auth.context";
import { Link as RouterLink } from "react-router-dom";  // Import RouterLink for navigation
import { useEffect } from "react";

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { logout, login, isLoggedIn, userAddress } = useAuth();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);


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
        <Link as={RouterLink} to="/town" mr={2}><Button colorScheme="yellow">Town</Button></Link>
        <Link as={RouterLink} to="/marketplace" mr={2}><Button colorScheme="pink">Marketplace</Button></Link>
        <Link as={RouterLink} to="/my-assets" mr={2}><Button colorScheme="purple">My Assets</Button></Link>
        <a href="https://twitter.com/SquaresTown" className="twitter-follow-button" data-show-count="false">Follow @SquaresTown</a>
       
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
