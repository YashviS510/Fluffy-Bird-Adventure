import React from 'react';
import { X, Trophy, CheckCircle2, Lock } from 'lucide-react';
import { PlayerStats } from '../types/game';
import { ACHIEVEMENTS_LIST } from '../utils/storage';

interface AchievementsModalProps {
  stats: PlayerStats;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ stats, onClose }) => {
  const totalUnlocked = ACHIEVEMENTS_LIST.filter(a => stats.achievements[a.id]).length;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-bold text-xl text-white">Achievements</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300">
              {totalUnlocked}/{ACHIEVEMENTS_LIST.length}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 mt-3 pr-1">
          {ACHIEVEMENTS_LIST.map(ach => {
            const isUnlocked = !!stats.achievements[ach.id];

            return (
              <div
                key={ach.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  isUnlocked
                    ? 'bg-slate-800/80 border-amber-400/30 shadow-sm'
                    : 'bg-slate-900/60 border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isUnlocked ? 'bg-amber-400/20 text-amber-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? <Trophy className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{ach.title}</div>
                    <div className="text-xs text-slate-400">{ach.description}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pl-2">
                  {isUnlocked ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                      +{ach.rewardSeeds} 🌰
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
