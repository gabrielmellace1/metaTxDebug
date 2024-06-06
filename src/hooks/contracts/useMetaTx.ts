
import { ethers } from 'ethers';
import { useAuth } from '../../context/auth.context'; // Adjust the import path to your AuthContext
import {  getContractConfig } from './contractConfigs';


const metaTx = () => {
    const { provider, userAddress,isMetaMask,signer } = useAuth();


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

            await provider?.request({
                method: "wallet_switchEthereumChain",
                params: [
                  {
                    chainId: "0x13E31",
                  },
                ],
              });

            

            //let currentSigner = await getUpdatedSigner();
           // if (!currentSigner) throw new Error("Failed to get updated signer");

            //const newProvider = new ethers.providers.Web3Provider(provider);
            //await newProvider.send("eth_requestAccounts", []);

            //const signerNew = newProvider.getSigner();
           // const accountAddress = await signerNew.getAddress();

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

           if(isMetaMask) {
            signature =  await window.ethereum.request({
                 method: "eth_signTypedData_v4",
                 params: [userAddress, dataToSign],
                 jsonrpc: "2.0",
                 id: 999999999999,
             });
            }
            else {
                const etherProvider = new ethers.providers.Web3Provider(provider);
            const signer2 = etherProvider.getSigner();
            const signerAddress = await signer2.getAddress();

            console.log('Signer address:', signerAddress);

            // Ensure the signer address is not null
            if (!signerAddress) {
                throw new Error("Signer address is null");
            }

            // Logging the provider to ensure it's correctly initialized
            console.log('Signer provider:', signer2.provider);

            try {
                // Attempt to use signer2._signTypedData directly if available
                if (signer2._signTypedData) {
                    signature = await signer2._signTypedData(
                        config.domain,
                        {
                            MetaTransaction: config.types.MetaTransaction,
                        },
                        message
                    );
                } else {
                    signature = await signer2.provider.send("eth_signTypedData_v4", [
                        userAddress,
                        dataToSign,
                    ]);
                }
            } catch (innerError) {
                console.error('Inner error during signing:', innerError);

                // Fallback to using eth_signTypedData (legacy) if v4 fails
                signature = await signer2.provider.send("eth_signTypedData", [
                    userAddress,
                    dataToSign,
                ]);
            }
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
