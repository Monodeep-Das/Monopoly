'use client';

import React from 'react';
import { Send, X } from 'lucide-react';
import { Button } from './ui/button';

interface ChatMessage {
  id: number;
  player: string;
  playerColor: string;
  message: string;
  timestamp: Date;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage?: (message: string) => void;
}

export default function ChatDrawer({
  isOpen,
  onClose,
  messages,
  onSendMessage,
}: ChatDrawerProps) {
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage?.(inputValue);
      setInputValue('');
    }
  };

  if (!isOpen) return null;

  const PLAYER_COLORS: Record<string, string> = {
    red: 'bg-red-500/20 border-red-500/30',
    blue: 'bg-blue-500/20 border-blue-500/30',
    yellow: 'bg-yellow-500/20 border-yellow-500/30',
    green: 'bg-green-500/20 border-green-500/30',
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Chat drawer */}
      <div className="fixed right-0 bottom-0 w-96 h-full bg-card border-l border-white/20 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-white/20 flex items-center justify-between px-6 glassmorphism">
          <h2 className="font-bold text-lg">Game Chat</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm h-full flex items-center justify-center">
              No messages yet. Say something!
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      {
                        red: 'bg-red-500',
                        blue: 'bg-blue-500',
                        yellow: 'bg-yellow-500',
                        green: 'bg-green-500',
                      }[msg.playerColor] || 'bg-gray-500'
                    }`}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {msg.player}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className={`bg-white/5 rounded px-3 py-2 border border-white/10 text-sm text-foreground`}>
                  {msg.message}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="h-20 border-t border-white/20 p-4 flex gap-2 items-end">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
            className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            size="icon"
            className="bg-primary hover:bg-primary/90"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </>
  );
}
