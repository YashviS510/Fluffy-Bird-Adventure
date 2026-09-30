import React from 'react';
import { Play, Sparkles, Trophy, HelpCircle, Volume2, VolumeX, Music } from 'lucide-react';
import { BirdSkin, Accessory, WorldTheme } from '../types/game';
import mascotImg from '../assets/images/fluffy_bird_mascot_1790752430849.jpg';

interface TitleScreenProps {
  bestScore: number;
  totalSeeds: number;
  skin: BirdSkin;
  accessory: Accessory;
  theme: WorldTheme;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onStartGame: () => void;
  onOpenWardrobe: () => void;
  onOpenAchievements: () => void;
  onOpenInstructions: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  bestScore,
  totalSeeds,
  skin,
  accessory,
  theme,
  soundEnabled,
  musicEnabled,
  onStartGame,
  onOpenWardrobe,
  onOpenAchievements,
  onOpenInstructions,
  onToggleSound,
  onToggleMusic,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-6 pointer-events-none max-w-[520px] mx-auto select-none">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between pointer-events-auto">
        {/* Seeds currency */}
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white shadow-lg">
          <span className="text-amber-400">🌰</span>
          <span className="font-mono font-bold tabular-nums text-sm">{totalSeeds}</span>
          <span className="text-white/60 text-xs ml-1">Seeds</span>
        </div>

        {/* Audio toggles & Help */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMusic}
            title={musicEnabled ? 'Disable Music' : 'Enable Cozy Music'}
            className={`p-2 rounded-xl backdrop-blur-md transition-all border ${
              musicEnabled
                ? 'bg-purple-600/80 text-white border-purple-400/40 shadow-sm'
                : 'bg-black/40 text-white/70 hover:text-white border-white/10'
            }`}
          >
            <Music className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            className={`p-2 rounded-xl backdrop-blur-md transition-all border ${
              soundEnabled
                ? 'bg-black/40 text-white border-white/10 hover:bg-black/60'
                : 'bg-red-500/60 text-white border-red-400/40'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenInstructions}
            title="How to Play"
            className="p-2 rounded-xl bg-black/40 text-white/80 hover:text-white hover:bg-black/60 backdrop-blur-md transition-all border border-white/10"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Title & Mascot Lockup */}
      <div className="flex flex-col items-center justify-center my-auto pointer-events-auto text-center">
        {/* Mascot Card Thumbnail */}
        <div className="relative mb-3 group">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-white/10 backdrop-blur-sm p-1">
            <img
              src={mascotImg}
              alt="Fluffy Bird Mascot"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-xl shadow-inner group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          {accessory.id !== 'none' && (
            <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full uppercase tracking-wider shadow-md">
              {accessory.name}
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-white tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
          FLUFFY BIRD
        </h1>

        <p className="mt-1 text-sm text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] font-medium">
          Tap, click, or press Space to fly
        </p>

        {/* Best Score Ribbon */}
        {bestScore > 0 && (
          <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 bg-black/35 backdrop-blur-md rounded-full border border-white/10 text-xs text-white/90">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Best Flight:</span>
            <span className="font-mono font-bold text-amber-300 tabular-nums">{bestScore}</span>
          </div>
        )}

        {/* Giant Play Button */}
        <div className="mt-6 flex flex-col items-center gap-3 w-full">
          <button
            onClick={onStartGame}
            className="w-48 py-3.5 px-6 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-slate-950 font-display font-bold text-xl tracking-wider shadow-[0_8px_24px_rgba(245,158,11,0.4)] border-2 border-amber-200 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            PLAY
          </button>
        </div>
      </div>

      {/* Bottom Navigation Buttons (Wardrobe, Achievements) */}
      <div className="w-full flex items-center justify-center gap-3 pointer-events-auto pb-2">
        <button
          onClick={onOpenWardrobe}
          className="flex-1 max-w-[150px] py-2.5 px-3 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/15 transition-all text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Skins & Hats</span>
        </button>

        <button
          onClick={onOpenAchievements}
          className="flex-1 max-w-[150px] py-2.5 px-3 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/15 transition-all text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md active:scale-95"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Badges</span>
        </button>
      </div>
    </div>
  );
};
