
import metaTx from './useMetaTx';
import { useAuth } from '../../context/auth.context';

const useSendTx = () => {
  const { isMetaMask, getUpdatedSigner } = useAuth();

  const sendMetaTx = metaTx();

  const sendTransaction = async (configName: string, functionName: string, params: any[]) => {
   

    if (isMetaMask) {
      console.log("Using sendTx for MetaMask...");
      return await sendMetaTx(configName, functionName, params);
    } else {
      console.log("Using sendMetaTx for other wallets...");
      return await sendMetaTx(configName, functionName, params);
    }
  };

  return sendTransaction;
};

export default useSendTx;
