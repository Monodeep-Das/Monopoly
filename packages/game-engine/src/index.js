"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = exports.CardDeck = exports.COMMUNITY_CHEST_CARDS = exports.CHANCE_CARDS = exports.GROUP_SIZES = exports.getGroupTiles = exports.UTILITY_INDICES = exports.RAILROAD_INDICES = exports.TOTAL_HOTELS = exports.TOTAL_HOUSES = exports.MAX_DOUBLES = exports.MAX_JAIL_TURNS = exports.JAIL_BAIL = exports.GO_SALARY = exports.STARTING_CASH = exports.BOARD_SIZE = exports.TILE_MAP = exports.BOARD_TILES = void 0;
// Board
var Board_1 = require("./board/Board");
Object.defineProperty(exports, "BOARD_TILES", { enumerable: true, get: function () { return Board_1.BOARD_TILES; } });
Object.defineProperty(exports, "TILE_MAP", { enumerable: true, get: function () { return Board_1.TILE_MAP; } });
Object.defineProperty(exports, "BOARD_SIZE", { enumerable: true, get: function () { return Board_1.BOARD_SIZE; } });
Object.defineProperty(exports, "STARTING_CASH", { enumerable: true, get: function () { return Board_1.STARTING_CASH; } });
Object.defineProperty(exports, "GO_SALARY", { enumerable: true, get: function () { return Board_1.GO_SALARY; } });
Object.defineProperty(exports, "JAIL_BAIL", { enumerable: true, get: function () { return Board_1.JAIL_BAIL; } });
Object.defineProperty(exports, "MAX_JAIL_TURNS", { enumerable: true, get: function () { return Board_1.MAX_JAIL_TURNS; } });
Object.defineProperty(exports, "MAX_DOUBLES", { enumerable: true, get: function () { return Board_1.MAX_DOUBLES; } });
Object.defineProperty(exports, "TOTAL_HOUSES", { enumerable: true, get: function () { return Board_1.TOTAL_HOUSES; } });
Object.defineProperty(exports, "TOTAL_HOTELS", { enumerable: true, get: function () { return Board_1.TOTAL_HOTELS; } });
Object.defineProperty(exports, "RAILROAD_INDICES", { enumerable: true, get: function () { return Board_1.RAILROAD_INDICES; } });
Object.defineProperty(exports, "UTILITY_INDICES", { enumerable: true, get: function () { return Board_1.UTILITY_INDICES; } });
Object.defineProperty(exports, "getGroupTiles", { enumerable: true, get: function () { return Board_1.getGroupTiles; } });
Object.defineProperty(exports, "GROUP_SIZES", { enumerable: true, get: function () { return Board_1.GROUP_SIZES; } });
// Cards
var CardDeck_1 = require("./cards/CardDeck");
Object.defineProperty(exports, "CHANCE_CARDS", { enumerable: true, get: function () { return CardDeck_1.CHANCE_CARDS; } });
Object.defineProperty(exports, "COMMUNITY_CHEST_CARDS", { enumerable: true, get: function () { return CardDeck_1.COMMUNITY_CHEST_CARDS; } });
Object.defineProperty(exports, "CardDeck", { enumerable: true, get: function () { return CardDeck_1.CardDeck; } });
// Game
var Game_1 = require("./game/Game");
Object.defineProperty(exports, "Game", { enumerable: true, get: function () { return Game_1.Game; } });
//# sourceMappingURL=index.js.map