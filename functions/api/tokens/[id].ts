import { ethers } from "ethers";
import { Env } from '../../interfaces/Env'; // Make sure the import path matches your project structure
import { json } from "../../lib/response";

export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
  const { rpcUrl, stateContractAddress, squaresContractAddress, baseUrl } = context.env;
  console.log("Using RPC URL: ", rpcUrl);  // Log the RPC URL to verify it's correct
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  
  provider.getBlockNumber().then((blockNumber) => {
    console.log("Current block number: ", blockNumber);
  }).catch((error) => {
    console.error("Error fetching block number: ", error);
  });


  const stateContract = new ethers.Contract(
    stateContractAddress,
    ["function getStateSquares(uint256) public view returns (uint256[])"],
    provider
  );
  const squaresContract = new ethers.Contract(
    squaresContractAddress,
    ["function tokenIdToPosition(uint256) public pure returns (uint256, uint256)"],
    provider
  );


  const stateTokenId = context.params.id as string;
  const squareTokenIds = await stateContract.getStateSquares(stateTokenId);
  const coordinates = await Promise.all(
    squareTokenIds.map(tokenId => squaresContract.tokenIdToPosition(tokenId))
  );

  const coordinatePairs = coordinates.map(([x, y]) => `(${x},${y})`).join(",");
  const name = `State${stateTokenId}`;
  const description = `State conformed by Squares: ${coordinatePairs}`;

  const result = {
    id: stateTokenId,
    name,
    description,
    image: `${baseUrl}/api/tokens/${stateTokenId}/image`,
    external_url: `${baseUrl}/view/${stateTokenId}`,
    attributes: []
  };

  return json(result);
};
