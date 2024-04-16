import { Env } from "../../../interfaces/Env";
import { error } from "../../../lib/response";

// Import and setup necessary for Ethereum blockchain interaction, commented for later use
// import { ethers } from "ethers";
// const provider = new ethers.providers.JsonRpcProvider("https://your-provider-url");
// const stateContractAddress = "0xFC9fbEEc0FFa9eF506c40c61114b5e18f378241c";
// const squareContractAddress = "0xE50f8Ce7F5aD35cd75cEF91F2c0E2b56b285ff80";
// const stateContractABI = ["function getStateSquares(uint256 stateId) public view returns (uint256[])"];
// const squareContractABI = ["function tokenIdToPosition(uint256 tokenId) public pure returns (uint256, uint256)"];

enum Colors {
  EVEN = `#100e13`,
  ODD = `#0c0b0e`,
  PARCEL = `#716c7a`,
  FILL = `#53eeef`,
  BORDER = `#a433b1`,
}

export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
  // const stateId = context.params.id as string;

  // Uncomment the following code when ready to integrate with Ethereum smart contracts
  /*
  const stateContract = new ethers.Contract(stateContractAddress, stateContractABI, provider);
  const squareContract = new ethers.Contract(squareContractAddress, squareContractABI, provider);
  let squares;
  try {
    squares = await stateContract.getStateSquares(stateId);
  } catch (e) {
    return error(`Failed to fetch state squares for stateId=${stateId}: ${e.message}`, 400);
  }
  const positions = await Promise.all(squares.map(tokenId => squareContract.tokenIdToPosition(tokenId)));
  */

  const positions = [
    [5, 5], [5, 6], [6, 5], [6, 8]
  ];
  
  // Calculate the grid dimensions including the additional rows and columns
  const maxX = Math.max(...positions.map(pos => pos[0]));
  const maxY = Math.max(...positions.map(pos => pos[1]));
  const minX = Math.min(...positions.map(pos => pos[0]));
  const minY = Math.min(...positions.map(pos => pos[1]));
  
  // Calculate the number of cells horizontally and vertically (including borders)
  const totalColumns = maxX - minX + 3;
  const totalRows = maxY - minY + 3;
  
  // Calculate the size of each cell to fit the 512x512 dimension
  const size = 512 / Math.max(totalColumns, totalRows);
  
  // Determine the size of the actual content
  const contentWidth = totalColumns * size;
  const contentHeight = totalRows * size;
  
  // Calculate offset to center the content in the 512x512 viewBox
  const offsetX = (512 - contentWidth) / 2;
  const offsetY = (512 - contentHeight) / 2;
  
  // Define padding - adjust based on desired border thickness
  const padding = size * 0.05; // 10% of each cell size for padding
  const cellSize = size - 2 * padding; // Adjust cell size to account for padding
  
  // Initialize SVG content with a black background rectangle
  let svgContent = `<rect x="0" y="0" width="512" height="512" fill="black" />`;
  
  for (let y = minY - 1; y <= maxY + 1; y++) {
    for (let x = minX - 1; x <= maxX + 1; x++) {
      // Calculate the SVG x and y positions based on transformed coordinates with padding
      let svgX = (x - minX + 1) * size + offsetX + padding;
      let svgY = (y - minY + 1) * size + offsetY + padding;
  
      // Determine fill color based on presence in the positions array or odd/even check
      let fill = positions.some(pos => pos[0] === x && pos[1] === y) ? "#53eeef" : 
                 (((x + y) % 2) === 0 ? "#252526" : "#100e13");
  
      // Add the rect element for this cell with adjusted size
      svgContent += `<rect x="${svgX}" y="${svgY}" width="${cellSize}" height="${cellSize}" fill="${fill}" stroke="black" />`;
    }
  }
  
  // Wrap the content in the <svg> element with fixed dimensions of 512x512 pixels
  svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">${svgContent}</svg>`;
  
  // Example of how you might use svgContent in an HTML file
  // document.getElementById('svgContainer').innerHTML = svgContent;
  

  const response = new Response(svgContent);
  response.headers.set("Content-Type", "image/svg+xml");
  response.headers.set(
    "Cache-Control",
    "max-age=31536000, s-maxage=31536000, immutable"
  );
  return response;
};
