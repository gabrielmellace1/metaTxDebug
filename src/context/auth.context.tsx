/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState, useEffect } from "react";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { ethers } from "ethers";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { OPENLOGIN_NETWORK } from "@web3auth/openlogin-adapter";
import { twitterPixelEvent } from "../helpers/funcHelper";

interface AuthContextInterface {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  user?: any;
  userAddress?: string;
  isLoggedIn: boolean;
  signature?: string;
  provider?: SafeEventEmitterProvider | null;
}

const AuthContext = createContext<AuthContextInterface>({
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  user: undefined,
  userAddress: undefined,
  isLoggedIn: false,
  signature: undefined,
  provider: null,
});

export const useAuth = () => useContext(AuthContext);

const clientId =
  "BHdopYoGj2lbGUaZGHLbfov4nbX7nQTuR_-aCTn6WnMTkGPnIwvkIaxmyyfFlkxNPLJAe_l6JzFo88I6EXFMAwI";

const polygonRpcProvider = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x89",
  rpcTarget:
    "https://polygon-mainnet.g.alchemy.com/v2/ncx52BUu0ARYIishpcAGXjQQqnvzdy-c",
  displayName: "Polygon",
  blockExplorer: "https://polygonscan.com/",
  ticker: "MATIC",
  tickerName: "MATIC",
};

const mainnetProvider = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x1",
  displayName: "Ethereum Mainnet",
  rpcTarget: "https://rpc.ankr.com/eth",
  blockExplorer: "https://etherscan.io/",
  ticker: "ETH",
  tickerName: "Ethereum",
};

const metamaskAdapter = new MetamaskAdapter({
  clientId,
  sessionTime: 86400, // 1 hour in seconds
  web3AuthNetwork: "sapphire_mainnet",
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x1",
    rpcTarget: "https://rpc.ankr.com/eth",
  },
});

const web3AuthModalOptions: Web3AuthOptions = {
  clientId,
  chainConfig: mainnetProvider,
  web3AuthNetwork: OPENLOGIN_NETWORK.SAPPHIRE_MAINNET,
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




  const initWeb3Auth = async () => {
    try {
      await _web3auth.initModal(web3AuthModalParameters);
      const web3authProvider = await _web3auth.connect();
      if (web3authProvider) {
        const user = await _web3auth.getUserInfo();
        if (Object.keys(user).length === 0) {
          setIsMetamask(true);
        }
        setProvider(web3authProvider);
        setUser(user);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  useEffect(() => {
    const execute = async () => {
      const signature = await getSignature();
      if (provider) {
        const etherProvider = new ethers.providers.Web3Provider(provider);
        const signer = etherProvider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);
      }

      if (!signature) {
        setIsLoggedIn(false);
        await logout();
        return;
      }
    };
    if (provider) {
      execute();
    }
  }, [provider]);

  useEffect(() => {

    if (window.ethereum && window.ethereum.isMetaMask) {
      setIsMetamask(true);
      twitterPixelEvent('tw-om2cf-om2vj'); // Trigger Twitter event if MetaMask is detected
    }

    initWeb3Auth();
  }, []);

  const login = async () => {
    await switchNetworks("mainnet");

    try {
      const web3authProvider = await _web3auth.connect();
      if (!web3authProvider) {
        return;
      }

      setProvider(web3authProvider);
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

  const logout = async () => {
    await _web3auth.logout();
    setProvider(null);
    setUser(null);
    setUserAddress(undefined);
    setSignature(undefined);
    setIsLoggedIn(false);
    setIsMetamask(false);
    localStorage.removeItem("apiKeyDG");
  };

  const getSignature = async () => {
    try {
      if (!provider) {
        console.log("provider not initialized yet");
        return;
      }

      const localSignature = localStorage.getItem("apiKeyDG");
      if (localSignature) {
        setIsLoggedIn(true);
        return localSignature;
      }

      const message = "Login";
      const etherProvider = new ethers.providers.Web3Provider(provider);
      const signer = etherProvider.getSigner();
      const userSignature = await signer.signMessage(message);
      if (!userSignature) {
        return false;
      }
      setSignature(userSignature);

      setIsLoggedIn(true);
      return userSignature;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // Function to switch networks
  async function switchNetworks(network: "mainnet" | "polygon") {
    // Update the Web3 instance with the Polygon network configuration
    if (!provider) {
      if (window.ethereum) {
        const metaProvider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await metaProvider.getNetwork();
        if (network.chainId !== 1) {
          await metaProvider.send("wallet_switchEthereumChain", [
            { chainId: "0x1" },
          ]);
        }
      }
    } else {
      const chainConfig =
        network === "mainnet" ? mainnetProvider : polygonRpcProvider;
      if (isMetaMask) {
        let tempProvider: ethers.providers.Web3Provider | null =
          new ethers.providers.Web3Provider(provider);
        if (tempProvider) {
          const currentNetwork = await tempProvider.getNetwork();
          if (currentNetwork.chainId !== 137) {
            await provider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x89" }],
            });
            tempProvider = null;
            const maticProvider = new ethers.providers.Web3Provider(provider);
            return maticProvider.getSigner();
          } else {
            return tempProvider.getSigner();
          }
        }
      } else {
        const privateKey = await provider.request<string, string>({
          method: "eth_private_key",
        });

        if (!privateKey) return;
        const polygonPrivateKeyProvider = new EthereumPrivateKeyProvider({
          config: {
            chainConfig: chainConfig,
          },
        });

        await polygonPrivateKeyProvider.setupProvider(privateKey);
        return new ethers.providers.Web3Provider(
          //@ts-expect-error web3Provider is private
          polygonPrivateKeyProvider.provider
        ).getSigner();
      }
    }
  }

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
