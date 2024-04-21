import Web3 from "web3";
import { Env } from "../../../lib/env";
import { error } from "../../../lib/response";
import { tokenIdToPosition } from "../../../helpers/squareHelper";


enum Colors {
  EVEN = `#100e13`,
  ODD = `#0c0b0e`,
  PARCEL = `#716c7a`,
  FILL = `#53eeef`,
  BORDER = `#a433b1`,
}

export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
  

  const { rpcUrl, stateContractAddress,STATE_CONTRACT_ABI } = context.env;
  const web3 = new Web3(rpcUrl);

const stateContract = new web3.eth.Contract(
    JSON.parse(STATE_CONTRACT_ABI),
    stateContractAddress
  );

  const stateTokenId = context.params.id as string;
  let squareTokenIds, positions;

  try {
    squareTokenIds = await stateContract.methods.getStateSquares(stateTokenId).call();
    positions = squareTokenIds.map(tokenId => {
      const { x, y } = tokenIdToPosition(tokenId);
      return [x, y];
    });
  } catch (err) {
    console.error("Error retrieving data from contracts:", err);
    return error("Failed to retrieve data from contracts.", 500);
  }

  
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
  
  let svgContent = `<rect x="0" y="0" width="512" height="512" fill="black" />`;

  // Loop through the grid to create the SVG content
  for (let y = maxY + 1; y >= minY - 1; y--) {
    for (let x = minX - 1; x <= maxX + 1; x++) {
      // Calculate the SVG x position based on transformed coordinates with padding
      let svgX = (x - minX + 1) * size + offsetX + padding;
  
      // Invert the Y coordinate for SVG rendering
      let invertedY = maxY + 1 - y;
      let svgY = invertedY * size + offsetY + padding;
  
      // Determine fill color based on presence in the positions array or odd/even check
      let fill = positions.some(pos => pos[0] === x && pos[1] === y) ? Colors.FILL : 
                 ((x + y) % 2 === 0 ? Colors.EVEN : Colors.ODD);
  
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
