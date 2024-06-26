
import { ethers } from 'ethers';
import { useAuth } from '../../context/auth.context'; // Adjust the import path to your AuthContext
import {  getContractConfig } from './contractConfigs';


const metaTx = () => {
    const { provider, userAddress, isSocial, signer } = useAuth();

   

    if (!provider || !userAddress || !signer) {
        console.warn("Provider or user address not found");
        return async () => { throw new Error("Provider or user address not found"); };
    }
    


    const sendMetaTX = async (configName: string, functionName: string, params: any[]) => {
       

        const config = getContractConfig(configName);
        if (!config) {
            console.error('Contract configuration not found for', configName);
            return;
        }

        try {

            const contract = new ethers.Contract(config.address, config.abi, signer);
            
            const nonce = await contract.getNonce(userAddress); // Ensure your contract has such a function
         
        
            const functionCallHex = await contract.populateTransaction[functionName](...params);

            const message = {
                nonce: nonce.toString(),
                from: userAddress,
                functionSignature: functionCallHex.data
            };

            const dataToSign = JSON.stringify({
                types: {
                    EIP712Domain: config.domainType,
                    MetaTransaction: config.types.MetaTransaction,
                },
                domain: config.domain,
                primaryType: "MetaTransaction",
                message: message,
            });
            
           console.log(dataToSign);

           let signature;

           if (!isSocial) {
             signature = await provider.request({
               method: "eth_signTypedData_v4",
               params: [userAddress, dataToSign],
             });
           } else {
             const pkey: any = await provider.request({ method: "eth_private_key" });
             const wallet = new ethers.Wallet(pkey);
             signature = await wallet._signTypedData(
               config.domain,
               {
                 MetaTransaction: config.types.MetaTransaction,
               },
               message
             );
           }
          


            const serverPayload = JSON.stringify({
                transactionData: {
                    from: userAddress,
                    params: [
                        config.address,
                        getExecuteMetaTransactionData(
                            userAddress,
                            signature,
                            functionCallHex.data
                        ),
                    ],
                },
            });

            //console.log(serverPayload);

            const response = await post("https://meta-tx-server.dglive.org/v1/transactions", serverPayload);
            const data = await response.json();
            console.log("Received response:", data);

            return data.txHash;
        } catch (error) {
            console.error("Error processing the buy item transaction:", error);
            throw error;
        }
    };

    return sendMetaTX;
};



async function post(url: any, body: any) {
    return fetch(`${url}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body,
    });
}


function getExecuteMetaTransactionData(
    account: any,
    fullSignature: any,
    functionSignature: any
) {
    const signature = fullSignature.replace("0x", "");
    const r = signature.substring(0, 64);
    const s = signature.substring(64, 128);
    const v = normalizeVersion(signature.substring(128, 130));

    const method = functionSignature.replace("0x", "");
    const signatureLength = (method.length / 2).toString(16);
    const signaturePadding = Math.ceil(method.length / 64);

    return [
        "0x",
        "0c53c51c",
        to32Bytes(account),
        to32Bytes("a0"),
        r,
        s,
        to32Bytes(v),
        to32Bytes(signatureLength),
        padEnd(method, 64 * signaturePadding),
    ].join("");
}


function normalizeVersion(version: string) {
    let parsed = parseInt(version, 16);
    if (parsed < 27) {
        // this is because Ledger returns 0 or 1
        parsed += 27;
    }
    if (parsed !== 27 && parsed !== 28) {
        //throw Error(Invalid signature version "${version}" (parsed: ${parsed}))
    }
    return parsed.toString(16);
}

function  to32Bytes(value: { toString: () => string; }) {
    return padStart(value.toString().replace("0x", ""), 64);
}
function  padStart(src: string | any[], length: number) {
    const len = src.length;
    if (len >= length) return src;
    if (len % 2 !== 0) src = "0" + src;
    if (len < length)
        while (src.length < length) {
            src = "0" + src;
        }
    return src;
}

function  padEnd(src: string | any[], length: number) {
    const len = src.length;
    if (len >= length) return src;
    if (len % 2 !== 0) src = "0" + src;
    if (len < length)
        while (src.length < length) {
            src += "0";
        }
    return src;
}

export default metaTx;
