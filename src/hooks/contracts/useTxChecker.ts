import { ethers } from 'ethers';
import { useMemo } from 'react';
import { blastRPC } from './contractConfigs';

const useTxChecker = () => {
    

    const polygonProvider = useMemo(() => {
        return new ethers.providers.JsonRpcProvider(blastRPC);
      }, []);


    const checkTransactionStatus = async (txHash: string, setInfoModalHeader: Function, setInfoModalBody: Function) => {
        try {
            setInfoModalHeader("Processing status");
            setInfoModalBody("Please wait, waiting for transaction: " + txHash);

            let txReceipt = await polygonProvider.getTransactionReceipt(txHash);
            while (!txReceipt) {
                await polygonProvider.waitForTransaction(txHash);
                txReceipt = await polygonProvider.getTransactionReceipt(txHash);
            }

            const status = txReceipt.status === 1
                ? { txReceipt, status: true }
                : { txReceipt, status: false };

            return status;
        } catch (error) {
            console.error("Error fetching transaction status:", error);
            setInfoModalHeader("Transaction Status Unknown");
            setInfoModalBody("Unable to retrieve transaction status. Please try again later.");
            throw error;
        }
    };

    return { checkTransactionStatus };
};

export default useTxChecker;
