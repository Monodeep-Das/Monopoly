'use client';

import React from 'react';
import { X, Home, DollarSign } from 'lucide-react';
import { Button } from './ui/button';

interface Property {
  id: number;
  name: string;
  color: string;
  price: number;
  houses: number;
  hotels: number;
  isMortgaged: boolean;
  mortgageValue?: number;
}

interface PropertyGroup {
  color: string;
  properties: Property[];
}

interface PropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onMortgage?: (propertyId: number) => void;
  onUnmortgage?: (propertyId: number) => void;
}

export default function PropertiesModal({
  isOpen,
  onClose,
  properties,
  onMortgage,
  onUnmortgage,
}: PropertiesModalProps) {
  if (!isOpen) return null;

  // Group properties by color
  const groupedByColor = properties.reduce(
    (acc, prop) => {
      const colorGroup = acc.find((g) => g.color === prop.color);
      if (colorGroup) {
        colorGroup.properties.push(prop);
      } else {
        acc.push({ color: prop.color, properties: [prop] });
      }
      return acc;
    },
    [] as PropertyGroup[]
  );

  const COLOR_CLASSES: Record<string, string> = {
    'bg-amber-800': 'border-amber-800/50 bg-amber-900/20',
    'bg-cyan-600': 'border-cyan-600/50 bg-cyan-900/20',
    'bg-fuchsia-600': 'border-fuchsia-600/50 bg-fuchsia-900/20',
    'bg-orange-600': 'border-orange-600/50 bg-orange-900/20',
    'bg-red-600': 'border-red-600/50 bg-red-900/20',
    'bg-yellow-600': 'border-yellow-600/50 bg-yellow-900/20',
    'bg-green-600': 'border-green-600/50 bg-green-900/20',
    'bg-blue-700': 'border-blue-700/50 bg-blue-900/20',
    'bg-gray-700': 'border-gray-700/50 bg-gray-900/20',
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-white/20 rounded-xl max-w-2xl max-h-96 overflow-y-auto w-full glassmorphism">
          {/* Header */}
          <div className="sticky top-0 h-16 border-b border-white/20 flex items-center justify-between px-6 bg-card/90 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Home size={20} className="text-primary" />
              <h2 className="font-bold text-lg">My Properties</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {properties.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                You don&apos;t own any properties yet
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedByColor.map((group) => (
                  <div key={group.color} className="space-y-3">
                    {group.properties.map((prop) => (
                      <div
                        key={prop.id}
                        className={`border rounded-lg p-4 ${COLOR_CLASSES[group.color] || 'border-white/20 bg-white/5'}`}
                      >
                        {/* Color band */}
                        <div
                          className={`${group.color} h-2 rounded w-full mb-3 -mx-4 -mt-4 px-4`}
                        />

                        {/* Property name and price */}
                        <div className="mb-3">
                          <h3 className="font-bold text-foreground">
                            {prop.name}
                          </h3>
                          <div className="text-xs text-muted-foreground mt-1">
                            ${prop.price.toLocaleString()} purchase price
                          </div>
                        </div>

                        {/* Houses and hotels */}
                        <div className="flex gap-3 mb-3">
                          {prop.houses > 0 && (
                            <div className="flex items-center gap-1 text-xs">
                              <span className="w-3 h-3 bg-red-500 rounded" />
                              <span>
                                {prop.houses} house{prop.houses > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                          {prop.hotels > 0 && (
                            <div className="flex items-center gap-1 text-xs">
                              <span className="w-3 h-3 bg-green-500 rounded" />
                              <span>{prop.hotels} hotel</span>
                            </div>
                          )}
                        </div>

                        {/* Mortgage status */}
                        {prop.isMortgaged && (
                          <div className="bg-red-500/20 border border-red-500/30 rounded px-2 py-1 mb-3 text-xs text-red-300 text-center font-semibold">
                            Mortgaged
                          </div>
                        )}

                        {/* Actions */}
                        <Button
                          onClick={() => {
                            if (prop.isMortgaged) {
                              onUnmortgage?.(prop.id);
                            } else {
                              onMortgage?.(prop.id);
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="w-full text-xs gap-1"
                        >
                          <DollarSign size={14} />
                          {prop.isMortgaged
                            ? `Unmortgage (${prop.mortgageValue})`
                            : `Mortgage (${Math.floor(prop.price / 2)})`}
                        </Button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
