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
  getUpdatedSigner: () => Promise<ethers.Signer | null>;
  isMetaMask: boolean;
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
  getUpdatedSigner: async () => null,
  isMetaMask: false,
});

export const useAuth = () => useContext(AuthContext);

const clientId =
  "BHdopYoGj2lbGUaZGHLbfov4nbX7nQTuR_-aCTn6WnMTkGPnIwvkIaxmyyfFlkxNPLJAe_l6JzFo88I6EXFMAwI";

const blastRpcProvider = {
  name: "Blast",
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
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x13E31",
    rpcTarget: "https://rpc.blast.io",
    blockExplorerUrl: "https://blastscan.io/",
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
  privateKeyProvider: ethereumPrivateKeyProvider,
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
          showOnModal: true,
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
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
    null
  );
  const [user, setUser] = useState<any | null>(null);
  const [signature, setSignature] = useState<any | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initWeb3Auth = async () => {
    try {
      await _web3auth.initModal(web3AuthModalParameters);
      setIsInitialized(true);
    } catch (error) {
      console.error("Web3Auth initialization error:", error);
    }
  };

  // Set signer and user address
  useEffect(() => {
    const setSignerAndAddress = async () => {
      if (provider) {
        const etherProvider = new ethers.providers.Web3Provider(
          provider as any
        );
        const signer = etherProvider.getSigner();
        const address = await signer.getAddress();
        console.log("Signer address set:", address); // Log address
        setUserAddress(address);
        setSigner(signer);
        setIsLoggedIn(true);
      }
    };
    if (provider) {
      setSignerAndAddress();
    }
  }, [provider]);

  // Detect MetaMask
  useEffect(() => {
    if (window.ethereum?.isMetaMask) {
      twitterPixelEvent("tw-om2cf-om2vj"); // Trigger Twitter event if MetaMask is detected
    }
  }, []);

  const getUpdatedSigner = async (): Promise<ethers.Signer | null> => {
    if (provider) {
      const etherProvider = new ethers.providers.Web3Provider(provider as any);
      return etherProvider.getSigner();
    }
    return null;
  };

  // Login with Web3Auth
  const login = async () => {
    try {
      if (!isInitialized) {
        await initWeb3Auth(); // Initialize Web3Auth if not already initialized
      }
      const web3authProvider = await _web3auth.connect();
      if (!web3authProvider) return;

      setProvider(web3authProvider as SafeEventEmitterProvider);
      const user = await _web3auth.getUserInfo();
      setUser(user);
      twitterPixelEvent("tw-om2cf-om2uj");

      setIsMetamask(_web3auth.connectedAdapterName === "metamask");
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
    setSignature(null);
    setIsLoggedIn(false);
    setIsMetamask(false);
    setSigner(null);
    localStorage.removeItem("apiKeyDG");
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        user,
        userAddress,
        isLoggedIn,
        signature,
        provider,
        signer,
        getUpdatedSigner,
        isMetaMask,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
