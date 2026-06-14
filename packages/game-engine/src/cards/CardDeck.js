"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardDeck = exports.COMMUNITY_CHEST_CARDS = exports.CHANCE_CARDS = void 0;
// ─── Chance Cards ───
exports.CHANCE_CARDS = [
    {
        id: 'chance-1',
        deck: 'chance',
        description: 'Advance to GO. Collect $200.',
        effect: { type: 'MOVE_TO', description: 'Advance to GO', value: 0 },
    },
    {
        id: 'chance-2',
        deck: 'chance',
        description: 'Advance to Shenzhen. If you pass GO, collect $200.',
        effect: { type: 'MOVE_TO', description: 'Advance to Shenzhen', value: 24 },
    },
    {
        id: 'chance-3',
        deck: 'chance',
        description: 'Advance to Milan. If you pass GO, collect $200.',
        effect: { type: 'MOVE_TO', description: 'Advance to Milan', value: 11 },
    },
    {
        id: 'chance-4',
        deck: 'chance',
        description: 'Advance to the nearest Utility. If unowned, you may buy it. If owned, pay 10× dice roll.',
        effect: { type: 'MOVE_TO_NEAREST_UTILITY', description: 'Advance to nearest Utility' },
    },
    {
        id: 'chance-5',
        deck: 'chance',
        description: 'Advance to the nearest Railroad. Pay double rent if owned.',
        effect: { type: 'MOVE_TO_NEAREST_RAILROAD', description: 'Advance to nearest Railroad' },
    },
    {
        id: 'chance-6',
        deck: 'chance',
        description: 'Advance to the nearest Railroad. Pay double rent if owned.',
        effect: { type: 'MOVE_TO_NEAREST_RAILROAD', description: 'Advance to nearest Railroad' },
    },
    {
        id: 'chance-7',
        deck: 'chance',
        description: 'Bank pays you dividend of $50.',
        effect: { type: 'COLLECT', description: 'Bank dividend', value: 50 },
    },
    {
        id: 'chance-8',
        deck: 'chance',
        description: 'Get Out of Jail Free.',
        effect: { type: 'GET_OUT_OF_JAIL_FREE', description: 'Get Out of Jail Free' },
    },
    {
        id: 'chance-9',
        deck: 'chance',
        description: 'Go back 3 spaces.',
        effect: { type: 'MOVE_RELATIVE', description: 'Go back 3 spaces', value: -3 },
    },
    {
        id: 'chance-10',
        deck: 'chance',
        description: 'Go to Jail. Go directly to Jail. Do not pass GO. Do not collect $200.',
        effect: { type: 'GO_TO_JAIL', description: 'Go to Jail' },
    },
    {
        id: 'chance-11',
        deck: 'chance',
        description: 'Make general repairs on all your property. Pay $25 per house, $100 per hotel.',
        effect: { type: 'REPAIRS', description: 'General repairs', perHouse: 25, perHotel: 100 },
    },
    {
        id: 'chance-12',
        deck: 'chance',
        description: 'Pay poor tax of $15.',
        effect: { type: 'PAY', description: 'Poor tax', value: 15 },
    },
    {
        id: 'chance-13',
        deck: 'chance',
        description: 'Take a trip to TLV Airport. If you pass GO, collect $200.',
        effect: { type: 'MOVE_TO', description: 'Trip to TLV Airport', value: 5 },
    },
    {
        id: 'chance-14',
        deck: 'chance',
        description: 'Advance to Dubai. If you pass GO, collect $200.',
        effect: { type: 'MOVE_TO', description: 'Advance to Dubai', value: 39 },
    },
    {
        id: 'chance-15',
        deck: 'chance',
        description: 'You have been elected Chairman of the Board. Pay each player $50.',
        effect: { type: 'PAY_EACH_PLAYER', description: 'Chairman of the Board', value: 50 },
    },
    {
        id: 'chance-16',
        deck: 'chance',
        description: 'Your building loan matures. Collect $150.',
        effect: { type: 'COLLECT', description: 'Building loan matures', value: 150 },
    },
];
// ─── Community Chest Cards ───
exports.COMMUNITY_CHEST_CARDS = [
    {
        id: 'cc-1',
        deck: 'community-chest',
        description: 'Advance to GO. Collect $200.',
        effect: { type: 'MOVE_TO', description: 'Advance to GO', value: 0 },
    },
    {
        id: 'cc-2',
        deck: 'community-chest',
        description: 'Bank error in your favor. Collect $200.',
        effect: { type: 'COLLECT', description: 'Bank error', value: 200 },
    },
    {
        id: 'cc-3',
        deck: 'community-chest',
        description: "Doctor's fees. Pay $50.",
        effect: { type: 'PAY', description: "Doctor's fees", value: 50 },
    },
    {
        id: 'cc-4',
        deck: 'community-chest',
        description: 'From sale of stock you get $50.',
        effect: { type: 'COLLECT', description: 'Stock sale', value: 50 },
    },
    {
        id: 'cc-5',
        deck: 'community-chest',
        description: 'Get Out of Jail Free.',
        effect: { type: 'GET_OUT_OF_JAIL_FREE', description: 'Get Out of Jail Free' },
    },
    {
        id: 'cc-6',
        deck: 'community-chest',
        description: 'Go to Jail. Go directly to Jail. Do not pass GO. Do not collect $200.',
        effect: { type: 'GO_TO_JAIL', description: 'Go to Jail' },
    },
    {
        id: 'cc-7',
        deck: 'community-chest',
        description: 'Holiday fund matures. Collect $100.',
        effect: { type: 'COLLECT', description: 'Holiday fund', value: 100 },
    },
    {
        id: 'cc-8',
        deck: 'community-chest',
        description: 'Income tax refund. Collect $20.',
        effect: { type: 'COLLECT', description: 'Tax refund', value: 20 },
    },
    {
        id: 'cc-9',
        deck: 'community-chest',
        description: 'It is your birthday. Collect $10 from every player.',
        effect: { type: 'COLLECT_FROM_EACH_PLAYER', description: 'Birthday', value: 10 },
    },
    {
        id: 'cc-10',
        deck: 'community-chest',
        description: 'Life insurance matures. Collect $100.',
        effect: { type: 'COLLECT', description: 'Life insurance', value: 100 },
    },
    {
        id: 'cc-11',
        deck: 'community-chest',
        description: 'Hospital fees. Pay $100.',
        effect: { type: 'PAY', description: 'Hospital fees', value: 100 },
    },
    {
        id: 'cc-12',
        deck: 'community-chest',
        description: 'School fees. Pay $50.',
        effect: { type: 'PAY', description: 'School fees', value: 50 },
    },
    {
        id: 'cc-13',
        deck: 'community-chest',
        description: 'Receive $25 consultancy fee.',
        effect: { type: 'COLLECT', description: 'Consultancy fee', value: 25 },
    },
    {
        id: 'cc-14',
        deck: 'community-chest',
        description: 'You are assessed for street repairs. Pay $40 per house, $115 per hotel.',
        effect: { type: 'REPAIRS', description: 'Street repairs', perHouse: 40, perHotel: 115 },
    },
    {
        id: 'cc-15',
        deck: 'community-chest',
        description: 'You have won second prize in a beauty contest. Collect $10.',
        effect: { type: 'COLLECT', description: 'Beauty contest', value: 10 },
    },
    {
        id: 'cc-16',
        deck: 'community-chest',
        description: 'You inherit $100.',
        effect: { type: 'COLLECT', description: 'Inheritance', value: 100 },
    },
];
// ─── Deck Manager ───
class CardDeck {
    constructor(cards) {
        this.heldCards = []; // Get Out of Jail Free cards held by players
        this.cards = [...cards];
        this.drawPile = [];
        this.shuffle();
    }
    /** Fisher-Yates shuffle */
    shuffle() {
        this.drawPile = [...this.cards.filter((c) => !this.heldCards.includes(c))];
        for (let i = this.drawPile.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.drawPile[i], this.drawPile[j]] = [this.drawPile[j], this.drawPile[i]];
        }
    }
    /** Draw the top card. Reshuffles if empty. */
    draw() {
        if (this.drawPile.length === 0) {
            this.shuffle();
        }
        const card = this.drawPile.shift();
        // If it's a Get Out of Jail Free card, hold it out of the deck
        if (card.effect.type === 'GET_OUT_OF_JAIL_FREE') {
            this.heldCards.push(card);
        }
        return card;
    }
    /** Return a Get Out of Jail Free card to the deck */
    returnCard(cardId) {
        const idx = this.heldCards.findIndex((c) => c.id === cardId);
        if (idx !== -1) {
            this.heldCards.splice(idx, 1);
        }
    }
    /** How many cards remain in the draw pile */
    get remaining() {
        return this.drawPile.length;
    }
    /** Serialize for state snapshot */
    serialize() {
        return {
            remaining: this.drawPile.length,
            heldCardIds: this.heldCards.map((c) => c.id),
        };
    }
}
exports.CardDeck = CardDeck;
//# sourceMappingURL=CardDeck.js.map