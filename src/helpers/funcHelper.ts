import bs58 from 'bs58';
import { ethers } from 'ethers';

export function ipfsHashToBytes32(ipfsHash: string) {
    const bytes = bs58.decode(ipfsHash);
    const hashBytes = bytes.slice(2); // Assuming the hash starts at the third byte
    return ethers.utils.hexlify(ethers.utils.zeroPad(hashBytes, 32));
}