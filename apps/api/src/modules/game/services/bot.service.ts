import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { GameService } from './game.service';
import { GameAction } from '@richup/shared-types';
import { PrismaService } from '../../../database/prisma.service';
import { BOARD_TILES } from '@richup/game-engine';

interface TradeEvaluatorState {
  properties: any[];
  players: any[];
}

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(
    @Inject(forwardRef(() => GameService))
    private gameService: GameService,
    private prisma: PrismaService,
  ) {}

  private attemptedTrades = new Map<string, Set<string>>();
  private thinkingBots = new Set<string>();

  private evaluateTradeValue(propertyIndices: number[], cash: number, state: TradeEvaluatorState, evaluatorId: string): number {
    let value = cash;
    for (const idx of propertyIndices) {
      const tileDef = BOARD_TILES[idx];
      if (tileDef && tileDef.type === 'property') {
        let baseValue = (tileDef as any).price || 0;
        
        if ('group' in tileDef) {
           const group = tileDef.group;
           const groupTiles = BOARD_TILES.map((t, i) => ({ t, i })).filter(x => x.t.type === 'property' && 'group' in x.t && (x.t as any).group === group);
           
           const ownedByEvaluator = state.properties.filter((p: any) => p.ownerId === evaluatorId && groupTiles.some(gt => gt.i === p.tileIndex)).length;
           const totalInGroup = groupTiles.length;
           
           if (ownedByEvaluator === totalInGroup - 1) {
             baseValue *= 2.5; 
           } else if (ownedByEvaluator > 0) {
             baseValue *= 1.5; 
           }
        }
        value += baseValue;
      }
    }
    return value;
  }

  async handleTurn(gameId: string, botId: string) {
    const lockKey = `${gameId}-${botId}`;
    if (this.thinkingBots.has(lockKey)) return;
    this.thinkingBots.add(lockKey);
    const releaseLock = () => this.thinkingBots.delete(lockKey);

    this.logger.log(`Bot ${botId} is thinking in game ${gameId}...`);
    
    // We get the state inside the timeout to ensure it's fresh
    setTimeout(async () => {
      try {
        const engine = this.gameService.getGameEngine(gameId);
        if (!engine) return releaseLock();

        const state = engine.getState();
        const turnOwnerId = state.players[state.currentPlayerIndex].id;
        const player = state.players.find(p => p.id === botId);

        if (!player || state.phase === 'GAME_OVER') return releaseLock();

        if (state.phase === 'TRADE' && state.activeTrade) {
          if (state.activeTrade.toPlayerId !== botId) return releaseLock();
          
          this.logger.log(`Bot ${botId} evaluating trade proposal from ${state.activeTrade.fromPlayerId}`);
          const myValue = this.evaluateTradeValue(state.activeTrade.offerProperties, state.activeTrade.offerCash, state, botId);
          const givingValue = this.evaluateTradeValue(state.activeTrade.requestProperties, state.activeTrade.requestCash, state, botId);
          
          if (myValue >= givingValue * 1.1) {
             this.logger.log(`Bot ${botId} accepting trade! (Receive: ${myValue}, Give: ${givingValue})`);
             await this.gameService.dispatchAction(gameId, { type: 'TRADE_ACCEPT', playerId: botId, tradeId: state.activeTrade.id });
          } else {
             this.logger.log(`Bot ${botId} declining trade. (Receive: ${myValue}, Give: ${givingValue})`);
             await this.gameService.dispatchAction(gameId, { type: 'TRADE_DECLINE', playerId: botId, tradeId: state.activeTrade.id });
          }
          return releaseLock();
        }

        if (state.phase === 'BANKRUPT_RESOLUTION' && player.cash < 0 && !player.bankrupt) {
          let creditorId = 'bank';
          const landedProp = state.properties.find(p => p.tileIndex === player.position);
          if (landedProp && landedProp.ownerId && landedProp.ownerId !== botId) {
            creditorId = landedProp.ownerId;
          }
          this.logger.log(`Bot ${botId} is bankrupt... declaring bankruptcy to ${creditorId}`);
          await this.gameService.dispatchAction(gameId, { type: 'DECLARE_BANKRUPTCY', playerId: botId, creditorId });
          return releaseLock();
        }

        if (state.phase === 'AUCTION' && state.activeAuction?.participants.includes(botId)) {
          const auction = state.activeAuction;
          if (auction.currentBidderId !== botId) {
            const tileDef = BOARD_TILES[auction.propertyIndex];
            const basePrice = (tileDef as any).price || 0;
            const maxBid = basePrice * 0.8; // Bot is conservative, only bids up to 80% of face value

            if (auction.currentBid < maxBid && player.cash >= auction.currentBid + 10) {
              const bidAmount = auction.currentBid === 0 ? 10 : auction.currentBid + 10;
              this.logger.log(`Bot ${botId} bidding ${bidAmount} in auction`);
              await this.gameService.dispatchAction(gameId, { type: 'AUCTION_BID', playerId: botId, amount: bidAmount });
            } else {
              this.logger.log(`Bot ${botId} passing on auction`);
              await this.gameService.dispatchAction(gameId, { type: 'AUCTION_PASS', playerId: botId });
            }
          }
          return releaseLock();
        }

        // Restrict subsequent actions to the active turn owner
        if (turnOwnerId !== botId) return releaseLock();

        if (state.phase === 'JAIL_DECISION') {
          this.logger.log(`Bot ${botId} in jail, rolling for doubles...`);
          await this.gameService.dispatchAction(gameId, { type: 'ROLL_FOR_JAIL', playerId: botId });
          return releaseLock();
        }

        if (state.phase === 'WAITING' || state.phase === 'ROLLING') {
          this.logger.log(`Bot ${botId} rolling dice`);
          await this.gameService.dispatchAction(gameId, { type: 'ROLL_DICE', playerId: botId });
          return releaseLock();
        }

      // If already rolled, check if they can buy property
      const position = player?.position;
      if (position !== undefined) {
        const tileDef = BOARD_TILES[position];
        
        if (tileDef && tileDef.type === 'property') {
           const propertyState = state.properties.find(p => p.tileIndex === position);
           
           if ((!propertyState || !propertyState.ownerId) && player!.cash >= (tileDef as any).price) {
             this.logger.log(`Bot ${botId} buying property`);
             await this.gameService.dispatchAction(gameId, { type: 'BUY_PROPERTY', playerId: botId });
           }
        }
      }

      // Wait a bit, then end turn
      setTimeout(async () => {
        try {
          if (state.phase === 'ACTION' || state.phase === 'LANDED') {
            const playerState = state.players.find(p => p.id === botId);
            const myProperties = state.properties.filter((p: any) => p.ownerId === botId);

            // 1. Building Houses/Hotels
            if (playerState && playerState.cash > 200) { // Keep some buffer cash
               for (const myProp of myProperties) {
                 const tileDef = BOARD_TILES[myProp.tileIndex];
                 if (tileDef && tileDef.type === 'property' && 'group' in tileDef) {
                   const group = tileDef.group;
                   const groupTiles = BOARD_TILES.map((t, i) => ({ t, i })).filter(x => x.t.type === 'property' && 'group' in x.t && (x.t as any).group === group);
                   const myOwnedInGroup = myProperties.filter((p: any) => groupTiles.some(gt => gt.i === p.tileIndex));
                   
                   // Check if we own the full group
                   if (myOwnedInGroup.length === groupTiles.length) {
                     const anyMortgaged = myOwnedInGroup.some((p: any) => p.isMortgaged);
                     if (!anyMortgaged) {
                       const minHouses = Math.min(...myOwnedInGroup.map((p: any) => p.houses));
                       
                       if (minHouses < 5) {
                         // Check bank availability
                         if (minHouses < 4 && state.bank.housesRemaining <= 0) continue;
                         if (minHouses === 4 && state.bank.hotelsRemaining <= 0) continue;

                         const targetProp = myOwnedInGroup.find((p: any) => p.houses === minHouses);
                         if (targetProp) {
                           const targetTileDef = BOARD_TILES[targetProp.tileIndex] as any;
                           if (playerState.cash >= targetTileDef.houseCost + 150) { // Maintain 150 buffer after building
                              this.logger.log(`Bot ${botId} building house/hotel on tile ${targetProp.tileIndex}`);
                              await this.gameService.dispatchAction(gameId, { type: 'BUILD_HOUSE', playerId: botId, tileIndex: targetProp.tileIndex });
                              return; // Wait for next handleTurn to do more actions or build more
                           }
                         }
                       }
                     }
                   }
                 }
               }
            }

            // 2. Proactive Trading
            if (!this.attemptedTrades.has(gameId)) this.attemptedTrades.set(gameId, new Set());
            const gameTrades = this.attemptedTrades.get(gameId)!;
            
            for (const myProp of myProperties) {
               const tileDef = BOARD_TILES[myProp.tileIndex];
               if (tileDef && tileDef.type === 'property' && 'group' in tileDef) {
                 const group = tileDef.group;
                 const groupTiles = BOARD_TILES.map((t, i) => ({ t, i })).filter(x => x.t.type === 'property' && 'group' in x.t && (x.t as any).group === group);
                 
                 const myOwnedInGroup = myProperties.filter((p: any) => groupTiles.some(gt => gt.i === p.tileIndex)).length;
                 
                 if (myOwnedInGroup === groupTiles.length - 1) {
                   const missingTile = groupTiles.find(gt => !myProperties.some((p: any) => p.tileIndex === gt.i));
                   if (missingTile) {
                     const missingPropState = state.properties.find((p: any) => p.tileIndex === missingTile.i);
                     if (missingPropState && missingPropState.ownerId && missingPropState.ownerId !== botId) {
                        const targetId = missingPropState.ownerId;
                        const basePrice = (missingTile.t as any).price || 0;
                        const offerCash = Math.floor(basePrice * 1.5);
                        
                        const tradeHash = `${botId}-${targetId}-${missingTile.i}-${offerCash}`;
                        const playerState = state.players.find((p: any) => p.id === botId);
                        
                        if (playerState && playerState.cash >= offerCash && !gameTrades.has(tradeHash)) {
                          gameTrades.add(tradeHash);
                          this.logger.log(`Bot ${botId} proposing trade to ${targetId} for tile ${missingTile.i}`);
                          await this.gameService.dispatchAction(gameId, {
                            type: 'TRADE_PROPOSE',
                            playerId: botId,
                            trade: {
                              fromPlayerId: botId,
                              toPlayerId: targetId,
                              offerProperties: [],
                              offerCash: offerCash,
                              requestProperties: [missingTile.i],
                              requestCash: 0
                            }
                          });
                          return; // trade dispatched, exit early
                        }
                     }
                   }
                 }
               }
            }
          }

          this.logger.log(`Bot ${botId} ending turn`);
          await this.gameService.dispatchAction(gameId, { type: 'END_TURN', playerId: botId });
        } finally {
          releaseLock();
        }
      }, 1500);

      } catch (err) {
        releaseLock();
      }
    }, 1500);
  }
}
