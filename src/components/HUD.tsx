import React from 'react';
import { Volume2, VolumeX, Pause, Play, Music, Sparkles } from 'lucide-react';
import { ActivePowerUp } from '../types/game';

interface HUDProps {
  score: number;
  bestScore: number;
  seeds: number;
  isPaused: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  activePowerUps: ActivePowerUp[];
  onTogglePause: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  bestScore,
  seeds,
  isPaused,
  soundEnabled,
  musicEnabled,
  activePowerUps,
  onTogglePause,
  onToggleSound,
  onToggleMusic,
}) => {
  return (
    <div className="absolute top-0 inset-x-0 p-4 pointer-events-none flex flex-col gap-2 z-20 max-w-[520px] mx-auto">
      {/* Top action row */}
      <div className="flex items-center justify-between pointer-events-auto">
        {/* Seeds and Best */}
        <div className="flex items-center gap-3 text-white drop-shadow-md">
          <div className="flex items-center gap-1.5 bg-black/35 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-sm font-semibold">
            <span className="text-amber-400">🌰</span>
            <span className="tabular-nums font-mono">{seeds}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/90 bg-black/25 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10">
            <span className="text-white/60">BEST</span>
            <span className="font-mono font-bold tabular-nums text-amber-300">{bestScore}</span>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMusic}
            title={musicEnabled ? 'Disable Music' : 'Enable Cozy Music'}
            className={`p-2 rounded-xl backdrop-blur-md transition-colors border ${
              musicEnabled
                ? 'bg-purple-600/80 text-white border-purple-400/40 shadow-sm'
                : 'bg-black/35 text-white/70 hover:text-white border-white/10'
            }`}
          >
            <Music className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            className={`p-2 rounded-xl backdrop-blur-md transition-colors border ${
              soundEnabled
                ? 'bg-black/35 text-white border-white/10 hover:bg-black/50'
                : 'bg-red-500/60 text-white border-red-400/40'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onTogglePause}
            title={isPaused ? 'Resume Game' : 'Pause Game'}
            className="p-2 rounded-xl bg-black/35 text-white hover:bg-black/50 backdrop-blur-md transition-colors border border-white/10"
          >
            {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
          </button>
        </div>
      </div>

      {/* Primary Score Counter - Prominent and Crisp */}
      <div className="flex flex-col items-center justify-center mt-2">
        <span className="font-display font-bold text-5xl md:text-6xl text-white tracking-wider drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] tabular-nums">
          {score}
        </span>
      </div>

      {/* Active Power-up Status Badges */}
      {activePowerUps.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-1">
          {activePowerUps.map(p => {
            const pct = Math.max(0, Math.min(100, (p.remainingTime / p.duration) * 100));
            const icon = p.type === 'shield' ? '🛡️' : p.type === 'magnet' ? '🧲' : '🪶';
            const name = p.type === 'shield' ? 'Shield' : p.type === 'magnet' ? 'Magnet' : 'Float';
            return (
              <div
                key={p.type}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-lg border border-white/20 text-xs text-white"
              >
                <span>{icon}</span>
                <span className="font-medium">{name}</span>
                <div className="w-12 h-1.5 bg-white/20 rounded-full overflow-hidden ml-1">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-150"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
