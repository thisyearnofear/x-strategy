import React, { useEffect, useState } from 'react';

interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  amount?: string;
  time: string;
}

const ACTIVITIES = [
  { user: '0x71C...3E4', action: 'backed', target: 'DeSci Protocol Expansion', amount: '0.5 ETH' },
  { user: 'vitalik.eth', action: 'verified milestone', target: 'L2 Scaling Research' },
  { user: 'alpha_staker', action: 'opted into', target: 'Cross-chain Liquidity Hub', amount: '2.5 ETH' },
  { user: '0x123...abc', action: 'completed', target: 'AI Oracle Integration' },
  { user: 'trader_joe', action: 'backed', target: 'DeSci Protocol Expansion', amount: '0.1 ETH' },
  { user: 'whale_watcher', action: 'contributed to', target: 'Green Energy RWA', amount: '10 ETH' },
];

export default function ActivityToast() {
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showRandomActivity = () => {
      const randomActivity = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
      setCurrentActivity({
        ...randomActivity,
        id: Math.random().toString(36).substr(2, 9),
        time: 'Just now'
      });
      setIsVisible(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    // Initial delay
    const initialTimer = setTimeout(showRandomActivity, 3000);

    // Repeat every 15-25 seconds
    const interval = setInterval(() => {
      showRandomActivity();
    }, 20000 + Math.random() * 10000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  if (!currentActivity) return null;

  return (
    <div 
      className={`fixed bottom-6 left-6 z-[100] transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
    >
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-2xl flex items-center gap-4 max-w-sm">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
          {currentActivity.user.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-sm text-gray-900 dark:text-white leading-tight">
            <span className="font-bold text-blue-600 dark:text-blue-400">{currentActivity.user}</span>{' '}
            {currentActivity.action}{' '}
            <span className="font-semibold">"{currentActivity.target}"</span>
            {currentActivity.amount && (
              <span className="ml-1 text-green-600 dark:text-green-400 font-bold">({currentActivity.amount})</span>
            )}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1 uppercase tracking-wider font-bold">
            {currentActivity.time} • Live Activity
          </p>
        </div>
      </div>
    </div>
  );
}
