import { Env } from '../../lib/env'; // Ensure the import path matches your project structure
import { json } from "../../lib/response";
import { tokenIdToPosition } from "../../helpers/squareHelper";

export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
  const { baseUrl, projectName } = context.env;
  const squareTokenId = context.params.id as string;
  let position;

  try {
    position = tokenIdToPosition(squareTokenId);
  } catch (err) {
    console.error("Error converting token ID to position:", err);
    return json({ error: "Failed to convert token ID to position." });
  }

  const coordinate = `(${position.x},${position.y})`;
  const name = `Square ${squareTokenId} at ${projectName}`;
  const description = `Square located at coordinates: ${coordinate}`;

  const result = {
    id: squareTokenId,
    name,
    description,
    image: `${baseUrl}/api/squares/${squareTokenId}/image`,
  };

  return json(result);
};
