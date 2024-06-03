import { Env } from "../../../lib/env";
import { tokenIdToPosition } from "../../../helpers/squareHelper";

const gridSize = 500;
const sectionsPerSide = 3;
const sectionSize = gridSize / sectionsPerSide;
const size = 512 / sectionsPerSide;
const padding = size * 0.1;
const cellSize = size - 2 * padding;

enum Colors {
  EVEN = '#222',
  ODD = '#666',
  FILL = '#53eeef'
}

export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
  const squareTokenId = context.params.id as string;
  let position;

  try {
    position = tokenIdToPosition(squareTokenId);
  } catch (err) {
    console.error("Error converting token ID to position:", err);
    return new Response("Failed to convert token ID to position.", { status: 500 });
  }

  const { x, y } = position;
  const svgX = Math.floor(x / sectionSize);
  const svgY = sectionsPerSide - 1 - Math.floor(y / sectionSize);
  const fontSize = 48; // Adjusted font size for proper margin

  let svgContent = `<defs><filter id="shadow" x="0" y="0" width="200%" height="200%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
    <feOffset dx="2" dy="2" result="offsetblur"/>
    <feComponentTransfer>
        <feFuncA type="linear" slope="0.5"/>
    </feComponentTransfer>
    <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
    </feMerge>
    </filter></defs>`;

  svgContent += `<rect x="0" y="0" width="512" height="512" fill="#000" />`;

  for (let sy = 2; sy >= 0; sy--) {
    for (let sx = 0; sx < 3; sx++) {
      const posX = sx * size + padding;
      const posY = sy * size + padding;
      const isHighlighted = sx === svgX && sy === svgY;
      const fill = isHighlighted ? Colors.FILL : ((sx + sy) % 2 === 0 ? Colors.EVEN : Colors.ODD);
      svgContent += `<rect x="${posX}" y="${posY}" width="${cellSize}" height="${cellSize}" fill="${fill}" stroke="#fff" stroke-width="2" filter="url(#shadow)"/>`;
    }
  }

  const textFill = Colors.FILL;
  const textPositionY = svgY > 1 ? 55 + (fontSize / 2) : 457;
  const coordinateText = `[${x}, ${y}]`;
  const textWidth = 400;
  const textHeight = 60;
  const textBgX = 256 - textWidth / 2;
  const textBgY = textPositionY - fontSize * 0.8;
  const textStyles = `font-family: 'Arial', sans-serif; font-size: ${fontSize}px; font-weight: bold;`;

  svgContent += `<rect x="${textBgX}" y="${textBgY}" width="${textWidth}" height="${textHeight}" fill="rgba(0,0,0,0.6)" />`;
  svgContent += `<text x="256" y="${textPositionY}" fill="${textFill}" style="${textStyles}" text-anchor="middle" stroke="#000" stroke-width="2" painting-order="fill stroke">${coordinateText}</text>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">${svgContent}</svg>`;

  const response = new Response(svg);
  response.headers.set("Content-Type", "image/svg+xml");
  response.headers.set(
    "Cache-Control",
    "max-age=31536000, s-maxage=31536000, immutable"
  );
  return response;
};
