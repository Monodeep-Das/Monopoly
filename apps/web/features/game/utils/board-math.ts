export interface Point { x: number; y: number; }
export interface Rect extends Point { w: number; h: number; }

const BOARD_SIZE = 990;
const CORNER_SIZE = 135;
const EDGE_WIDTH = 80;

export function getTileRect(index: number): Rect {
  const safeIndex = index % 40;

  if (safeIndex === 0) return { x: BOARD_SIZE - CORNER_SIZE, y: BOARD_SIZE - CORNER_SIZE, w: CORNER_SIZE, h: CORNER_SIZE }; // Go
  if (safeIndex > 0 && safeIndex < 10) return { x: BOARD_SIZE - CORNER_SIZE - (safeIndex * EDGE_WIDTH), y: BOARD_SIZE - CORNER_SIZE, w: EDGE_WIDTH, h: CORNER_SIZE }; // Bottom
  if (safeIndex === 10) return { x: 0, y: BOARD_SIZE - CORNER_SIZE, w: CORNER_SIZE, h: CORNER_SIZE }; // Jail
  if (safeIndex > 10 && safeIndex < 20) return { x: 0, y: BOARD_SIZE - CORNER_SIZE - ((safeIndex - 10) * EDGE_WIDTH), w: CORNER_SIZE, h: EDGE_WIDTH }; // Left
  if (safeIndex === 20) return { x: 0, y: 0, w: CORNER_SIZE, h: CORNER_SIZE }; // Free Parking
  if (safeIndex > 20 && safeIndex < 30) return { x: CORNER_SIZE + ((safeIndex - 21) * EDGE_WIDTH), y: 0, w: EDGE_WIDTH, h: CORNER_SIZE }; // Top
  if (safeIndex === 30) return { x: BOARD_SIZE - CORNER_SIZE, y: 0, w: CORNER_SIZE, h: CORNER_SIZE }; // Go To Jail
  if (safeIndex > 30 && safeIndex < 40) return { x: BOARD_SIZE - CORNER_SIZE, y: CORNER_SIZE + ((safeIndex - 31) * EDGE_WIDTH), w: CORNER_SIZE, h: EDGE_WIDTH }; // Right
  
  return { x: 0, y: 0, w: 0, h: 0 };
}

export function getTileCenter(index: number): Point {
  const rect = getTileRect(index);
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
}

export function getTokenPositionsForTile(index: number, tokenCount: number): Point[] {
  const center = getTileCenter(index);
  const isCorner = index % 10 === 0;
  
  if (tokenCount === 0) return [];
  if (tokenCount === 1) return [center];

  const radius = isCorner ? 25 : 15;
  const positions: Point[] = [];
  
  for (let i = 0; i < tokenCount; i++) {
    const angle = (i / tokenCount) * Math.PI * 2;
    positions.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    });
  }
  
  return positions;
}
