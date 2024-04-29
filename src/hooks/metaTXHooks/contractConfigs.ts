// Interface for individual contract configuration
interface ContractConfig {
  address: string;
  abi: any;
  domainType: Array<{ name: string; type: string }>;
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  types: {
    MetaTransaction: Array<{ name: string; type: string }>;
  };
}

// Interface for the collection of all contract configurations
interface ContractConfigs {
  [key: string]: ContractConfig; // Index signature
}

// Define configurations for each contract
const configs: ContractConfigs = {
  marketplace: {
    address: '0x63eBcB9c8e9A40dBA33676CAF0A9837Efa17CB56',
    abi: [
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "_nftAddress",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256[]",
              "name": "_tokenIds",
              "type": "uint256[]"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "_msgSender",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address[]",
              "name": "beneficiaries",
              "type": "address[]"
            }
          ],
          "name": "Buy",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "_nftAddress",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256[]",
              "name": "_tokenIds",
              "type": "uint256[]"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "_msgSender",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "_transferTo",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address[]",
              "name": "beneficiaries",
              "type": "address[]"
            }
          ],
          "name": "BuyForGift",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "_nftAddress",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "_msgSender",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256[]",
              "name": "_tokenIds",
              "type": "uint256[]"
            }
          ],
          "name": "Cancel",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint8",
              "name": "version",
              "type": "uint8"
            }
          ],
          "name": "Initialized",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "userAddress",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address payable",
              "name": "relayerAddress",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "bytes",
              "name": "functionSignature",
              "type": "bytes"
            }
          ],
          "name": "MetaTransactionExecuted",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferred",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "_paymentId",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "_transferTo",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "_nftAddress",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "_tokenId",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "beneficiary",
              "type": "address"
            }
          ],
          "name": "PaperPurchase",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "_nftAddress",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "_msgSender",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256[]",
              "name": "_tokenIds",
              "type": "uint256[]"
            },
            {
              "indexed": false,
              "internalType": "uint256[]",
              "name": "_prices",
              "type": "uint256[]"
            }
          ],
          "name": "Sell",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "_oldFee",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "_newFee",
              "type": "uint256"
            }
          ],
          "name": "SetFee",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "_oldFeeOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "_newFeeOwner",
              "type": "address"
            }
          ],
          "name": "SetFeeOwner",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "_newFee",
              "type": "uint256"
            }
          ],
          "name": "SetFeeTips",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "_nftAddress",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "_tokenId",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "_newPrice",
              "type": "uint256"
            }
          ],
          "name": "SetPrice",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "_to",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "_from",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "_amount",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "_feeAmount",
              "type": "uint256"
            }
          ],
          "name": "TippedToken",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "_affiliate",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "fee",
              "type": "uint256"
            }
          ],
          "name": "affiliateFee",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "_affiliate",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "name": "affiliatePaid",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "affiliate",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "referral",
              "type": "address"
            }
          ],
          "name": "affiliateReferred",
          "type": "event"
        },
        {
          "stateMutability": "payable",
          "type": "fallback"
        },
        {
          "inputs": [],
          "name": "BASE_FEE",
          "outputs": [
            {
              "internalType": "uint32",
              "name": "",
              "type": "uint32"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "ICE_token",
          "outputs": [
            {
              "internalType": "contract IERC20",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "USDC_token",
          "outputs": [
            {
              "internalType": "contract IERC20",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "adminWallet",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_affiliate",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "name": "affiliatePayout",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_nftAddress",
              "type": "address"
            },
            {
              "internalType": "uint256[]",
              "name": "_tokenIds",
              "type": "uint256[]"
            },
            {
              "internalType": "uint256[]",
              "name": "agreedPrices",
              "type": "uint256[]"
            }
          ],
          "name": "buy",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_nftAddress",
              "type": "address"
            },
            {
              "internalType": "uint256[]",
              "name": "_tokenIds",
              "type": "uint256[]"
            },
            {
              "internalType": "address",
              "name": "_transferTo",
              "type": "address"
            },
            {
              "internalType": "uint256[]",
              "name": "agreedPrices",
              "type": "uint256[]"
            }
          ],
          "name": "buyForGift",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_nftAddress",
              "type": "address"
            },
            {
              "internalType": "uint256[]",
              "name": "_tokenIds",
              "type": "uint256[]"
            }
          ],
          "name": "cancel",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "userAddress",
              "type": "address"
            },
            {
              "internalType": "bytes",
              "name": "functionSignature",
              "type": "bytes"
            },
            {
              "internalType": "bytes32",
              "name": "sigR",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "sigS",
              "type": "bytes32"
            },
            {
              "internalType": "uint8",
              "name": "sigV",
              "type": "uint8"
            }
          ],
          "name": "executeMetaTransaction",
          "outputs": [
            {
              "internalType": "bytes",
              "name": "",
              "type": "bytes"
            }
          ],
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "fee",
          "outputs": [
            {
              "internalType": "uint32",
              "name": "",
              "type": "uint32"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "feeOwner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_user",
              "type": "address"
            }
          ],
          "name": "getNonce",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "nonce",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_nftAddress",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "_tokenId",
              "type": "uint256"
            }
          ],
          "name": "getOrderActive",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_nftAddress",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "_tokenId",
              "type": "uint256"
            }
          ],
          "name": "getOrderBeneficiary",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_nftAddress",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "_tokenId",
              "type": "uint256"
            }
          ],
          "name": "getPrice",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "initialize",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_nftAddress",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "_tokenId",
              "type": "uint256"
            }
          ],
          "name": "isActive",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "minPrice",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "orderbook",
          "outputs": [
            {
              "internalType": "bool",
              "name": "active",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "beneficiary",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "paperKeyManager",
          "outputs": [
            {
              "internalType": "contract IPaperKeyManager",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "name": "referrers",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_paperKey",
              "type": "address"
            }
          ],
          "name": "registerPaperKey",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "renounceOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "router",
          "outputs": [
            {
              "internalType": "contract Router",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_nftAddress",
              "type": "address"
            },
            {
              "internalType": "uint256[]",
              "name": "_tokenIds",
              "type": "uint256[]"
            },
            {
              "internalType": "uint256[]",
              "name": "_prices",
              "type": "uint256[]"
            },
            {
              "internalType": "address",
              "name": "affiliate",
              "type": "address"
            }
          ],
          "name": "sell",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_nftAddress",
              "type": "address"
            },
            {
              "internalType": "uint256[]",
              "name": "_tokenIds",
              "type": "uint256[]"
            },
            {
              "internalType": "uint256[]",
              "name": "_prices",
              "type": "uint256[]"
            }
          ],
          "name": "sell",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_adminWallet",
              "type": "address"
            }
          ],
          "name": "setAdminWallet",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_affiliate",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "fee",
              "type": "uint256"
            }
          ],
          "name": "setAffiliateFee",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint32",
              "name": "_newFee",
              "type": "uint32"
            }
          ],
          "name": "setFee",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_newFeeOwner",
              "type": "address"
            }
          ],
          "name": "setFeeOwner",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_newFee",
              "type": "uint256"
            }
          ],
          "name": "setFeeTips",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "newMinPrice",
              "type": "uint256"
            }
          ],
          "name": "setMinPrice",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_affiliate",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "_referral",
              "type": "address"
            }
          ],
          "name": "setReferralAffiliate",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "_amount",
              "type": "uint256"
            }
          ],
          "name": "tipToken",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "tipsFee",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "withdrawAll",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_token",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "_amount",
              "type": "uint256"
            }
          ],
          "name": "withdrawERC20",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "stateMutability": "payable",
          "type": "receive"
        }
      ],
    domainType: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "verifyingContract", type: "address" },
      { name: "chainId", type: "bytes32" }
    ],
    domain: {
      name: 'DGMarketplace',
      version: 'v1.0',
      chainId: 1,
      verifyingContract: '0x63eBcB9c8e9A40dBA33676CAF0A9837Efa17CB56'
    },
    types: {
      MetaTransaction: [
        { name: "nonce", type: "uint256" },
        { name: "from", type: "address" },
        { name: "functionSignature", type: "bytes" }
      ]
    }
  },
  // Additional contracts can be defined here similarly
};

// Function to retrieve a contract configuration by name
export function getContractConfig(name: string): ContractConfig | undefined {
  return configs[name];
}
