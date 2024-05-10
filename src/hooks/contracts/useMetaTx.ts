
import { ethers } from 'ethers';
import { useAuth } from '../../context/auth.context'; // Adjust the import path to your AuthContext
import { getContractConfig } from './contractConfigs';
import { useMemo } from 'react';


const metaTx = () => {
    const { provider, userAddress } = useAuth();

    const POLProvider = useMemo(() => {
        return new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/ncx52BUu0ARYIishpcAGXjQQqnvzdy-c");
      }, []);

    var POLSigner = POLProvider.getSigner(userAddress);

    if (!provider || !userAddress) {
        console.warn("Provider or user address not found");
        return async () => { throw new Error("Provider or user address not found"); };
    }
    
    const ETHprovider = new ethers.providers.Web3Provider(provider);

    



    const sendMetaTX = async (configName: string, functionName: string, params: any[]) => {
       

        const config = getContractConfig(configName);
        if (!config) {
            console.error('Contract configuration not found for', configName);
            return;
        }

        try {

            //console.log(provider);

            
            
            //console.log(ETHprovider);
            
            const ETHSigner = ETHprovider.getSigner();



            // Polygon confg
            


            // Load contract
            const contract = new ethers.Contract(config.address, config.abi, POLSigner);
            // Get nonce
            const nonce = await contract.getNonce(userAddress); // Ensure your contract has such a function
         
        


            const functionCallHex = await contract.populateTransaction[functionName](...params);

            const message = {
                nonce: nonce.toNumber(),
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

            // Requesting a signature
            // This one works for metamask, but not for web3auth
             const signature = await ETHSigner._signTypedData(config.domain, config.types, message);

            
           //const signature = await requestUserSignature(ETHprovider,dataToSign, 'metamask');

          



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


// async function requestUserSignature(provider: ethers.providers.Web3Provider, dataToSign: string, walletType: string) {
//     let signature;

//     console.log(`Requesting user signature with walletType: ${walletType}`);
//     console.log("Data to sign:", dataToSign);

//     if (walletType === "metamask") {
//         // Assuming provider is passed as an instance of ethers.providers.Web3Provider
//         const signer = provider.getSigner();
//         const account = await signer.getAddress();

//         try {
//             // MetaMask requires the domain and types separately from the message
//             signature = await provider.send('eth_signTypedData_v4', [
//                 account, // Address obtained from the signer
//                 JSON.parse(dataToSign) // Ensure dataToSign is correctly formatted per EIP-712
//             ]);
//             console.log("Signature received:", signature);
//         } catch (error) {
//             console.error("Error signing data:", error);
//         }
//     }
//     // Handle other wallet types similarly

//     return signature;
// }

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
