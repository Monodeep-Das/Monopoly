'use client';

import React from 'react';
import { Dices, DollarSign, Home, Share2, AlertCircle } from 'lucide-react';

interface Activity {
  id: number;
  type: 'dice' | 'purchase' | 'rent' | 'trade' | 'notification';
  player: string;
  message: string;
  timestamp: Date;
  details?: {
    property?: string;
    amount?: number;
  };
}

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'dice':
        return <Dices size={16} className="text-primary" />;
      case 'purchase':
        return <Home size={16} className="text-green-500" />;
      case 'rent':
        return <DollarSign size={16} className="text-red-500" />;
      case 'trade':
        return <Share2 size={16} className="text-accent" />;
      case 'notification':
        return <AlertCircle size={16} className="text-yellow-500" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'dice':
        return 'text-primary';
      case 'purchase':
        return 'text-green-500';
      case 'rent':
        return 'text-red-500';
      case 'trade':
        return 'text-accent';
      case 'notification':
        return 'text-yellow-500';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-2 overflow-y-auto">
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="font-bold text-sm text-foreground">Activity</h3>
        <span className="text-xs text-muted-foreground">{activities.length}</span>
      </div>

      {activities.length === 0 ? (
        <div className="text-center text-muted-foreground text-xs py-8">
          No activity yet
        </div>
      ) : (
        activities.map((activity) => (
          <div
            key={activity.id}
            className="glassmorphism-sm p-2.5 text-xs border-left-2"
          >
            <div className="flex gap-2">
              <div className="flex-shrink-0 mt-1">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground">
                  {activity.player}
                </div>
                <div className={`text-muted-foreground text-xs mt-0.5`}>
                  {activity.message}
                </div>
                {activity.details?.amount && (
                  <div className={`text-xs font-bold mt-1 ${getTypeColor(activity.type)}`}>
                    {activity.details.amount > 0 ? '+' : ''}$
                    {activity.details.amount.toLocaleString()}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground flex-shrink-0">
                {Math.round(
                  (Date.now() - activity.timestamp.getTime()) / 60000
                )}
                m
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
