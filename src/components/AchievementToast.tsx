/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Achievement, achievementManager } from '../game/achievements';

export const AchievementToast: React.FC = () => {
  const [activeToast, setActiveToast] = useState<Achievement | null>(null);

  useEffect(() => {
    const handleUnlock = (ach: Achievement) => {
      setActiveToast(ach);
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 4200);
      return () => clearTimeout(timer);
    };

    achievementManager.onUnlock(handleUnlock);
  }, []);

  if (!activeToast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-5 right-5 z-50 flex items-center gap-3.5 bg-slate-950/95 border-2 border-amber-400/80 px-4 py-3 rounded-2xl shadow-2xl shadow-amber-500/30 animate-bounce duration-300 text-slate-100 max-w-sm pointer-events-none"
    >
      <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl shrink-0">
        {activeToast.icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase font-bold tracking-widest text-amber-400 flex items-center gap-1.5">
          <span>🏆</span> CONQUISTA DESBLOQUEADA!
        </div>
        <div className="text-sm font-bold text-white truncate">{activeToast.title}</div>
        <div className="text-xs text-slate-400 truncate">{activeToast.description}</div>
      </div>
    </div>
  );
};
