/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  PlayerStats,
  ActivePowerUp,
} from './types/game';
import {
  loadPlayerStats,
  savePlayerStats,
  BIRD_SKINS,
  ACCESSORIES,
  WORLD_THEMES,
  ACHIEVEMENTS_LIST,
} from './utils/storage';
import { sound } from './utils/audio';
import { FluffyBirdCanvas } from './components/FluffyBirdCanvas';
import { HUD } from './components/HUD';
import { TitleScreen } from './components/TitleScreen';
import { GameOverModal } from './components/GameOverModal';
import { SkinWardrobeModal } from './components/SkinWardrobeModal';
import { AchievementsModal } from './components/AchievementsModal';
import { InstructionsModal } from './components/InstructionsModal';
import { Sparkles, Trophy, Volume2, VolumeX, HelpCircle, Feather } from 'lucide-react';

export default function App() {
  const [stats, setStats] = useState<PlayerStats>(loadPlayerStats);
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [seedsThisRun, setSeedsThisRun] = useState<number>(0);
  const [isNewBest, setIsNewBest] = useState<boolean>(false);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);

  // Modals
  const [showWardrobe, setShowWardrobe] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio setup sync
  useEffect(() => {
    sound.setSoundEnabled(stats.soundEnabled);
    sound.setMusicEnabled(stats.musicEnabled);
  }, [stats.soundEnabled, stats.musicEnabled]);

  // Persist stats on changes
  const updateStats = useCallback((patch: Partial<PlayerStats>) => {
    setStats(prev => {
      const next = { ...prev, ...patch };
      savePlayerStats(next);
      return next;
    });
  }, []);

  // Show reward toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Check and award achievements
  const checkAchievement = useCallback((achId: string) => {
    setStats(prev => {
      if (prev.achievements[achId]) return prev; // already unlocked
      const ach = ACHIEVEMENTS_LIST.find(a => a.id === achId);
      if (!ach) return prev;

      sound.playSeed();
      showToast(`🏆 Badge Unlocked: ${ach.title}! (+${ach.rewardSeeds} Seeds)`);

      const next = {
        ...prev,
        totalSeeds: prev.totalSeeds + ach.rewardSeeds,
        achievements: { ...prev.achievements, [achId]: true },
      };
      savePlayerStats(next);
      return next;
    });
  }, [showToast]);

  // Power-up countdown timer tick
  useEffect(() => {
    if (gameState !== 'PLAYING' || activePowerUps.length === 0) return;

    const interval = setInterval(() => {
      setActivePowerUps(prev => {
        const next: ActivePowerUp[] = [];
        prev.forEach(p => {
          const remaining = p.remainingTime - 0.2;
          if (remaining > 0) {
            next.push({ ...p, remainingTime: remaining });
          }
        });
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [gameState, activePowerUps.length]);

  // Start new game run
  const handleStartGame = useCallback(() => {
    sound.playClick();
    setCurrentScore(0);
    setSeedsThisRun(0);
    setIsNewBest(false);
    setActivePowerUps([]);
    setGameState('PLAYING');
    updateStats({ totalGames: stats.totalGames + 1 });
  }, [stats.totalGames, updateStats]);

  // Handle score increment
  const handleScoreIncrement = useCallback(() => {
    setCurrentScore(prev => {
      const newScore = prev + 1;

      // Check achievements
      if (newScore >= 5) checkAchievement('score_5');
      if (newScore >= 15) checkAchievement('score_15');
      if (newScore >= 30) checkAchievement('score_30');

      return newScore;
    });
  }, [checkAchievement]);

  // Handle seed collection
  const handleSeedCollected = useCallback((type: 'seed' | 'golden_berry') => {
    const amount = type === 'golden_berry' ? 3 : 1;
    setSeedsThisRun(prev => {
      const runTotal = prev + amount;
      if (runTotal >= 10) checkAchievement('seeds_10');
      return runTotal;
    });

    setStats(prev => {
      const total = prev.totalSeeds + amount;
      const totalCollected = prev.totalBerriesCollected + amount;
      if (total >= 50) checkAchievement('seeds_50_total');

      const next = {
        ...prev,
        totalSeeds: total,
        totalBerriesCollected: totalCollected,
      };
      savePlayerStats(next);
      return next;
    });
  }, [checkAchievement]);

  // Handle power-up collection
  const handlePowerUpCollected = useCallback((type: ActivePowerUp['type']) => {
    const duration = type === 'shield' ? 15 : type === 'magnet' ? 8 : 6;
    setActivePowerUps(prev => {
      const filtered = prev.filter(p => p.type !== type);
      return [...filtered, { type, remainingTime: duration, duration }];
    });
  }, []);

  // Handle shield saved
  const handleShieldSaved = useCallback(() => {
    setActivePowerUps(prev => prev.filter(p => p.type !== 'shield'));
    checkAchievement('shield_save');
  }, [checkAchievement]);

  // First flap ever
  const handleFirstFlap = useCallback(() => {
    checkAchievement('first_flap');
    updateStats({ totalFlaps: stats.totalFlaps + 1 });
  }, [checkAchievement, stats.totalFlaps, updateStats]);

  // Game over
  const handleGameOver = useCallback((finalScore: number) => {
    setGameState('GAME_OVER');
    const isBest = finalScore > stats.highScore;
    if (isBest) {
      setIsNewBest(true);
      updateStats({ highScore: finalScore });
    }
  }, [stats.highScore, updateStats]);

  // Pause toggle
  const handleTogglePause = useCallback(() => {
    sound.playClick();
    setGameState(prev => (prev === 'PLAYING' ? 'PAUSED' : prev === 'PAUSED' ? 'PLAYING' : prev));
  }, []);

  // Sound toggle
  const handleToggleSound = useCallback(() => {
    const next = !stats.soundEnabled;
    sound.setSoundEnabled(next);
    updateStats({ soundEnabled: next });
    if (next) sound.playClick();
  }, [stats.soundEnabled, updateStats]);

  // Music toggle
  const handleToggleMusic = useCallback(() => {
    const next = !stats.musicEnabled;
    sound.setMusicEnabled(next);
    updateStats({ musicEnabled: next });
    if (next) sound.playClick();
  }, [stats.musicEnabled, updateStats]);

  // Keyboard shortcut listener for 'P', 'M'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'KeyP') {
        if (gameState === 'PLAYING' || gameState === 'PAUSED') {
          handleTogglePause();
        }
      } else if (e.code === 'KeyM') {
        handleToggleSound();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleTogglePause, handleToggleSound]);

  // Current selections
  const currentSkin = BIRD_SKINS[stats.selectedSkin] || BIRD_SKINS.buttercup;
  const currentAccessory = ACCESSORIES[stats.selectedAccessory] || ACCESSORIES.none;
  const currentTheme = WORLD_THEMES[stats.selectedTheme] || WORLD_THEMES.morning_meadow;

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-between select-none overflow-hidden relative">
      {/* Background ambient gradient glow */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none transition-colors duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${currentTheme.skyTop} 0%, rgba(15, 23, 42, 0.95) 75%)`,
        }}
      />

      {/* TOP BAR CONTRACT: Zone 1 (Wordmark) — Zone 2 (Clean Nav) — Zone 3 (Actions) */}
      <header className="w-full max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between z-30 border-b border-white/10 relative">
        {/* Zone 1: Single element wordmark */}
        <button
          onClick={() => {
            sound.playClick();
            setGameState('MENU');
          }}
          className="font-display font-bold text-xl sm:text-2xl text-white tracking-wide hover:text-amber-300 transition-colors flex items-center gap-2"
        >
          <span className="text-amber-400">🐤</span>
          <span>Fluffy Bird</span>
        </button>

        {/* Zone 2: Clean 4 nav links with hover states */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => {
              sound.playClick();
              if (gameState !== 'PLAYING') handleStartGame();
            }}
            className="hover:text-white transition-colors"
          >
            Play Flight
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setShowWardrobe(true);
            }}
            className="hover:text-white transition-colors"
          >
            Wardrobe
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setShowAchievements(true);
            }}
            className="hover:text-white transition-colors"
          >
            Badges
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setShowInstructions(true);
            }}
            className="hover:text-white transition-colors"
          >
            Guide
          </button>
        </nav>

        {/* Zone 3: Quick Action */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-xl text-xs font-semibold text-white border border-white/10">
            <span className="text-amber-400">🌰</span>
            <span className="font-mono tabular-nums">{stats.totalSeeds}</span>
          </div>

          <button
            onClick={handleToggleSound}
            title={stats.soundEnabled ? 'Mute' : 'Unmute'}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white transition-colors border border-white/10"
          >
            {stats.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN GAME CONTAINER: Responsive arcade viewport */}
      <main className="w-full flex-1 flex items-center justify-center p-2 sm:p-4 z-10 relative">
        <div className="relative w-full max-w-[480px] h-[calc(100vh-120px)] max-h-[780px] min-h-[580px] flex items-center justify-center">
          {/* Canvas Viewport */}
          <FluffyBirdCanvas
            gameState={gameState}
            score={currentScore}
            bestScore={stats.highScore}
            skin={currentSkin}
            accessory={currentAccessory}
            theme={currentTheme}
            activePowerUps={activePowerUps}
            onScoreIncrement={handleScoreIncrement}
            onSeedCollected={handleSeedCollected}
            onPowerUpCollected={handlePowerUpCollected}
            onShieldSaved={handleShieldSaved}
            onGameOver={handleGameOver}
            onFirstFlap={handleFirstFlap}
          />

          {/* IN-GAME HUD (When Playing or Paused) */}
          {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
            <HUD
              score={currentScore}
              bestScore={stats.highScore}
              seeds={stats.totalSeeds}
              isPaused={gameState === 'PAUSED'}
              soundEnabled={stats.soundEnabled}
              musicEnabled={stats.musicEnabled}
              activePowerUps={activePowerUps}
              onTogglePause={handleTogglePause}
              onToggleSound={handleToggleSound}
              onToggleMusic={handleToggleMusic}
            />
          )}

          {/* PAUSED OVERLAY */}
          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-center animate-in fade-in">
              <h2 className="font-display font-bold text-4xl text-white drop-shadow-md">
                PAUSED
              </h2>
              <p className="text-sm text-slate-300 mt-1">Take a breath, fluffy flyer!</p>
              <button
                onClick={handleTogglePause}
                className="mt-6 py-3 px-8 rounded-2xl bg-amber-400 hover:bg-amber-300 font-display font-bold text-slate-950 text-lg shadow-lg border border-amber-200 transition-all active:scale-95"
              >
                Resume Flight
              </button>
            </div>
          )}

          {/* TITLE MENU SCREEN */}
          {gameState === 'MENU' && (
            <TitleScreen
              bestScore={stats.highScore}
              totalSeeds={stats.totalSeeds}
              skin={currentSkin}
              accessory={currentAccessory}
              theme={currentTheme}
              soundEnabled={stats.soundEnabled}
              musicEnabled={stats.musicEnabled}
              onStartGame={handleStartGame}
              onOpenWardrobe={() => setShowWardrobe(true)}
              onOpenAchievements={() => setShowAchievements(true)}
              onOpenInstructions={() => setShowInstructions(true)}
              onToggleSound={handleToggleSound}
              onToggleMusic={handleToggleMusic}
            />
          )}

          {/* GAME OVER SCREEN */}
          {gameState === 'GAME_OVER' && (
            <GameOverModal
              score={currentScore}
              bestScore={stats.highScore}
              isNewBest={isNewBest}
              seedsCollectedThisRun={seedsThisRun}
              onPlayAgain={handleStartGame}
              onGoHome={() => setGameState('MENU')}
            />
          )}
        </div>
      </main>

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900/95 border-2 border-amber-400 text-white font-medium text-xs rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in slide-in-from-bottom duration-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MODALS */}
      {showWardrobe && (
        <SkinWardrobeModal
          stats={stats}
          onUpdateStats={updateStats}
          onClose={() => setShowWardrobe(false)}
        />
      )}

      {showAchievements && (
        <AchievementsModal
          stats={stats}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {showInstructions && (
        <InstructionsModal onClose={() => setShowInstructions(false)} />
      )}

      {/* FOOTER: Minimal copyright & controls hint */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-2.5 flex items-center justify-between text-[11px] text-slate-400 z-10 border-t border-white/5">
        <div>
          <span>Fluffy Bird</span> · <span>Tap / Space to Flap</span> · <span>P to Pause</span>
        </div>
        <div>
          Best Flight: <span className="font-mono font-bold text-amber-400 tabular-nums">{stats.highScore}</span>
        </div>
      </footer>
    </div>
  );
}
