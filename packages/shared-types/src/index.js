"use strict";
// ─── Tile Types ───
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketServerEvent = exports.SocketClientEvent = void 0;
// ─── Socket Events ───
var SocketClientEvent;
(function (SocketClientEvent) {
    SocketClientEvent["ROOM_CREATE"] = "room:create";
    SocketClientEvent["ROOM_JOIN"] = "room:join";
    SocketClientEvent["ROOM_LEAVE"] = "room:leave";
    SocketClientEvent["GAME_START"] = "game:start";
    SocketClientEvent["GAME_ACTION"] = "game:action";
    SocketClientEvent["CHAT_SEND"] = "chat:send";
    SocketClientEvent["RECONNECT"] = "client:reconnect";
})(SocketClientEvent || (exports.SocketClientEvent = SocketClientEvent = {}));
var SocketServerEvent;
(function (SocketServerEvent) {
    SocketServerEvent["ROOM_UPDATED"] = "room:updated";
    SocketServerEvent["GAME_STARTED"] = "game:started";
    SocketServerEvent["GAME_STATE_UPDATE"] = "game:state";
    SocketServerEvent["GAME_EVENT"] = "game:event";
    SocketServerEvent["CHAT_RECEIVED"] = "chat:received";
    SocketServerEvent["PLAYER_DISCONNECTED"] = "player:disconnected";
    SocketServerEvent["PLAYER_RECONNECTED"] = "player:reconnected";
    SocketServerEvent["ERROR"] = "error";
})(SocketServerEvent || (exports.SocketServerEvent = SocketServerEvent = {}));
//# sourceMappingURL=index.js.map