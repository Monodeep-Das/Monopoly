import type {
  GameState,
  GameAction,
  GameEvent,
  GameEventType,
  PlayerState,
  PropertyState,
  DiceRoll,
  CardEffect,
  AuctionState,
  TradeProposal,
  PropertyTileDefinition,
  RailroadTileDefinition,
  UtilityTileDefinition,
  PropertyGroup,
} from '@richup/shared-types';

import {
  BOARD_TILES,
  TILE_MAP,
  BOARD_SIZE,
  STARTING_CASH,
  GO_SALARY,
  JAIL_BAIL,
  MAX_JAIL_TURNS,
  MAX_DOUBLES,
  TOTAL_HOUSES,
  TOTAL_HOTELS,
  RAILROAD_INDICES,
  UTILITY_INDICES,
  getGroupTiles,
  GROUP_SIZES,
} from '../board/Board';

import { CardDeck, CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from '../cards/CardDeck';

// ─── Dice Utility ───

function rollDice(): DiceRoll {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  return { die1, die2, total: die1 + die2, isDoubles: die1 === die2 };
}

// ─── Game Engine ───

export class Game {
  private state: GameState;
  private chanceDeck: CardDeck;
  private communityChestDeck: CardDeck;

  constructor(
    playerSetup: Array<{ id: string; name: string; color: string }>,
    options?: { startingCash?: number }
  ) {
    if (playerSetup.length < 2 || playerSetup.length > 8) {
      throw new Error('Game requires 2-8 players');
    }

    this.chanceDeck = new CardDeck(CHANCE_CARDS);
    this.communityChestDeck = new CardDeck(COMMUNITY_CHEST_CARDS);

    const initialCash = options?.startingCash ?? STARTING_CASH;

    const players: PlayerState[] = playerSetup.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      position: 0,
      cash: initialCash,
      properties: [],
      inJail: false,
      jailTurns: 0,
      getOutOfJailFreeCards: 0,
      bankrupt: false,
      disconnected: false,
      totalAssetValue: initialCash,
    }));

    // Initialize all ownable properties
    const properties: PropertyState[] = BOARD_TILES
      .filter((t) => t.type === 'property' || t.type === 'railroad' || t.type === 'utility')
      .map((t) => ({
        tileIndex: t.index,
        ownerId: null,
        houses: 0,
        isMortgaged: false,
      }));

    this.state = {
      id: Math.random().toString(36).substring(2, 11),
      phase: 'ROLLING',
      currentPlayerIndex: 0,
      turnNumber: 1,
      players,
      properties,
      bank: {
        housesRemaining: TOTAL_HOUSES,
        hotelsRemaining: TOTAL_HOTELS,
        freeParkingPool: 0,
      },
      chanceDeck: { remaining: this.chanceDeck.remaining },
      communityChestDeck: { remaining: this.communityChestDeck.remaining },
      lastDiceRoll: null,
      consecutiveDoubles: 0,
      activeAuction: null,
      activeTrade: null,
      pendingCardEffect: null,
      winner: null,
      log: [],
    };
  }

  // ─── Public API ───

  getState(): Readonly<GameState> {
    return this.state;
  }

  getCurrentPlayer(): PlayerState {
    return this.state.players[this.state.currentPlayerIndex];
  }

  /**
   * Dispatch a game action. Returns the list of events produced.
   * The state is mutated in place for performance — callers should
   * read getState() after dispatch.
   */
  dispatch(action: GameAction): GameEvent[] {
    const events: GameEvent[] = [];

    // Validate it's the correct player's action (for most action types)
    const currentPlayer = this.getCurrentPlayer();
    if ('playerId' in action && action.playerId !== currentPlayer.id) {
      // Some actions can be done by non-current players
      const allowedByAnyone: GameAction['type'][] = [
        'AUCTION_BID', 'AUCTION_PASS', 'TRADE_ACCEPT', 'TRADE_DECLINE', 'AUCTION_TIMEOUT'
      ];
      if (!allowedByAnyone.includes(action.type)) {
        events.push(this.errorEvent((action as any).playerId, 'Not your turn'));
        return events;
      }
    }

    let returnedEvents: GameEvent[] = [];
    switch (action.type) {
      case 'ROLL_DICE':
        returnedEvents = this.handleRollDice(action.playerId);
        break;
      case 'BUY_PROPERTY':
        returnedEvents = this.handleBuyProperty(action.playerId);
        break;
      case 'DECLINE_PROPERTY':
        returnedEvents = this.handleDeclineProperty(action.playerId);
        break;
      case 'PAY_RENT':
        returnedEvents = this.handlePayRent(action.playerId);
        break;
      case 'END_TURN':
        returnedEvents = this.handleEndTurn(action.playerId);
        break;
      case 'BUILD_HOUSE':
        returnedEvents = this.handleBuildHouse(action.playerId, action.tileIndex);
        break;
      case 'SELL_HOUSE':
        returnedEvents = this.handleSellHouse(action.playerId, action.tileIndex);
        break;
      case 'MORTGAGE_PROPERTY':
        returnedEvents = this.handleMortgage(action.playerId, action.tileIndex);
        break;
      case 'UNMORTGAGE_PROPERTY':
        returnedEvents = this.handleUnmortgage(action.playerId, action.tileIndex);
        break;
      case 'PAY_JAIL_BAIL':
        returnedEvents = this.handlePayJailBail(action.playerId);
        break;
      case 'USE_JAIL_CARD':
        returnedEvents = this.handleUseJailCard(action.playerId);
        break;
      case 'ROLL_FOR_JAIL':
        returnedEvents = this.handleRollForJail(action.playerId);
        break;
      case 'AUCTION_BID':
        returnedEvents = this.handleAuctionBid(action.playerId, action.amount);
        break;
      case 'AUCTION_PASS':
        returnedEvents = this.handleAuctionPass(action.playerId);
        break;
      case 'TRADE_PROPOSE':
        returnedEvents = this.handleTradePropose(action.playerId, action.trade);
        break;
      case 'TRADE_ACCEPT':
        returnedEvents = this.handleTradeAccept(action.playerId, action.tradeId);
        break;
      case 'TRADE_DECLINE':
        returnedEvents = this.handleTradeDecline(action.playerId, action.tradeId);
        break;
      case 'ACKNOWLEDGE_CARD':
        returnedEvents = this.handleAcknowledgeCard(action.playerId);
        break;
      case 'DECLARE_BANKRUPTCY':
        returnedEvents = this.handleBankruptcy(action.playerId, action.creditorId);
        break;
      case 'AUCTION_TIMEOUT':
        returnedEvents = this.handleAuctionTimeout();
        break;
      default:
        return [];
    }

    return returnedEvents;
  }

  // ─── Action Handlers ───

  private handleRollDice(playerId: string): GameEvent[] {
    const events: GameEvent[] = [];
    const player = this.getPlayer(playerId);

    if (this.state.phase !== 'ROLLING') {
      return [this.errorEvent(playerId, `Cannot roll dice in phase ${this.state.phase}`)];
    }

    if (player.inJail) {
      return [this.errorEvent(playerId, 'You are in jail. Use PAY_JAIL_BAIL, USE_JAIL_CARD, or ROLL_FOR_JAIL')];
    }

    const dice = rollDice();
    this.state.lastDiceRoll = dice;

    events.push(this.createEvent('DICE_ROLLED', playerId,
      `${player.name} rolled ${dice.die1} + ${dice.die2} = ${dice.total}${dice.isDoubles ? ' (Doubles!)' : ''}`,
      { dice },
    ));

    // Check consecutive doubles → jail
    if (dice.isDoubles) {
      this.state.consecutiveDoubles++;
      if (this.state.consecutiveDoubles >= MAX_DOUBLES) {
        events.push(...this.sendToJail(player));
        this.state.consecutiveDoubles = 0;
        this.state.phase = 'ROLLING';
        this.advanceTurn(events);
        return events;
      }
    } else {
      this.state.consecutiveDoubles = 0;
    }

    // Move player
    events.push(...this.movePlayer(player, dice.total));

    return events;
  }

  private handleBuyProperty(playerId: string): GameEvent[] {
    const player = this.getPlayer(playerId);

    if (this.state.phase !== 'LANDED' && this.state.phase !== 'ACTION') {
      return [this.errorEvent(playerId, 'Cannot buy property now')];
    }

    const tile = TILE_MAP.get(player.position);
    if (!tile || (tile.type !== 'property' && tile.type !== 'railroad' && tile.type !== 'utility')) {
      return [this.errorEvent(playerId, 'Not a purchasable tile')];
    }

    const prop = this.getPropertyState(player.position);
    if (prop.ownerId !== null) {
      return [this.errorEvent(playerId, 'Property already owned')];
    }

    const price = (tile as PropertyTileDefinition | RailroadTileDefinition | UtilityTileDefinition).price;
    if (player.cash < price) {
      return [this.errorEvent(playerId, 'Not enough cash')];
    }

    // Execute purchase
    player.cash -= price;
    prop.ownerId = playerId;
    player.properties.push(player.position);
    this.updateAssetValue(player);

    this.state.phase = dice_doubles_allow_reroll(this.state) ? 'ROLLING' : 'ACTION';

    return [this.createEvent('PROPERTY_PURCHASED', playerId,
      `${player.name} purchased ${tile.name} for $${price}`,
      { tileIndex: player.position, price },
    )];
  }

  private handleDeclineProperty(playerId: string): GameEvent[] {
    const player = this.getPlayer(playerId);
    const events: GameEvent[] = [];

    const tile = TILE_MAP.get(player.position);
    if (!tile || (tile.type !== 'property' && tile.type !== 'railroad' && tile.type !== 'utility')) {
      return [this.errorEvent(playerId, 'Not a purchasable tile')];
    }

    const prop = this.getPropertyState(player.position);
    if (prop.ownerId !== null) {
      return [this.errorEvent(playerId, 'Property already owned')];
    }

    // Start auction
    events.push(...this.startAuction(player.position));
    return events;
  }

  private handlePayRent(playerId: string): GameEvent[] {
    const player = this.getPlayer(playerId);
    const events: GameEvent[] = [];

    const prop = this.getPropertyState(player.position);
    if (!prop.ownerId || prop.ownerId === playerId || prop.isMortgaged) {
      return [this.errorEvent(playerId, 'No rent to pay here')];
    }

    const owner = this.getPlayer(prop.ownerId);
    const rent = this.calculateRent(player.position, this.state.lastDiceRoll?.total ?? 0);

    if (player.cash < rent) {
      // Player can't afford rent — must mortgage/sell or go bankrupt
      this.state.phase = 'BANKRUPT_RESOLUTION';
      return [this.createEvent('ERROR', playerId,
        `${player.name} owes $${rent} to ${owner.name} but only has $${player.cash}. Must raise funds or declare bankruptcy.`,
        { rentOwed: rent, creditorId: owner.id },
      )];
    }

    player.cash -= rent;
    owner.cash += rent;
    this.updateAssetValue(player);
    this.updateAssetValue(owner);

    this.state.phase = dice_doubles_allow_reroll(this.state) ? 'ROLLING' : 'ACTION';

    return [this.createEvent('RENT_PAID', playerId,
      `${player.name} paid $${rent} rent to ${owner.name}`,
      { amount: rent, toPlayerId: owner.id, tileIndex: player.position },
    )];
  }

  private handleEndTurn(playerId: string): GameEvent[] {
    const events: GameEvent[] = [];

    // If there's a pending trade, auto-decline it so the turn can end
    if (this.state.phase === 'TRADE' && this.state.activeTrade) {
      const trade = this.state.activeTrade;
      trade.status = 'declined';
      this.state.activeTrade = null;
      this.state.phase = 'ACTION';
      events.push(this.createEvent('TRADE_DECLINED', playerId,
        `Trade was cancelled`,
        { tradeId: trade.id },
      ));
    }

    if (this.state.phase !== 'ACTION' && this.state.phase !== 'LANDED') {
      return [this.errorEvent(playerId, 'Cannot end turn now')];
    }

    if (this.state.lastDiceRoll?.isDoubles && this.state.consecutiveDoubles > 0) {
      // Player rolled doubles — they get another turn (roll again)
      this.state.phase = 'ROLLING';
      return [this.createEvent('TURN_CHANGED', playerId,
        `${this.getCurrentPlayer().name} rolled doubles — rolling again!`,
      )];
    }

    this.advanceTurn(events);
    return events;
  }

  private handleBuildHouse(playerId: string, tileIndex: number): GameEvent[] {
    const player = this.getPlayer(playerId);
    const tile = TILE_MAP.get(tileIndex);

    if (!tile || tile.type !== 'property') {
      return [this.errorEvent(playerId, 'Not a buildable property')];
    }

    const propTile = tile as PropertyTileDefinition;
    const prop = this.getPropertyState(tileIndex);

    if (prop.ownerId !== playerId) {
      return [this.errorEvent(playerId, 'You do not own this property')];
    }

    if (prop.isMortgaged) {
      return [this.errorEvent(playerId, 'Cannot build on mortgaged property')];
    }

    // Check monopoly
    if (!this.hasMonopoly(playerId, propTile.group)) {
      return [this.errorEvent(playerId, 'Need complete color set to build')];
    }

    // Check even building rule
    const groupProps = this.getGroupPropertyStates(propTile.group);
    const minHouses = Math.min(...groupProps.map((p) => p.houses));
    if (prop.houses > minHouses) {
      return [this.errorEvent(playerId, 'Must build evenly across color group')];
    }

    if (prop.houses >= 5) {
      return [this.errorEvent(playerId, 'Property already has a hotel')];
    }

    // Check bank inventory
    if (prop.houses === 4) {
      // Upgrading to hotel
      if (this.state.bank.hotelsRemaining <= 0) {
        return [this.errorEvent(playerId, 'No hotels available')];
      }
    } else {
      if (this.state.bank.housesRemaining <= 0) {
        return [this.errorEvent(playerId, 'No houses available')];
      }
    }

    const cost = propTile.houseCost;
    if (player.cash < cost) {
      return [this.errorEvent(playerId, 'Not enough cash')];
    }

    // Build
    player.cash -= cost;
    if (prop.houses === 4) {
      // Upgrade to hotel: return 4 houses, take 1 hotel
      this.state.bank.housesRemaining += 4;
      this.state.bank.hotelsRemaining--;
    } else {
      this.state.bank.housesRemaining--;
    }
    prop.houses++;
    this.updateAssetValue(player);

    const buildingType = prop.houses === 5 ? 'hotel' : 'house';
    return [this.createEvent('HOUSE_BUILT', playerId,
      `${player.name} built a ${buildingType} on ${tile.name} for $${cost}`,
      { tileIndex, houses: prop.houses, cost },
    )];
  }

  private handleSellHouse(playerId: string, tileIndex: number): GameEvent[] {
    const player = this.getPlayer(playerId);
    const tile = TILE_MAP.get(tileIndex);

    if (!tile || tile.type !== 'property') {
      return [this.errorEvent(playerId, 'Not a property')];
    }

    const propTile = tile as PropertyTileDefinition;
    const prop = this.getPropertyState(tileIndex);

    if (prop.ownerId !== playerId) {
      return [this.errorEvent(playerId, 'You do not own this property')];
    }

    if (prop.houses <= 0) {
      return [this.errorEvent(playerId, 'No buildings to sell')];
    }

    // Check even building rule (can't sell if others have fewer)
    const groupProps = this.getGroupPropertyStates(propTile.group);
    const maxHouses = Math.max(...groupProps.map((p) => p.houses));
    if (prop.houses < maxHouses) {
      return [this.errorEvent(playerId, 'Must sell evenly across color group')];
    }

    const refund = Math.floor(propTile.houseCost / 2);

    if (prop.houses === 5) {
      // Downgrade from hotel: need 4 houses available
      if (this.state.bank.housesRemaining < 4) {
        return [this.errorEvent(playerId, 'Not enough houses in bank to downgrade hotel')];
      }
      this.state.bank.hotelsRemaining++;
      this.state.bank.housesRemaining -= 4;
    } else {
      this.state.bank.housesRemaining++;
    }

    prop.houses--;
    player.cash += refund;
    this.updateAssetValue(player);

    const event = this.createEvent('HOUSE_SOLD', playerId,
      `${player.name} sold a building from ${tile.name} for $${refund}`,
      { tileIndex, houses: prop.houses, refund },
    );
    this.checkDebtCleared(player);
    return [event];
  }

  private handleMortgage(playerId: string, tileIndex: number): GameEvent[] {
    const player = this.getPlayer(playerId);
    const tile = TILE_MAP.get(tileIndex);

    if (!tile) return [this.errorEvent(playerId, 'Invalid tile')];

    const prop = this.getPropertyState(tileIndex);
    if (prop.ownerId !== playerId) {
      return [this.errorEvent(playerId, 'You do not own this property')];
    }
    if (prop.isMortgaged) {
      return [this.errorEvent(playerId, 'Already mortgaged')];
    }
    if (prop.houses > 0) {
      return [this.errorEvent(playerId, 'Must sell all buildings before mortgaging')];
    }

    const mortgageValue = (tile as PropertyTileDefinition | RailroadTileDefinition | UtilityTileDefinition).mortgageValue;
    prop.isMortgaged = true;
    player.cash += mortgageValue;
    this.updateAssetValue(player);

    const event = this.createEvent('PROPERTY_MORTGAGED', playerId,
      `${player.name} mortgaged ${tile.name} for $${mortgageValue}`,
      { tileIndex, mortgageValue },
    );
    this.checkDebtCleared(player);
    return [event];
  }

  private handleUnmortgage(playerId: string, tileIndex: number): GameEvent[] {
    const player = this.getPlayer(playerId);
    const tile = TILE_MAP.get(tileIndex);

    if (!tile) return [this.errorEvent(playerId, 'Invalid tile')];

    const prop = this.getPropertyState(tileIndex);
    if (prop.ownerId !== playerId) {
      return [this.errorEvent(playerId, 'You do not own this property')];
    }
    if (!prop.isMortgaged) {
      return [this.errorEvent(playerId, 'Not mortgaged')];
    }

    const mortgageValue = (tile as PropertyTileDefinition | RailroadTileDefinition | UtilityTileDefinition).mortgageValue;
    const unmortgageCost = Math.floor(mortgageValue * 1.1); // 10% interest

    if (player.cash < unmortgageCost) {
      return [this.errorEvent(playerId, `Need $${unmortgageCost} to unmortgage`)];
    }

    prop.isMortgaged = false;
    player.cash -= unmortgageCost;
    this.updateAssetValue(player);

    return [this.createEvent('PROPERTY_UNMORTGAGED', playerId,
      `${player.name} unmortgaged ${tile.name} for $${unmortgageCost}`,
      { tileIndex, cost: unmortgageCost },
    )];
  }

  // ─── Jail Handlers ───

  private handlePayJailBail(playerId: string): GameEvent[] {
    const player = this.getPlayer(playerId);

    if (!player.inJail) {
      return [this.errorEvent(playerId, 'Not in jail')];
    }
    if (player.cash < JAIL_BAIL) {
      return [this.errorEvent(playerId, 'Not enough cash for bail')];
    }

    player.cash -= JAIL_BAIL;
    player.inJail = false;
    player.jailTurns = 0;
    this.state.bank.freeParkingPool += JAIL_BAIL;
    this.state.phase = 'ROLLING';
    this.updateAssetValue(player);

    return [this.createEvent('RELEASED_FROM_JAIL', playerId,
      `${player.name} paid $${JAIL_BAIL} bail and is free!`,
      { method: 'bail' },
    )];
  }

  private handleUseJailCard(playerId: string): GameEvent[] {
    const player = this.getPlayer(playerId);

    if (!player.inJail) {
      return [this.errorEvent(playerId, 'Not in jail')];
    }
    if (player.getOutOfJailFreeCards <= 0) {
      return [this.errorEvent(playerId, 'No Get Out of Jail Free cards')];
    }

    player.getOutOfJailFreeCards--;
    player.inJail = false;
    player.jailTurns = 0;
    this.state.phase = 'ROLLING';

    return [this.createEvent('RELEASED_FROM_JAIL', playerId,
      `${player.name} used a Get Out of Jail Free card!`,
      { method: 'card' },
    )];
  }

  private handleRollForJail(playerId: string): GameEvent[] {
    const player = this.getPlayer(playerId);
    const events: GameEvent[] = [];

    if (!player.inJail) {
      return [this.errorEvent(playerId, 'Not in jail')];
    }

    const dice = rollDice();
    this.state.lastDiceRoll = dice;

    events.push(this.createEvent('DICE_ROLLED', playerId,
      `${player.name} rolled ${dice.die1} + ${dice.die2}${dice.isDoubles ? ' — Doubles!' : ''}`,
      { dice },
    ));

    if (dice.isDoubles) {
      player.inJail = false;
      player.jailTurns = 0;
      events.push(this.createEvent('RELEASED_FROM_JAIL', playerId,
        `${player.name} rolled doubles and is free!`,
        { method: 'doubles' },
      ));
      // Move by the dice total
      events.push(...this.movePlayer(player, dice.total));
    } else {
      player.jailTurns++;
      if (player.jailTurns >= MAX_JAIL_TURNS) {
        // Forced to pay bail after 3 failed attempts
        // Forced to pay bail
        player.cash -= JAIL_BAIL;
        this.state.bank.freeParkingPool += JAIL_BAIL;
        player.inJail = false;
        player.jailTurns = 0;
        this.updateAssetValue(player);
        events.push(this.createEvent('RELEASED_FROM_JAIL', playerId,
          `${player.name} was forced to pay $${JAIL_BAIL} bail after ${MAX_JAIL_TURNS} turns`,
          { method: 'forced' },
        ));
        events.push(...this.movePlayer(player, dice.total));

        if (player.cash < 0) {
          this.state.phase = 'BANKRUPT_RESOLUTION';
          events.push(this.createEvent('ERROR', playerId,
            `${player.name} went into debt for forced bail. Must raise funds!`,
            { debt: player.cash },
          ));
        }
      } else {
        // Still in jail, end turn
        this.advanceTurn(events);
      }
    }

    return events;
  }

  // ─── Auction Handlers ───

  private startAuction(tileIndex: number): GameEvent[] {
    const tile = TILE_MAP.get(tileIndex)!;
    const activePlayers = this.state.players
      .filter((p) => !p.bankrupt)
      .map((p) => p.id);

    this.state.activeAuction = {
      propertyIndex: tileIndex,
      currentBid: 0,
      currentBidderId: null,
      participants: activePlayers,
      timeRemaining: 7,
    };
    this.state.phase = 'AUCTION';

    return [this.createEvent('AUCTION_STARTED', undefined,
      `Auction started for ${tile.name}!`,
      { tileIndex, startingBid: 0 },
    )];
  }

  private handleAuctionBid(playerId: string, amount: number): GameEvent[] {
    const auction = this.state.activeAuction;
    if (!auction) return [this.errorEvent(playerId, 'No active auction')];

    if (!auction.participants.includes(playerId)) {
      return [this.errorEvent(playerId, 'Not in this auction')];
    }

    const player = this.getPlayer(playerId);
    if (amount <= auction.currentBid) {
      return [this.errorEvent(playerId, 'Bid must be higher than current bid')];
    }
    if (amount > player.cash) {
      return [this.errorEvent(playerId, 'Cannot bid more than your cash')];
    }

    auction.currentBid = amount;
    auction.currentBidderId = playerId;
    auction.timeRemaining = 7; // Reset timer on new bid

    return [this.createEvent('AUCTION_BID_PLACED', playerId,
      `${player.name} bid $${amount}`,
      { amount, tileIndex: auction.propertyIndex },
    )];
  }

  private handleAuctionPass(playerId: string): GameEvent[] {
    const auction = this.state.activeAuction;
    if (!auction) return [this.errorEvent(playerId, 'No active auction')];

    auction.participants = auction.participants.filter((id) => id !== playerId);

    // Check if auction is over (1 or 0 participants left)
    if (auction.participants.length <= 1 || (auction.participants.length === 1 && auction.currentBidderId)) {
      return this.resolveAuction();
    }

    const player = this.getPlayer(playerId);
    return [this.createEvent('AUCTION_BID_PLACED', playerId,
      `${player.name} passed`,
      { passed: true },
    )];
  }

  private handleAuctionTimeout(): GameEvent[] {
    const auction = this.state.activeAuction;
    if (!auction) return [];
    
    // Auto-pass everyone who didn't bid, if there's a highest bidder
    // If there's no bidder, everyone passed by timeout
    return this.resolveAuction();
  }

  private resolveAuction(): GameEvent[] {
    const auction = this.state.activeAuction!;
    const events: GameEvent[] = [];
    const tile = TILE_MAP.get(auction.propertyIndex)!;

    if (auction.currentBidderId && auction.currentBid > 0) {
      const winner = this.getPlayer(auction.currentBidderId);
      const prop = this.getPropertyState(auction.propertyIndex);

      winner.cash -= auction.currentBid;
      prop.ownerId = winner.id;
      winner.properties.push(auction.propertyIndex);
      this.updateAssetValue(winner);

      events.push(this.createEvent('AUCTION_WON', winner.id,
        `${winner.name} won the auction for ${tile.name} at $${auction.currentBid}`,
        { tileIndex: auction.propertyIndex, winningBid: auction.currentBid },
      ));
    } else {
      events.push(this.createEvent('AUCTION_WON', undefined,
        `No one bid on ${tile.name}. Property remains unowned.`,
        { tileIndex: auction.propertyIndex, noBidder: true },
      ));
    }

    this.state.activeAuction = null;
    this.state.phase = dice_doubles_allow_reroll(this.state) ? 'ROLLING' : 'ACTION';

    return events;
  }

  // ─── Trade Handlers ───

  private handleTradePropose(playerId: string, trade: Omit<TradeProposal, 'id' | 'status'>): GameEvent[] {
    // Validate proposer owns offered properties
    for (const tileIdx of trade.offerProperties) {
      const prop = this.getPropertyState(tileIdx);
      if (prop.ownerId !== playerId || prop.houses > 0) {
        return [this.errorEvent(playerId, 'Cannot trade property with buildings or that you don\'t own')];
      }
    }

    // Validate target owns requested properties
    for (const tileIdx of trade.requestProperties) {
      const prop = this.getPropertyState(tileIdx);
      if (prop.ownerId !== trade.toPlayerId || prop.houses > 0) {
        return [this.errorEvent(playerId, 'Target player doesn\'t own requested property or it has buildings')];
      }
    }

    const proposer = this.getPlayer(playerId);
    if (trade.offerCash > 0 && proposer.cash < trade.offerCash) {
      return [this.errorEvent(playerId, 'Not enough cash for offered amount')];
    }

    const proposal: TradeProposal = {
      ...trade,
      id: Math.random().toString(36).substring(2, 11),
      status: 'pending',
    };

    this.state.activeTrade = proposal;
    this.state.phase = 'TRADE';

    return [this.createEvent('TRADE_PROPOSED', playerId,
      `${proposer.name} proposed a trade to ${this.getPlayer(trade.toPlayerId).name}`,
      { trade: proposal },
    )];
  }

  private handleTradeAccept(playerId: string, tradeId: string): GameEvent[] {
    const trade = this.state.activeTrade;
    if (!trade || trade.id !== tradeId) {
      return [this.errorEvent(playerId, 'No matching trade proposal')];
    }
    if (trade.toPlayerId !== playerId) {
      return [this.errorEvent(playerId, 'This trade is not for you')];
    }

    const from = this.getPlayer(trade.fromPlayerId);
    const to = this.getPlayer(trade.toPlayerId);

    if (trade.requestCash > 0 && to.cash < trade.requestCash) {
      return [this.errorEvent(playerId, 'Not enough cash to accept trade')];
    }

    // Transfer cash
    from.cash -= trade.offerCash;
    from.cash += trade.requestCash;
    to.cash += trade.offerCash;
    to.cash -= trade.requestCash;

    // Transfer properties
    for (const tileIdx of trade.offerProperties) {
      const prop = this.getPropertyState(tileIdx);
      prop.ownerId = to.id;
      from.properties = from.properties.filter((i) => i !== tileIdx);
      to.properties.push(tileIdx);
    }
    for (const tileIdx of trade.requestProperties) {
      const prop = this.getPropertyState(tileIdx);
      prop.ownerId = from.id;
      to.properties = to.properties.filter((i) => i !== tileIdx);
      from.properties.push(tileIdx);
    }

    this.updateAssetValue(from);
    this.updateAssetValue(to);

    trade.status = 'accepted';
    this.state.activeTrade = null;
    this.state.phase = 'ACTION';

    return [this.createEvent('TRADE_ACCEPTED', playerId,
      `${to.name} accepted the trade with ${from.name}`,
      { trade },
    )];
  }

  private handleTradeDecline(playerId: string, tradeId: string): GameEvent[] {
    const trade = this.state.activeTrade;
    if (!trade || trade.id !== tradeId) {
      return [this.errorEvent(playerId, 'No matching trade proposal')];
    }

    trade.status = 'declined';
    this.state.activeTrade = null;
    this.state.phase = 'ACTION';

    const decliner = this.getPlayer(playerId);
    return [this.createEvent('TRADE_DECLINED', playerId,
      `${decliner.name} declined the trade`,
      { tradeId },
    )];
  }

  // ─── Card Handler ───

  private handleAcknowledgeCard(playerId: string): GameEvent[] {
    if (!this.state.pendingCardEffect) {
      return [this.errorEvent(playerId, 'No pending card effect')];
    }

    this.state.pendingCardEffect = null;
    this.state.phase = dice_doubles_allow_reroll(this.state) ? 'ROLLING' : 'ACTION';
    return [];
  }

  // ─── Bankruptcy ───

  private handleBankruptcy(playerId: string, creditorId: string): GameEvent[] {
    const player = this.getPlayer(playerId);
    const events: GameEvent[] = [];

    player.bankrupt = true;

    // Properties always go back to the bank, even if bankrupt to another player
    for (const tileIdx of player.properties) {
      const prop = this.getPropertyState(tileIdx);
      prop.ownerId = null;
      prop.houses = 0;
      prop.isMortgaged = false;
    }
    
    if (creditorId !== 'bank') {
      const creditor = this.getPlayer(creditorId);
      // We explicitly DO NOT deduct player.cash from creditor.cash anymore.
      // The creditor already received the full rent during the RENT_PAID event,
      // and we are effectively using the sale of the properties to the bank 
      // to fund the player's deficit, paying the creditor in full.
      this.updateAssetValue(creditor);
    }

    player.cash = 0;
    player.properties = [];
    this.updateAssetValue(player);

    events.push(this.createEvent('PLAYER_BANKRUPT', playerId,
      `${player.name} has gone bankrupt!`,
      { creditorId },
    ));

    // Check win condition
    const activePlayers = this.state.players.filter((p) => !p.bankrupt);
    if (activePlayers.length === 1) {
      this.state.winner = activePlayers[0].id;
      this.state.phase = 'GAME_OVER';
      
      // Clear chats after the game ends
      this.state.log = this.state.log.filter(l => l.type !== 'CHAT_MESSAGE');
      
      events.push(this.createEvent('GAME_OVER', activePlayers[0].id,
        `${activePlayers[0].name} wins the game!`,
        { winnerId: activePlayers[0].id },
      ));
    } else {
      // Advance turn if the bankrupt player was current
      if (this.state.players[this.state.currentPlayerIndex].id === playerId) {
        this.advanceTurn(events);
      } else {
        // If we didn't advance the turn (e.g. someone went bankrupt on another player's turn),
        // we must check if anyone else is still bankrupt. If not, restore phase to ACTION.
        const anyoneElseBankrupt = this.state.players.some(p => !p.bankrupt && p.cash < 0);
        if (!anyoneElseBankrupt && this.state.phase === 'BANKRUPT_RESOLUTION') {
          this.state.phase = 'ACTION';
        }
      }
    }

    return events;
  }

  // ─── Movement Logic ───

  private movePlayer(player: PlayerState, spaces: number): GameEvent[] {
    const events: GameEvent[] = [];
    const oldPosition = player.position;
    const newPosition = (oldPosition + spaces) % BOARD_SIZE;

    // Check if passed GO
    if (newPosition < oldPosition && spaces > 0) {
      player.cash += GO_SALARY;
      this.updateAssetValue(player);
      events.push(this.createEvent('PLAYER_PASSED_GO', player.id,
        `${player.name} passed GO and collected $${GO_SALARY}`,
        { salary: GO_SALARY },
      ));
    }

    player.position = newPosition;
    events.push(this.createEvent('PLAYER_MOVED', player.id,
      `${player.name} moved to ${TILE_MAP.get(newPosition)?.name ?? 'unknown'}`,
      { from: oldPosition, to: newPosition },
    ));

    // Handle landing
    events.push(...this.handleLanding(player));

    return events;
  }

  private movePlayerTo(player: PlayerState, tileIndex: number, collectGo: boolean): GameEvent[] {
    const events: GameEvent[] = [];

    if (collectGo && tileIndex < player.position) {
      player.cash += GO_SALARY;
      this.updateAssetValue(player);
      events.push(this.createEvent('PLAYER_PASSED_GO', player.id,
        `${player.name} passed GO and collected $${GO_SALARY}`,
        { salary: GO_SALARY },
      ));
    }

    player.position = tileIndex;
    events.push(this.createEvent('PLAYER_MOVED', player.id,
      `${player.name} moved to ${TILE_MAP.get(tileIndex)?.name ?? 'unknown'}`,
      { to: tileIndex },
    ));

    events.push(...this.handleLanding(player));
    return events;
  }

  private handleLanding(player: PlayerState): GameEvent[] {
    const events: GameEvent[] = [];
    const tile = TILE_MAP.get(player.position);

    if (!tile) return events;

    switch (tile.type) {
      case 'corner': {
        const cornerTile = tile as import('@richup/shared-types').CornerTileDefinition;
        if (cornerTile.cornerType === 'go-to-jail') {
          events.push(...this.sendToJail(player));
          this.advanceTurn(events);
        } else if (cornerTile.cornerType === 'free-parking') {
          // Collect free parking pool (house rule)
          if (this.state.bank.freeParkingPool > 0) {
            const pool = this.state.bank.freeParkingPool;
            player.cash += pool;
            this.state.bank.freeParkingPool = 0;
            this.updateAssetValue(player);
            events.push(this.createEvent('PLAYER_PASSED_GO', player.id,
              `${player.name} collected $${pool} from Free Parking!`,
              { amount: pool },
            ));
          }
          this.state.phase = 'ACTION';
        } else {
          // GO or Jail (just visiting)
          this.state.phase = 'ACTION';
        }
        break;
      }

      case 'property':
      case 'railroad':
      case 'utility': {
        const prop = this.getPropertyState(player.position);
        if (prop.ownerId === null) {
          // Unowned — player can buy or auction
          this.state.phase = 'LANDED';
        } else if (prop.ownerId === player.id || prop.isMortgaged) {
          // Own property or mortgaged — no rent
          this.state.phase = 'ACTION';
        } else {
          // Must pay rent
          const rent = this.calculateRent(player.position, this.state.lastDiceRoll?.total ?? 0);
          const owner = this.getPlayer(prop.ownerId);

          // Always deduct rent
          player.cash -= rent;
          owner.cash += rent;
          this.updateAssetValue(player);
          this.updateAssetValue(owner);
          events.push(this.createEvent('RENT_PAID', player.id,
            `${player.name} paid $${rent} rent to ${owner.name}`,
            { amount: rent, toPlayerId: owner.id },
          ));
          
          if (player.cash < 0) {
            this.state.phase = 'BANKRUPT_RESOLUTION';
            events.push(this.createEvent('ERROR', player.id,
              `${player.name} went into debt for $${Math.abs(player.cash)}. Must raise funds!`,
              { debt: player.cash },
            ));
          } else {
            this.state.phase = 'ACTION';
          }
        }
        break;
      }

      case 'tax': {
        const taxTile = tile as import('@richup/shared-types').TaxTileDefinition;
        player.cash -= taxTile.amount;
        this.state.bank.freeParkingPool += taxTile.amount;
        this.updateAssetValue(player);
        events.push(this.createEvent('TAX_PAID', player.id,
          `${player.name} paid $${taxTile.amount} tax`,
          { amount: taxTile.amount },
        ));
        
        if (player.cash < 0) {
          this.state.phase = 'BANKRUPT_RESOLUTION';
          events.push(this.createEvent('ERROR', player.id,
            `${player.name} went into debt for $${Math.abs(player.cash)}. Must raise funds!`,
            { debt: player.cash },
          ));
        } else {
          this.state.phase = 'ACTION';
        }
        break;
      }

      case 'chance':
      case 'community-chest': {
        const deck = tile.type === 'chance' ? this.chanceDeck : this.communityChestDeck;
        const card = deck.draw();

        events.push(this.createEvent('CARD_DRAWN', player.id,
          `${player.name} drew: "${card.description}"`,
          { card: { deck: tile.type, description: card.description, effect: card.effect } },
        ));

        events.push(...this.applyCardEffect(player, card.effect));
        break;
      }
    }

    return events;
  }

  // ─── Card Effects ───

  private applyCardEffect(player: PlayerState, effect: CardEffect): GameEvent[] {
    const events: GameEvent[] = [];

    switch (effect.type) {
      case 'MOVE_TO':
        events.push(...this.movePlayerTo(player, effect.value!, true));
        break;

      case 'MOVE_RELATIVE':
        const newPos = ((player.position + effect.value!) % BOARD_SIZE + BOARD_SIZE) % BOARD_SIZE;
        events.push(...this.movePlayerTo(player, newPos, false));
        break;

      case 'COLLECT':
        player.cash += effect.value!;
        this.updateAssetValue(player);
        events.push(this.createEvent('CARD_EFFECT_APPLIED', player.id,
          `${player.name} collected $${effect.value}`,
          { amount: effect.value },
        ));
        this.state.phase = 'ACTION';
        break;

      case 'PAY':
        player.cash -= effect.value!;
        this.state.bank.freeParkingPool += effect.value!;
        this.updateAssetValue(player);
        events.push(this.createEvent('CARD_EFFECT_APPLIED', player.id,
          `${player.name} paid $${effect.value}`,
          { amount: -effect.value! },
        ));
        if (player.cash < 0) {
          this.state.phase = 'BANKRUPT_RESOLUTION';
        } else {
          this.state.phase = 'ACTION';
        }
        break;

      case 'PAY_EACH_PLAYER':
        const payAmount = effect.value!;
        const activePlayers = this.state.players.filter((p) => !p.bankrupt && p.id !== player.id);
        const totalPay = payAmount * activePlayers.length;
        player.cash -= totalPay;
        activePlayers.forEach((p) => { p.cash += payAmount; this.updateAssetValue(p); });
        this.updateAssetValue(player);
        events.push(this.createEvent('CARD_EFFECT_APPLIED', player.id,
          `${player.name} paid $${payAmount} to each player`,
          { amount: -totalPay },
        ));
        if (player.cash < 0) {
          this.state.phase = 'BANKRUPT_RESOLUTION';
        } else {
          this.state.phase = 'ACTION';
        }
        break;

      case 'COLLECT_FROM_EACH_PLAYER':
        const collectAmount = effect.value!;
        const otherPlayers = this.state.players.filter((p) => !p.bankrupt && p.id !== player.id);
        otherPlayers.forEach((p) => { p.cash -= collectAmount; this.updateAssetValue(p); });
        player.cash += collectAmount * otherPlayers.length;
        this.updateAssetValue(player);
        events.push(this.createEvent('CARD_EFFECT_APPLIED', player.id,
          `${player.name} collected $${collectAmount} from each player`,
          { amount: collectAmount * otherPlayers.length },
        ));
        this.state.phase = 'ACTION';
        break;

      case 'GO_TO_JAIL':
        events.push(...this.sendToJail(player));
        this.advanceTurn(events);
        break;

      case 'GET_OUT_OF_JAIL_FREE':
        player.getOutOfJailFreeCards++;
        events.push(this.createEvent('CARD_EFFECT_APPLIED', player.id,
          `${player.name} received a Get Out of Jail Free card`,
        ));
        this.state.phase = 'ACTION';
        break;

      case 'REPAIRS': {
        let totalCost = 0;
        for (const tileIdx of player.properties) {
          const prop = this.getPropertyState(tileIdx);
          if (prop.houses > 0 && prop.houses < 5) {
            totalCost += prop.houses * (effect.perHouse ?? 0);
          } else if (prop.houses === 5) {
            totalCost += effect.perHotel ?? 0;
          }
        }
        player.cash -= totalCost;
        this.state.bank.freeParkingPool += totalCost;
        this.updateAssetValue(player);
        events.push(this.createEvent('CARD_EFFECT_APPLIED', player.id,
          `${player.name} paid $${totalCost} for repairs`,
          { amount: -totalCost },
        ));
        if (player.cash < 0) {
          this.state.phase = 'BANKRUPT_RESOLUTION';
        } else {
          this.state.phase = 'ACTION';
        }
        break;
      }

      case 'MOVE_TO_NEAREST_RAILROAD': {
        const nearestRR = this.findNearest(player.position, RAILROAD_INDICES);
        events.push(...this.movePlayerTo(player, nearestRR, true));
        break;
      }

      case 'MOVE_TO_NEAREST_UTILITY': {
        const nearestUtil = this.findNearest(player.position, UTILITY_INDICES);
        events.push(...this.movePlayerTo(player, nearestUtil, true));
        break;
      }
    }

    return events;
  }

  // ─── Rent Calculation ───

  private calculateRent(tileIndex: number, diceTotal: number): number {
    const tile = TILE_MAP.get(tileIndex);
    const prop = this.getPropertyState(tileIndex);

    if (!tile || !prop.ownerId || prop.isMortgaged) return 0;

    switch (tile.type) {
      case 'property': {
        const propTile = tile as PropertyTileDefinition;
        const hasMonopoly = this.hasMonopoly(prop.ownerId, propTile.group);

        if (prop.houses === 0 && hasMonopoly) {
          return propTile.rent[0] * 2; // Double rent for monopoly with no houses
        }
        return propTile.rent[prop.houses] ?? propTile.rent[0];
      }

      case 'railroad': {
        const rrTile = tile as RailroadTileDefinition;
        const ownedRailroads = RAILROAD_INDICES.filter((idx) => {
          const p = this.getPropertyState(idx);
          return p.ownerId === prop.ownerId && !p.isMortgaged;
        }).length;
        return rrTile.rent[ownedRailroads - 1] ?? 25;
      }

      case 'utility': {
        const ownedUtilities = UTILITY_INDICES.filter((idx) => {
          const p = this.getPropertyState(idx);
          return p.ownerId === prop.ownerId && !p.isMortgaged;
        }).length;
        const multiplier = ownedUtilities >= 2 ? 10 : 4;
        return diceTotal * multiplier;
      }

      default:
        return 0;
    }
  }

  // ─── Helpers ───

  private getPlayer(playerId: string): PlayerState {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) throw new Error(`Player ${playerId} not found`);
    return player;
  }

  private getPropertyState(tileIndex: number): PropertyState {
    const prop = this.state.properties.find((p) => p.tileIndex === tileIndex);
    if (!prop) throw new Error(`Property state not found for tile ${tileIndex}`);
    return prop;
  }

  private hasMonopoly(playerId: string, group: PropertyGroup): boolean {
    const groupTiles = getGroupTiles(group);
    return groupTiles.every((t) => {
      const prop = this.getPropertyState(t.index);
      return prop.ownerId === playerId && !prop.isMortgaged;
    });
  }

  private getGroupPropertyStates(group: PropertyGroup): PropertyState[] {
    const groupTiles = getGroupTiles(group);
    return groupTiles.map((t) => this.getPropertyState(t.index));
  }

  private updateAssetValue(player: PlayerState): void {
    let value = player.cash;
    for (const tileIdx of player.properties) {
      const tile = TILE_MAP.get(tileIdx);
      const prop = this.getPropertyState(tileIdx);
      if (tile && (tile.type === 'property' || tile.type === 'railroad' || tile.type === 'utility')) {
        const purchasable = tile as PropertyTileDefinition | RailroadTileDefinition | UtilityTileDefinition;
        if (prop.isMortgaged) {
          value += purchasable.mortgageValue;
        } else {
          value += purchasable.price;
          if (tile.type === 'property' && prop.houses > 0) {
            value += prop.houses * (tile as PropertyTileDefinition).houseCost;
          }
        }
      }
    }
    player.totalAssetValue = value;
  }

  private sendToJail(player: PlayerState): GameEvent[] {
    player.position = 10; // Jail tile
    player.inJail = true;
    player.jailTurns = 0;
    this.state.consecutiveDoubles = 0;

    return [this.createEvent('SENT_TO_JAIL', player.id,
      `${player.name} was sent to Jail!`,
    )];
  }

  private advanceTurn(events: GameEvent[]): void {
    this.state.consecutiveDoubles = 0;
    this.state.lastDiceRoll = null;

    // Find next non-bankrupt player
    let nextIndex = this.state.currentPlayerIndex;
    do {
      nextIndex = (nextIndex + 1) % this.state.players.length;
    } while (this.state.players[nextIndex].bankrupt && nextIndex !== this.state.currentPlayerIndex);

    this.state.currentPlayerIndex = nextIndex;
    this.state.turnNumber++;

    const nextPlayer = this.state.players[nextIndex];
    if (nextPlayer.cash < 0) {
      this.state.phase = 'BANKRUPT_RESOLUTION';
    } else if (nextPlayer.inJail) {
      this.state.phase = 'JAIL_DECISION';
    } else {
      this.state.phase = 'ROLLING';
    }

    events.push(this.createEvent('TURN_CHANGED', nextPlayer.id,
      `${nextPlayer.name}'s turn`,
      { turnNumber: this.state.turnNumber },
    ));
  }

  private findNearest(currentPosition: number, indices: number[]): number {
    let nearest = indices[0];
    let minDist = BOARD_SIZE;

    for (const idx of indices) {
      const dist = (idx - currentPosition + BOARD_SIZE) % BOARD_SIZE;
      if (dist > 0 && dist < minDist) {
        minDist = dist;
        nearest = idx;
      }
    }

    return nearest;
  }

  private checkDebtCleared(player: PlayerState) {
    if (player.id === this.getCurrentPlayer().id && player.cash >= 0 && this.state.phase === 'BANKRUPT_RESOLUTION') {
      this.state.phase = 'ACTION';
    }
  }

  private createEvent(
    type: GameEventType,
    playerId: string | undefined,
    message: string,
    data?: Record<string, unknown>,
  ): GameEvent {
    const event: GameEvent = {
      type,
      playerId,
      message,
      data,
      timestamp: Date.now(),
    };

    // Also add to game log
    this.state.log.push({
      type,
      playerId,
      message,
      data: event.data,
      timestamp: event.timestamp,
    });

    // Keep log trimmed to last 100 entries
    if (this.state.log.length > 100) {
      this.state.log = this.state.log.slice(-100);
    }

    return event;
  }

  public addChat(playerId: string, message: string): GameEvent {
    return this.createEvent('CHAT_MESSAGE', playerId, message);
  }

  private errorEvent(playerId: string, message: string): GameEvent {
    return this.createEvent('ERROR', playerId, message);
  }

  // ─── Serialization ───

  serialize(): string {
    return JSON.stringify(this.state);
  }

  static fromState(state: GameState): Game {
    const game = Object.create(Game.prototype) as Game;
    game.state = state;
    game.chanceDeck = new CardDeck(CHANCE_CARDS);
    game.communityChestDeck = new CardDeck(COMMUNITY_CHEST_CARDS);
    return game;
  }
}

// ─── Helper ───

function dice_doubles_allow_reroll(state: GameState): boolean {
  return state.lastDiceRoll?.isDoubles === true && state.consecutiveDoubles > 0;
}
