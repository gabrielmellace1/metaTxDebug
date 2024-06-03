/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState, useEffect } from "react";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { ethers } from "ethers";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { OPENLOGIN_NETWORK } from "@web3auth/openlogin-adapter";
import { twitterPixelEvent } from "../helpers/funcHelper";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

interface AuthContextInterface {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  user?: any;
  userAddress?: string;
  isLoggedIn: boolean;
  signature?: string;
  provider?: SafeEventEmitterProvider | null;
  signer?: ethers.Signer | null;
  switchNetworks: (_network: string) => Promise<void>;
  getUpdatedSigner: () => Promise<ethers.Signer | null>;
}

const AuthContext = createContext<AuthContextInterface>({
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  user: undefined,
  userAddress: undefined,
  isLoggedIn: false,
  signature: undefined,
  provider: null,
  signer: null,
  switchNetworks: async () => {},
  getUpdatedSigner: async () => null,
});

export const useAuth = () => useContext(AuthContext);

const clientId = "BHdopYoGj2lbGUaZGHLbfov4nbX7nQTuR_-aCTn6WnMTkGPnIwvkIaxmyyfFlkxNPLJAe_l6JzFo88I6EXFMAwI";

const blastRpcProvider = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x13E31",
  rpcTarget: "https://rpc.blast.io",
  displayName: "Blast",
  blockExplorerUrl: "https://blastscan.io/",
  ticker: "ETH",
  tickerName: "Ethereum",
};

const metamaskAdapter = new MetamaskAdapter({
  clientId,
  sessionTime: 86400, // 1 hour in seconds
  web3AuthNetwork: "sapphire_mainnet",
  chainConfig: {
    ...blastRpcProvider
  },
});

const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
  config: {
    chainConfig: blastRpcProvider,
  },
});

const web3AuthModalOptions: Web3AuthOptions = {
  clientId,
  chainConfig: blastRpcProvider,
  web3AuthNetwork: OPENLOGIN_NETWORK.SAPPHIRE_MAINNET,
  privateKeyProvider: ethereumPrivateKeyProvider
};

const _web3auth = new Web3Auth(web3AuthModalOptions);

_web3auth.configureAdapter(metamaskAdapter);

const web3AuthModalParameters = {
  modalConfig: {
    openlogin: {
      label: "openlogin",
      loginMethods: {
        email_passwordless: {
          name: "email_passwordless",
          showOnModal: false,
        },
        sms_passwordless: {
          name: "sms_passwordless",
          showOnModal: false,
        },
        phone_passwordless: {
          name: "phone_passwordless",
          showOnModal: false,
        },
      },
    },
  },
};

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isMetaMask, setIsMetamask] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState<string | undefined>(undefined);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [signature, setSignature] = useState<any | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  // Initialize Web3Auth
  const initWeb3Auth = async () => {
    try {
      await _web3auth.initModal(web3AuthModalParameters);
      const web3authProvider = await _web3auth.connect();
      if (web3authProvider) {
        const user = await _web3auth.getUserInfo();
        if (Object.keys(user).length === 0) {
          setIsMetamask(true);
        }
        setProvider(web3authProvider as SafeEventEmitterProvider);
        setUser(user);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // Set signer and user address
  useEffect(() => {
    const execute = async () => {
      if (provider) {
        const etherProvider = new ethers.providers.Web3Provider(provider as any);
        const signer = etherProvider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);
        setIsLoggedIn(true);
        setSigner(signer);
      }
    };
    if (provider) {
      execute();
    }
  }, [provider]);

  // Detect MetaMask and initialize Web3Auth
  useEffect(() => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      setIsMetamask(true);
      twitterPixelEvent('tw-om2cf-om2vj'); // Trigger Twitter event if MetaMask is detected
    }

    initWeb3Auth();
  }, []);

  const getUpdatedSigner = async (): Promise<ethers.Signer | null> => {
    if (isMetaMask && window.ethereum) {
      const metaProvider = new ethers.providers.Web3Provider(window.ethereum);
      await metaProvider.send("eth_requestAccounts", []); // Request accounts to ensure connection
      return metaProvider.getSigner();
    }
    if (provider) {
      const etherProvider = new ethers.providers.Web3Provider(provider as any);
      return etherProvider.getSigner();
    }
    return null;
  };

  const switchNetworks = async (_network: string) => {
    if (!provider) return;
    try {
      const chainConfig = blastRpcProvider;
      if (isMetaMask) {
        const metaProvider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await metaProvider.getNetwork();
        if (network.chainId !== parseInt(chainConfig.chainId, 16)) {
          await metaProvider.send("wallet_switchEthereumChain", [
            { chainId: chainConfig.chainId },
          ]);
        }
        const newSigner = metaProvider.getSigner();
        setSigner(newSigner);
        setProvider(metaProvider.provider as unknown as SafeEventEmitterProvider); // Update provider state
      } else {
        const privateKey = await provider.request<string, string>({
          method: "eth_private_key",
        });

        if (!privateKey) return;
        const blastPrivateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        });

        await blastPrivateKeyProvider.setupProvider(privateKey);
        const newProvider = new ethers.providers.Web3Provider(
          //@ts-expect-error web3Provider is private
          blastPrivateKeyProvider.provider
        );
        const newSigner = newProvider.getSigner();
        setSigner(newSigner);
        setProvider(newProvider.provider as unknown as SafeEventEmitterProvider); // Update provider state
      }
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  // Login with Web3Auth
  const login = async () => {
    try {
      const web3authProvider = await _web3auth.connect();
      if (!web3authProvider) return;

      setProvider(web3authProvider as SafeEventEmitterProvider);
      const user = await _web3auth.getUserInfo();
      if (Object.keys(user).length === 0) {
        setIsMetamask(true);
      }
      setUser(user);
      twitterPixelEvent('tw-om2cf-om2uj');
    } catch (error) {
      console.log(error);
    }
  };

  // Logout from Web3Auth
  const logout = async () => {
    await _web3auth.logout();
    setProvider(null);
    setUser(null);
    setUserAddress(undefined);
    setSignature(undefined);
    setIsLoggedIn(false);
    setIsMetamask(false);
    setSigner(null);
    localStorage.removeItem("apiKeyDG");
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        user,
        logout,
        userAddress,
        isLoggedIn,
        signature,
        provider,
        signer,
        switchNetworks,
        getUpdatedSigner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
