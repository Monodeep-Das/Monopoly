import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowDownRight, ArrowUpRight, ReceiptText } from "lucide-react";
import { GameState, GameLogEntry, TradeProposal } from "@richup/shared-types";

interface LedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState | null;
  currentPlayerId: string | null;
}

interface Transaction {
  id: string;
  amount: number; // positive for credit, negative for debit
  reason: string;
  timestamp: number;
}

export function LedgerModal({ isOpen, onClose, gameState, currentPlayerId }: LedgerModalProps) {
  if (!isOpen || !gameState || !currentPlayerId) return null;

  // Process game log to extract financial transactions for the current player
  const transactions: Transaction[] = [];

  gameState.log.forEach((log, index) => {
    const isSubject = log.playerId === currentPlayerId;
    const data = log.data || {};
    
    let amount = 0;
    let reason = log.message;

    switch (log.type) {
      case 'PLAYER_PASSED_GO':
        if (isSubject) {
          amount = (data.salary as number) || (data.amount as number) || 200;
        }
        break;
      case 'PROPERTY_PURCHASED':
        if (isSubject) amount = -(data.price as number || 0);
        break;
      case 'RENT_PAID':
        if (isSubject) {
          amount = -(data.amount as number || 0);
        } else if (data.toPlayerId === currentPlayerId) {
          amount = (data.amount as number || 0);
          reason = `${gameState.players.find(p => p.id === log.playerId)?.name || 'Someone'} paid you rent`;
        }
        break;
      case 'TAX_PAID':
        if (isSubject) amount = -(data.amount as number || 0);
        break;
      case 'HOUSE_BUILT':
        if (isSubject) amount = -(data.cost as number || 0);
        break;
      case 'HOUSE_SOLD':
      case 'PROPERTY_MORTGAGED':
        if (isSubject) amount = (data.amount as number || 0);
        break;
      case 'PROPERTY_UNMORTGAGED':
        if (isSubject) amount = -(data.cost as number || 0);
        break;
      case 'AUCTION_WON':
        if (isSubject) amount = -(data.amount as number || 0);
        break;
      case 'CARD_EFFECT_APPLIED':
        if (isSubject && data.amount) {
          amount = data.amount as number;
        }
        break;
      case 'TRADE_ACCEPTED':
        const trade = data.trade as TradeProposal;
        if (trade) {
          if (trade.toPlayerId === currentPlayerId) {
            // The person who accepted
            amount = trade.offerCash - trade.requestCash;
          } else if (trade.fromPlayerId === currentPlayerId) {
            // The proposer
            amount = trade.requestCash - trade.offerCash;
          }
        }
        break;
      case 'ERROR':
        // Don't show errors in ledger
        break;
      default:
        // No explicit financial change tracked
        break;
    }

    // Fallback if data was missing (e.g. backend not restarted, or old logs)
    if (amount === 0) {
      const match = reason.match(/\$(\d+)/);
      if (match) {
        const parsedAmount = parseInt(match[1], 10);
        const msgLower = reason.toLowerCase();
        
        if (isSubject) {
          if (msgLower.includes('paid') || msgLower.includes('bought') || msgLower.includes('tax') || msgLower.includes('bid') || msgLower.includes('unmortgaged') || msgLower.includes('built')) {
            amount = -parsedAmount;
          } else if (msgLower.includes('collected') || msgLower.includes('sold') || msgLower.includes('mortgaged')) {
            amount = parsedAmount;
          } else {
            amount = -parsedAmount; // Default fallback
          }
        } else if (log.type === 'RENT_PAID') {
          const myName = gameState.players.find(p => p.id === currentPlayerId)?.name;
          if (myName && reason.includes(myName)) {
            amount = parsedAmount;
            reason = `${gameState.players.find(p => p.id === log.playerId)?.name || 'Someone'} paid you rent`;
          }
        } else if (log.type === 'CARD_EFFECT_APPLIED') {
          // Someone else drew a card, like "pay each player $50"
          if (msgLower.includes('to each player')) {
             amount = parsedAmount;
             reason = `${gameState.players.find(p => p.id === log.playerId)?.name || 'Someone'} paid you`;
          } else if (msgLower.includes('from each player')) {
             amount = -parsedAmount;
             reason = `Paid ${gameState.players.find(p => p.id === log.playerId)?.name || 'Someone'}`;
          }
        }
      }
    }

    if (amount !== 0) {
      transactions.push({
        id: `${log.timestamp}-${index}`,
        amount,
        reason,
        timestamp: log.timestamp,
      });
    }
  });

  // Reverse so newest is at top
  transactions.reverse();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#1a1a2e] border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-5 border-b border-indigo-500/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30">
                <ReceiptText className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-wide">Bank Ledger</h2>
                <p className="text-xs text-indigo-300">Your recent transactions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {transactions.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <ReceiptText size={32} className="opacity-20" />
                <p className="text-sm">No transactions yet.</p>
              </div>
            ) : (
              transactions.map((tx) => {
                const isCredit = tx.amount > 0;
                return (
                  <div 
                    key={tx.id}
                    className="flex items-center p-3 rounded-xl bg-white/5 border border-white/5 gap-4"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {isCredit ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 font-medium truncate">{tx.reason}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                    </div>

                    <div className={`text-base font-black shrink-0 ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isCredit ? '+' : '-'}${Math.abs(tx.amount)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.5); }
          `}} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
