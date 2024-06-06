import bs58 from 'bs58';
import { ethers } from 'ethers';

export function ipfsHashToBytes32(ipfsHash: string) {
    const bytes = bs58.decode(ipfsHash);
    const hashBytes = bytes.slice(2); // Assuming the hash starts at the third byte
    return ethers.utils.hexlify(ethers.utils.zeroPad(hashBytes, 32));
}


// twitterPixelHelper.ts
export const twitterPixelEvent = (eventId: string, params: { [key: string]: any } = {}) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
  
    const paramsString = JSON.stringify(params).replace(/"([^"]+)":/g, '$1:'); // Convert params object to string and remove quotes from keys
  
    script.innerHTML = `
      twq('event', '${eventId}', ${paramsString});
    `;
    document.head.appendChild(script);
  };
  

  export function refreshCache() {
    const endpoint = 'https://squares.town/api/graphSquares';
  
    // Using fetch without await for fire-and-forget
    fetch(endpoint, { method: 'POST' })
      .then(response => {
        if (!response.ok) {
          console.error('Error triggering backend update:', response.statusText);
        } else {
          console.log('Backend update triggered successfully');
        }
      })
      .catch(error => {
        console.error('Error triggering backend update:', error);
      });
  }