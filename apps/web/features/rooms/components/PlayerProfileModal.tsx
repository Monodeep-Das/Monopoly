import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Palette, Save } from 'lucide-react';

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: { nickname: string; color: string }) => void;
  currentProfile: { nickname: string; color: string };
  takenColors: string[];
  isSaving?: boolean;
}

const COLORS = [
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#84cc16', // Lime
  '#eab308', // Yellow
  '#14b8a6', // Teal
  '#6366f1', // Indigo
  '#f97316'  // Orange
];

export function PlayerProfileModal({ isOpen, onClose, onSave, currentProfile, takenColors, isSaving }: PlayerProfileModalProps) {
  const [nickname, setNickname] = useState(currentProfile.nickname);
  const [color, setColor] = useState(currentProfile.color);

  React.useEffect(() => {
    if (isOpen) {
      setNickname(currentProfile.nickname);
      setColor(currentProfile.color);
    }
  }, [isOpen, currentProfile.nickname, currentProfile.color]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex items-center gap-3">
            <div className="bg-fuchsia-500/20 p-2 rounded-lg text-fuchsia-400">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 tracking-wide">Edit Profile</h2>
            </div>
            <button 
              onClick={onClose}
              className="ml-auto w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 flex flex-col gap-6">
            {/* Nickname */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                Nickname
              </label>
              <input 
                type="text" 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={15}
                placeholder="Enter a nickname..."
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-fuchsia-500 focus:border-fuchsia-500 block p-3 text-sm placeholder:text-slate-500 font-bold"
              />
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Palette size={16} className="text-slate-500" />
                Player Color
              </label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((c) => {
                  const isTaken = takenColors.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => !isTaken && setColor(c)}
                      disabled={isTaken}
                      className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center relative ${
                        color === c 
                          ? 'scale-110 border-white shadow-lg' 
                          : isTaken
                            ? 'border-transparent opacity-20 cursor-not-allowed saturate-0'
                            : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105 shadow-md'
                      }`}
                      style={{ backgroundColor: c }}
                      title={isTaken ? "Color taken by another player" : "Select this color"}
                    >
                      {color === c && <div className="w-3 h-3 bg-white rounded-full shadow-sm" />}
                      {isTaken && color !== c && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                          <X size={16} strokeWidth={3} className="drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-bold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSave({ nickname, color })}
              disabled={isSaving}
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-fuchsia-500/20"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
