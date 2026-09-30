import React, { useEffect } from 'react';
import { RotateCcw, Home, Trophy, Sparkles, Award } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  bestScore: number;
  isNewBest: boolean;
  seedsCollectedThisRun: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  bestScore,
  isNewBest,
  seedsCollectedThisRun,
  onPlayAgain,
  onGoHome,
}) => {
  // Listen for Spacebar or Enter to play again instantly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onPlayAgain();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        onGoHome();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayAgain, onGoHome]);

  // Determine medal
  const getMedal = (pts: number) => {
    if (pts >= 50) return { title: 'Diamond Fluff', color: 'from-cyan-400 to-blue-500', icon: '💎' };
    if (pts >= 30) return { title: 'Gold Fluff', color: 'from-amber-300 to-amber-500', icon: '🥇' };
    if (pts >= 15) return { title: 'Silver Fluff', color: 'from-slate-200 to-slate-400', icon: '🥈' };
    if (pts >= 5) return { title: 'Bronze Fluff', color: 'from-amber-600 to-amber-800', icon: '🥉' };
    return null;
  };

  const medal = getMedal(score);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-slate-900/95 border-2 border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center transform scale-100 transition-all">
        {/* Game Over Title */}
        <h2 className="font-display font-bold text-3xl text-white tracking-wider drop-shadow-md">
          GAME OVER
        </h2>

        {isNewBest && (
          <div className="mt-1 flex items-center gap-1 text-xs font-bold text-amber-400 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEW BEST RECORD!</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Score Card Box */}
        <div className="w-full mt-4 bg-slate-800/80 rounded-2xl p-4 border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Score</span>
            <span className="font-display font-bold text-3xl text-white tabular-nums">{score}</span>
          </div>

          <div className="w-full h-px bg-white/10" />

          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Best
            </span>
            <span className="font-display font-bold text-2xl text-amber-300 tabular-nums">{bestScore}</span>
          </div>

          {/* Seeds and Medal info */}
          {(seedsCollectedThisRun > 0 || medal) && (
            <>
              <div className="w-full h-px bg-white/10" />
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1 text-amber-400">
                  <span>🌰</span> +{seedsCollectedThisRun} Seeds
                </span>

                {medal && (
                  <span className="flex items-center gap-1 font-semibold text-white">
                    <span>{medal.icon}</span>
                    <span>{medal.title}</span>
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full mt-5 flex flex-col gap-2.5">
          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-slate-950 font-display font-bold text-lg tracking-wide shadow-lg border border-amber-200 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            PLAY AGAIN
          </button>

          <button
            onClick={onGoHome}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-medium text-sm transition-all border border-white/10 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            HOME
          </button>
        </div>
      </div>
    </div>
  );
};
