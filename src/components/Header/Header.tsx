import { Box, Button, Flex, Text, useColorMode, IconButton, Link } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import { useAuth } from "../../context/auth.context";
import { Link as RouterLink } from "react-router-dom";  // Import RouterLink for navigation
import { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { logout, login, isLoggedIn, userAddress } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

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
      <Box display="flex" alignItems="center">
        <Link as={RouterLink} to="/town" mr={2}><Button colorScheme="yellow">{t('town')}</Button></Link>
        <Link as={RouterLink} to="/marketplace" mr={2}><Button colorScheme="pink">{t('marketplace')}</Button></Link>
        <Link as={RouterLink} to="/my-assets" mr={2}><Button colorScheme="purple">{t('myAssets')}</Button></Link>
        <Link as={RouterLink} to="/about" mr={2}><Button colorScheme="blue">{t('about')}</Button></Link>
        <Box as="span" ml={2}>
          <a href="https://twitter.com/SquaresTown"  className="twitter-follow-button" data-show-count="false">{t('followUs')}</a>
        </Box>
      </Box>
      <Flex alignItems="center">
        <Text fontSize="md" color="white" mr={4}>
          {isLoggedIn ? t('connected', { userAddress }) : t('notConnected')}
        </Text>
        <Button onClick={isLoggedIn ? logout : login} colorScheme="green">
          {isLoggedIn ? t('logout') : t('connectWallet')}
        </Button>
        <IconButton
          aria-label="Toggle theme"
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          ml={2}
        />
        <Button onClick={() => changeLanguage('en')} ml={2} colorScheme="blue">EN</Button>
        <Button onClick={() => changeLanguage('es')} ml={2} colorScheme="blue">ES</Button>
        <Button onClick={() => changeLanguage('cn')} ml={2} colorScheme="blue">CN</Button>
      </Flex>
    </Flex>
  );
};

export default Header;
