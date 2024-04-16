import Web3 from "web3";
import { Env } from '../../lib/env'; // Ensure the import path matches your project structure
import { json } from "../../lib/response";
import { tokenIdToPosition } from "../../helpers/squareHelper";


export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
  const { rpcUrl, stateContractAddress, baseUrl,STATE_CONTRACT_ABI,projectName } = context.env;
  const web3 = new Web3(rpcUrl);

  const stateContract = new web3.eth.Contract(
    JSON.parse(STATE_CONTRACT_ABI),
    stateContractAddress
  );

  const stateTokenId = context.params.id as string;
  let squareTokenIds, coordinates;

  try {
    squareTokenIds = await stateContract.methods.getStateSquares(stateTokenId).call();
    coordinates = squareTokenIds.map(tokenId => {
      const position = tokenIdToPosition(tokenId);
      return `(${position.x},${position.y})`;
    });
  } catch (err) {
    console.error("Error retrieving data from contracts:", err);
    return json({ error: "Failed to retrieve data from contracts." });
  }

  const coordinatePairs = coordinates.join(",");
  const name = `State ${stateTokenId} at ${projectName} `;
  const description = `State conformed by Squares: ${coordinatePairs}`;

  const result = {
    id: stateTokenId,
    name,
    description,
    image: `${baseUrl}/api/tokens/${stateTokenId}/image`,
  };

  return json(result);
};
