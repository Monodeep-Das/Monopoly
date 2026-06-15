// ─── Tile Types ───

export type TileType =
  | 'property'
  | 'railroad'
  | 'utility'
  | 'tax'
  | 'chance'
  | 'community-chest'
  | 'corner';

export type CornerType = 'go' | 'jail' | 'free-parking' | 'go-to-jail';

export type PropertyGroup =
  | 'brown'
  | 'light-blue'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'dark-blue';

export interface TileDefinition {
  index: number;
  name: string;
  type: TileType;
  icon: string;
  flag?: string;
}

export interface PropertyTileDefinition extends TileDefinition {
  type: 'property';
  group: PropertyGroup;
  price: number;
  houseCost: number;
  rent: [number, number, number, number, number, number]; // [base, 1h, 2h, 3h, 4h, hotel]
  mortgageValue: number;
}

export interface RailroadTileDefinition extends TileDefinition {
  type: 'railroad';
  price: number;
  rent: [number, number, number, number]; // [1rr, 2rr, 3rr, 4rr]
  mortgageValue: number;
}

export interface UtilityTileDefinition extends TileDefinition {
  type: 'utility';
  price: number;
  mortgageValue: number;
  // Rent = dice × 4 (1 utility) or dice × 10 (2 utilities)
}

export interface TaxTileDefinition extends TileDefinition {
  type: 'tax';
  amount: number;
}

export interface CornerTileDefinition extends TileDefinition {
  type: 'corner';
  cornerType: CornerType;
}

export type AnyTileDefinition =
  | PropertyTileDefinition
  | RailroadTileDefinition
  | UtilityTileDefinition
  | TaxTileDefinition
  | CornerTileDefinition
  | TileDefinition; // chance, community-chest

// ─── Game State ───

export type GamePhase =
  | 'WAITING'
  | 'ROLLING'
  | 'MOVING'
  | 'LANDED'
  | 'ACTION'
  | 'AUCTION'
  | 'TRADE'
  | 'JAIL_DECISION'
  | 'CARD_EFFECT'
  | 'BANKRUPT_RESOLUTION'
  | 'GAME_OVER';

export interface DiceRoll {
  die1: number;
  die2: number;
  total: number;
  isDoubles: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  color: string;
  position: number;
  cash: number;
  properties: number[]; // tile indices
  inJail: boolean;
  jailTurns: number;
  getOutOfJailFreeCards: number;
  bankrupt: boolean;
  disconnected: boolean;
  totalAssetValue: number;
}

export interface PropertyState {
  tileIndex: number;
  ownerId: string | null;
  houses: number; // 0-4, 5 = hotel
  isMortgaged: boolean;
}

export interface BankState {
  housesRemaining: number;
  hotelsRemaining: number;
  freeParkingPool: number;
}

export interface CardState {
  remaining: number;
  // Actual cards are server-side only for security
}

export interface AuctionState {
  propertyIndex: number;
  currentBid: number;
  currentBidderId: string | null;
  participants: string[]; // player IDs still in auction
  timeRemaining: number; // seconds
}

export interface TradeProposal {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  offerProperties: number[];
  offerCash: number;
  requestProperties: number[];
  requestCash: number;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
}

export interface GameState {
  id: string;
  phase: GamePhase;
  currentPlayerIndex: number;
  turnNumber: number;
  players: PlayerState[];
  properties: PropertyState[];
  bank: BankState;
  chanceDeck: CardState;
  communityChestDeck: CardState;
  lastDiceRoll: DiceRoll | null;
  consecutiveDoubles: number;
  activeAuction: AuctionState | null;
  activeTrade: TradeProposal | null;
  pendingCardEffect: CardEffect | null;
  winner: string | null;
  log: GameLogEntry[];
}

// ─── Cards ───

export type CardEffectType =
  | 'MOVE_TO'
  | 'MOVE_RELATIVE'
  | 'COLLECT'
  | 'PAY'
  | 'PAY_EACH_PLAYER'
  | 'COLLECT_FROM_EACH_PLAYER'
  | 'GO_TO_JAIL'
  | 'GET_OUT_OF_JAIL_FREE'
  | 'REPAIRS'
  | 'MOVE_TO_NEAREST_RAILROAD'
  | 'MOVE_TO_NEAREST_UTILITY';

export interface CardEffect {
  type: CardEffectType;
  description: string;
  value?: number; // amount or tile index
  perHouse?: number; // for REPAIRS
  perHotel?: number; // for REPAIRS
}

export interface CardDefinition {
  id: string;
  deck: 'chance' | 'community-chest';
  description: string;
  effect: CardEffect;
}

// ─── Actions (Client → Server) ───

export type GameAction =
  | { type: 'ROLL_DICE'; playerId: string }
  | { type: 'BUY_PROPERTY'; playerId: string }
  | { type: 'DECLINE_PROPERTY'; playerId: string } // triggers auction
  | { type: 'BUILD_HOUSE'; playerId: string; tileIndex: number }
  | { type: 'SELL_HOUSE'; playerId: string; tileIndex: number }
  | { type: 'MORTGAGE_PROPERTY'; playerId: string; tileIndex: number }
  | { type: 'UNMORTGAGE_PROPERTY'; playerId: string; tileIndex: number }
  | { type: 'PAY_RENT'; playerId: string }
  | { type: 'END_TURN'; playerId: string }
  | { type: 'PAY_JAIL_BAIL'; playerId: string }
  | { type: 'USE_JAIL_CARD'; playerId: string }
  | { type: 'ROLL_FOR_JAIL'; playerId: string }
  | { type: 'AUCTION_BID'; playerId: string; amount: number }
  | { type: 'AUCTION_PASS'; playerId: string }
  | { type: 'TRADE_PROPOSE'; playerId: string; trade: Omit<TradeProposal, 'id' | 'status'> }
  | { type: 'TRADE_ACCEPT'; playerId: string; tradeId: string }
  | { type: 'TRADE_DECLINE'; playerId: string; tradeId: string }
  | { type: 'ACKNOWLEDGE_CARD'; playerId: string }
  | { type: 'DECLARE_BANKRUPTCY'; playerId: string; creditorId: string }
  | { type: 'AUCTION_TIMEOUT' };

// ─── Auth ───

export interface LoginPayload {
  username: string;
  password?: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password?: string;
}

// ─── Events (Server → Client) ───

export type GameEventType =
  | 'GAME_STARTED'
  | 'DICE_ROLLED'
  | 'PLAYER_MOVED'
  | 'PLAYER_PASSED_GO'
  | 'PROPERTY_PURCHASED'
  | 'RENT_PAID'
  | 'TAX_PAID'
  | 'HOUSE_BUILT'
  | 'HOUSE_SOLD'
  | 'PROPERTY_MORTGAGED'
  | 'PROPERTY_UNMORTGAGED'
  | 'CARD_DRAWN'
  | 'CARD_EFFECT_APPLIED'
  | 'SENT_TO_JAIL'
  | 'RELEASED_FROM_JAIL'
  | 'AUCTION_STARTED'
  | 'AUCTION_BID_PLACED'
  | 'AUCTION_WON'
  | 'TRADE_PROPOSED'
  | 'TRADE_ACCEPTED'
  | 'TRADE_DECLINED'
  | 'PLAYER_BANKRUPT'
  | 'TURN_CHANGED'
  | 'GAME_OVER'
  | 'CHAT_MESSAGE'
  | 'ERROR';

export interface GameEvent {
  type: GameEventType;
  playerId?: string;
  data?: Record<string, unknown>;
  message: string;
  timestamp: number;
}

export interface GameLogEntry {
  type: GameEventType;
  playerId?: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

// ─── Socket Events ───

export enum SocketClientEvent {
  ROOM_CREATE = 'room:create',
  ROOM_JOIN = 'room:join',
  ROOM_LEAVE = 'room:leave',
  ROOM_UPDATE_SETTINGS = 'room:updateSettings',
  GAME_START = 'game:start',
  GAME_ACTION = 'game:action',
  CHAT_SEND = 'chat:send',
  RECONNECT = 'client:reconnect',
}

export enum SocketServerEvent {
  ROOM_UPDATED = 'room:updated',
  GAME_STARTED = 'game:started',
  GAME_STATE_UPDATE = 'game:state',
  GAME_EVENT = 'game:event',
  CHAT_RECEIVED = 'chat:received',
  PLAYER_DISCONNECTED = 'player:disconnected',
  PLAYER_RECONNECTED = 'player:reconnected',
  ERROR = 'error',
}

// ─── Room Types ───

export type RoomStatus = 'WAITING' | 'IN_GAME' | 'FINISHED';

export interface RoomInfo {
  id: string;
  name: string;
  hostId: string;
  status: RoomStatus;
  maxPlayers: number;
  startingCash: number;
  map: string;
  players: RoomPlayerInfo[];
  inviteCode: string;
  createdAt: string;
}

export interface RoomSettings {
  maxPlayers: number;
  startingCash: number;
  map: string;
}

export interface RoomPlayerInfo {
  id: string;
  username: string;
  avatarUrl?: string;
  isHost: boolean;
  isReady: boolean;
}

// ─── User Types ───

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  wins: number;
  losses: number;
  gamesPlayed: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  wins: number;
  losses: number;
  winRate: number;
}

// ─── Chat ───

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  message: string;
  timestamp: string;
}

// ─── Auth ───

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface GuestLoginRequest {
  username: string;
}
