import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings2, Users, Coins, Map as MapIcon, Save } from 'lucide-react';

interface RoomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: { maxPlayers: number; startingCash: number; map: string }) => void;
  currentSettings: { maxPlayers: number; startingCash: number; map: string };
  isSaving?: boolean;
}

export function RoomSettingsModal({ isOpen, onClose, onSave, currentSettings, isSaving }: RoomSettingsModalProps) {
  const [maxPlayers, setMaxPlayers] = useState(currentSettings.maxPlayers || 4);
  const [startingCash, setStartingCash] = useState(currentSettings.startingCash || 1500);
  const [map, setMap] = useState(currentSettings.map || "classic");

  React.useEffect(() => {
    if (isOpen) {
      setMaxPlayers(currentSettings.maxPlayers || 4);
      setStartingCash(currentSettings.startingCash || 1500);
      setMap(currentSettings.map || "classic");
    }
  }, [isOpen, currentSettings.maxPlayers, currentSettings.startingCash, currentSettings.map]);

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
          className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
              <Settings2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-100 tracking-wide">Room Settings</h2>
              <p className="text-sm text-slate-400 font-medium">Configure game rules before starting</p>
            </div>
            <button 
              onClick={onClose}
              className="ml-auto w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-6">
            {/* Max Players */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <Users size={16} className="text-slate-500" />
                  Max Players
                </label>
                <span className="text-indigo-400 font-black">{maxPlayers}</span>
              </div>
              <input 
                type="range" 
                min="2" 
                max="8" 
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>2</span>
                <span>8</span>
              </div>
            </div>

            {/* Starting Cash */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <Coins size={16} className="text-slate-500" />
                  Starting Cash
                </label>
                <span className="text-emerald-400 font-black">${startingCash}</span>
              </div>
              <input 
                type="range" 
                min="500" 
                max="5000" 
                step="500"
                value={startingCash}
                onChange={(e) => setStartingCash(parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>$500</span>
                <span>$5000</span>
              </div>
            </div>

            {/* Map Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <MapIcon size={16} className="text-slate-500" />
                Map
              </label>
              <div className="relative">
                <select 
                  value={map}
                  onChange={(e) => setMap(e.target.value)}
                  disabled
                  className="w-full bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-3 appearance-none opacity-60 cursor-not-allowed font-medium"
                >
                  <option value="classic">Classic Monopoly</option>
                  <option value="london">London Edition (Coming Soon)</option>
                  <option value="space">Space Edition (Coming Soon)</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <span className="text-xs font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded">LOCKED</span>
                </div>
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
              onClick={() => onSave({ maxPlayers, startingCash, map })}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
