import type {
  AnyTileDefinition,
  PropertyTileDefinition,
  RailroadTileDefinition,
  UtilityTileDefinition,
  TaxTileDefinition,
  CornerTileDefinition,
  TileDefinition,
  PropertyGroup,
} from '@richup/shared-types';

/**
 * Complete 40-tile RichUp board definition.
 *
 * Layout (clockwise from bottom-left):
 *   Bottom row (0–10): GO → … → Jail/Visit
 *   Right column (11–19): properties going up
 *   Top row (20–30): Free Parking → … → Go To Jail
 *   Left column (31–39): properties going down back to GO
 */

// ─── Helper factories ───

function property(
  index: number,
  name: string,
  group: PropertyGroup,
  price: number,
  houseCost: number,
  rent: [number, number, number, number, number, number],
  icon: string,
  flag?: string,
): PropertyTileDefinition {
  return {
    index,
    name,
    type: 'property',
    group,
    price,
    houseCost,
    rent,
    mortgageValue: Math.floor(price / 2),
    icon,
    flag,
  };
}

function railroad(
  index: number,
  name: string,
  icon: string,
  flag?: string,
): RailroadTileDefinition {
  return {
    index,
    name,
    type: 'railroad',
    price: 200,
    rent: [25, 50, 100, 200],
    mortgageValue: 100,
    icon,
    flag,
  };
}

function utility(
  index: number,
  name: string,
  icon: string,
): UtilityTileDefinition {
  return {
    index,
    name,
    type: 'utility',
    price: 150,
    mortgageValue: 75,
    icon,
  };
}

function tax(
  index: number,
  name: string,
  amount: number,
  icon: string,
): TaxTileDefinition {
  return { index, name, type: 'tax', amount, icon };
}

function corner(
  index: number,
  name: string,
  cornerType: CornerTileDefinition['cornerType'],
  icon: string,
): CornerTileDefinition {
  return { index, name, type: 'corner', cornerType, icon };
}

function special(
  index: number,
  name: string,
  type: 'chance' | 'community-chest',
  icon: string,
): TileDefinition {
  return { index, name, type, icon };
}

// ─── Board Definition ───

export const BOARD_TILES: AnyTileDefinition[] = [
  // ── Bottom Row (0–10) ──
  corner(0, 'GO', 'go', '🎮'),
  property(1, 'Salvador', 'brown', 60, 50, [2, 10, 30, 90, 160, 250], '🏺', '🇧🇷'),
  special(2, 'Community Chest', 'community-chest', '📊'),
  property(3, 'Rio de Janeiro', 'brown', 60, 50, [4, 20, 60, 180, 320, 450], '🏔️', '🇧🇷'),
  tax(4, 'Income Tax', 200, '📋'),
  railroad(5, 'TLV Airport', '✈️', '🇮🇱'),
  property(6, 'Tel Aviv', 'light-blue', 100, 50, [6, 30, 90, 270, 400, 550], '🏙️', '🇮🇱'),
  special(7, 'Chance', 'chance', '❓'),
  property(8, 'Haifa', 'light-blue', 100, 50, [6, 30, 90, 270, 400, 550], '⛵', '🇮🇱'),
  property(9, 'Jerusalem', 'light-blue', 120, 50, [8, 40, 100, 300, 450, 600], '⛪', '🇮🇱'),
  corner(10, 'Jail / Just Visiting', 'jail', '⚠️'),

  // ── Right Column (11–19) ──
  property(11, 'Rome', 'pink', 140, 100, [10, 50, 150, 450, 625, 750], '🏛️', '🇮🇹'),
  utility(12, 'Electric Company', '⚡'),
  property(13, 'Milan', 'pink', 140, 100, [10, 50, 150, 450, 625, 750], '🏢', '🇮🇹'),
  property(14, 'Venice', 'pink', 160, 100, [12, 60, 180, 500, 700, 900], '🛶', '🇮🇹'),
  railroad(15, 'Munich Airport', '✈️', '🇩🇪'),
  property(16, 'Frankfurt', 'orange', 180, 100, [14, 70, 200, 550, 750, 950], '🏢', '🇩🇪'),
  special(17, 'Community Chest', 'community-chest', '🅿️'),
  property(18, 'Munich', 'orange', 180, 100, [14, 70, 200, 550, 750, 950], '🍺', '🇩🇪'),
  property(19, 'Berlin', 'orange', 200, 100, [16, 80, 220, 600, 800, 1000], '🏛️', '🇩🇪'),

  // ── Top Row (20–30) ──
  corner(20, 'Free Parking', 'free-parking', '🅿️'),
  property(21, 'Shanghai', 'red', 220, 150, [18, 90, 250, 700, 875, 1050], '🏙️', '🇨🇳'),
  special(22, 'Chance', 'chance', '❓'),
  property(23, 'Beijing', 'red', 220, 150, [18, 90, 250, 700, 875, 1050], '🏰', '🇨🇳'),
  property(24, 'Shenzhen', 'red', 240, 150, [20, 100, 300, 750, 925, 1100], '🌆', '🇨🇳'),
  railroad(25, 'CDG Airport', '✈️', '🇫🇷'),
  property(26, 'Toulouse', 'yellow', 260, 150, [22, 110, 330, 800, 975, 1150], '🏛️', '🇫🇷'),
  property(27, 'Lyon', 'yellow', 260, 150, [22, 110, 330, 800, 975, 1150], '🍷', '🇫🇷'),
  utility(28, 'Water Works', '💧'),
  property(29, 'Versailles', 'yellow', 280, 150, [24, 120, 360, 850, 1025, 1200], '⛲', '🇫🇷'),

  // ── Left Column (30–39) ──
  corner(30, 'Go To Jail', 'go-to-jail', '🚔'),
  property(31, 'London', 'green', 300, 200, [26, 130, 390, 900, 1100, 1275], '🎡', '🇬🇧'),
  property(32, 'Manchester', 'green', 300, 200, [26, 130, 390, 900, 1100, 1275], '🏟️', '🇬🇧'),
  special(33, 'Community Chest', 'community-chest', '🎁'),
  property(34, 'Liverpool', 'green', 320, 200, [28, 150, 450, 1000, 1200, 1400], '🎸', '🇬🇧'),
  railroad(35, 'JFK\nAirport', '✈️', '🇺🇸'),
  special(36, 'Chance', 'chance', '❓'),
  property(37, 'San Francisco', 'dark-blue', 350, 200, [35, 175, 500, 1100, 1300, 1500], '🌉', '🇺🇸'),
  tax(38, 'Luxury Tax', 100, '💰'),
  property(39, 'New York', 'dark-blue', 400, 200, [50, 200, 600, 1400, 1700, 2000], '🗽', '🇺🇸'),
];

// ─── Lookup helpers ───

/** Map of tile index → tile definition */
export const TILE_MAP = new Map<number, AnyTileDefinition>(
  BOARD_TILES.map((t) => [t.index, t]),
);

/** Get all property tiles belonging to a color group */
export function getGroupTiles(group: PropertyGroup): PropertyTileDefinition[] {
  return BOARD_TILES.filter(
    (t): t is PropertyTileDefinition => t.type === 'property' && (t as PropertyTileDefinition).group === group,
  );
}

/** How many properties are in each color group */
export const GROUP_SIZES: Record<PropertyGroup, number> = {
  brown: 2,
  'light-blue': 3,
  pink: 3,
  orange: 3,
  red: 3,
  yellow: 3,
  green: 3,
  'dark-blue': 2,
};

/** Total number of tiles on the board */
export const BOARD_SIZE = 40;

/** Starting cash per player */
export const STARTING_CASH = 1500;

/** GO salary */
export const GO_SALARY = 200;

/** Jail bail amount */
export const JAIL_BAIL = 50;

/** Max turns in jail before forced to pay */
export const MAX_JAIL_TURNS = 3;

/** Max consecutive doubles before going to jail */
export const MAX_DOUBLES = 3;

/** Total houses available in the bank */
export const TOTAL_HOUSES = 32;

/** Total hotels available in the bank */
export const TOTAL_HOTELS = 12;

/** All railroad tile indices */
export const RAILROAD_INDICES = BOARD_TILES
  .filter((t) => t.type === 'railroad')
  .map((t) => t.index);

/** All utility tile indices */
export const UTILITY_INDICES = BOARD_TILES
  .filter((t) => t.type === 'utility')
  .map((t) => t.index);
