import React, { useEffect } from 'react';
import { Box, Button, Flex, Text, useColorMode, IconButton } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { getAccount } from '../../services/walletManager';

const Header: React.FC<{ onHeaderClick: (type: string) => void }> = ({ onHeaderClick }) => {
    const [account, setAccount] = React.useState("");
    const { colorMode, toggleColorMode } = useColorMode();

    useEffect(() => {
        const fetchAccount = async () => {
            const acc = await getAccount();
            setAccount(acc);
        };

        fetchAccount();
    }, []);

    const connectWallet = async () => {
        const acc = await getAccount();
        setAccount(acc);
    };

    return (
        <Flex as="header" w="full" bg="teal.500" p={4} justifyContent="space-between" alignItems="center" boxShadow="md">
            <Box>
                <Button onClick={() => onHeaderClick('town')} colorScheme="yellow" mr={2}>Town</Button>
                <Button onClick={() => onHeaderClick('marketplace')} colorScheme="pink" mr={2}>Marketplace</Button>
                <Button onClick={() => onHeaderClick('myAssets')} colorScheme="purple" mr={2}>My Assets</Button>
                <Button onClick={() => onHeaderClick('editor')} colorScheme="orange">Editor</Button>
            </Box>
            <Flex alignItems="center">
                <Text fontSize="md" color="white" mr={4}>{account ? `Connected: ${account}` : 'Not connected'}</Text>
                <Button onClick={connectWallet} colorScheme="green">{account ? 'Switch Account' : 'Connect Wallet'}</Button>
                <IconButton
                    aria-label="Toggle theme"
                    icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                    onClick={toggleColorMode}
                    ml={2}
                />
            </Flex>
        </Flex>
    );
};

export default Header;
