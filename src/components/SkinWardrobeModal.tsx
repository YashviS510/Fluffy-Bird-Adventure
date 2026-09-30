import React, { useState } from 'react';
import { X, Sparkles, Check, Lock, Feather } from 'lucide-react';
import {
  BirdSkinId,
  AccessoryId,
  WorldThemeId,
  PlayerStats,
} from '../types/game';
import { BIRD_SKINS, ACCESSORIES, WORLD_THEMES } from '../utils/storage';
import { sound } from '../utils/audio';

interface SkinWardrobeModalProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
  onClose: () => void;
}

export const SkinWardrobeModal: React.FC<SkinWardrobeModalProps> = ({
  stats,
  onUpdateStats,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'skins' | 'hats' | 'themes'>('skins');

  const handleSelectSkin = (skinId: BirdSkinId) => {
    sound.playClick();
    if (stats.unlockedSkins.includes(skinId)) {
      onUpdateStats({ selectedSkin: skinId });
    } else {
      const skin = BIRD_SKINS[skinId];
      if (stats.totalSeeds >= skin.cost) {
        sound.playSeed();
        onUpdateStats({
          totalSeeds: stats.totalSeeds - skin.cost,
          unlockedSkins: [...stats.unlockedSkins, skinId],
          selectedSkin: skinId,
        });
      }
    }
  };

  const handleSelectAccessory = (accId: AccessoryId) => {
    sound.playClick();
    if (stats.unlockedAccessories.includes(accId)) {
      onUpdateStats({ selectedAccessory: accId });
    } else {
      const acc = ACCESSORIES[accId];
      if (stats.totalSeeds >= acc.cost) {
        sound.playSeed();
        onUpdateStats({
          totalSeeds: stats.totalSeeds - acc.cost,
          unlockedAccessories: [...stats.unlockedAccessories, accId],
          selectedAccessory: accId,
        });
      }
    }
  };

  const handleSelectTheme = (themeId: WorldThemeId) => {
    sound.playClick();
    if (stats.unlockedThemes.includes(themeId)) {
      onUpdateStats({ selectedTheme: themeId });
    } else {
      const theme = WORLD_THEMES[themeId];
      if (stats.totalSeeds >= theme.cost) {
        sound.playSeed();
        onUpdateStats({
          totalSeeds: stats.totalSeeds - theme.cost,
          unlockedThemes: [...stats.unlockedThemes, themeId],
          selectedTheme: themeId,
        });
      }
    }
  };

  const currentSkin = BIRD_SKINS[stats.selectedSkin];
  const currentAccessory = ACCESSORIES[stats.selectedAccessory];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-bold text-xl text-white">Fluff Wardrobe</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-400/30 px-2.5 py-1 rounded-xl text-xs font-bold text-amber-300">
              <span>🌰</span>
              <span className="font-mono tabular-nums">{stats.totalSeeds}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Bird Preview Box */}
        <div className="w-full h-32 my-3 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-850 border border-white/10 flex items-center justify-center relative overflow-hidden">
          <div className="flex flex-col items-center justify-center animate-fluff-float">
            {/* Round Fluffy Bird Avatar */}
            <div className="relative">
              {/* Accessory Preview */}
              {currentAccessory.id === 'crown' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xl drop-shadow-md">👑</div>
              )}
              {currentAccessory.id === 'flower' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl drop-shadow-md">🌼</div>
              )}
              {currentAccessory.id === 'leaf_sprout' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xl drop-shadow-md">🌱</div>
              )}
              {currentAccessory.id === 'aviator' && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-lg drop-shadow-md">🥽</div>
              )}
              {currentAccessory.id === 'halo' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xl drop-shadow-md">😇</div>
              )}

              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30 relative"
                style={{ backgroundColor: currentSkin.primaryColor }}
              >
                {/* Belly */}
                <div
                  className="absolute bottom-1 right-2 w-8 h-8 rounded-full"
                  style={{ backgroundColor: currentSkin.bellyColor }}
                />
                {/* Blush */}
                <div
                  className="absolute bottom-4 right-1 w-3 h-2 rounded-full opacity-60"
                  style={{ backgroundColor: currentSkin.cheekColor }}
                />
                {/* Eye */}
                <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 relative">
                    <div className="w-1 h-1 rounded-full bg-white absolute top-0.5 right-0.5" />
                  </div>
                </div>
                {/* Beak */}
                <div className="absolute top-5 -right-2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-amber-500" />
                {/* Wing */}
                <div
                  className="absolute top-4 left-2 w-7 h-5 rounded-full rotate-[-15deg] shadow-sm"
                  style={{ backgroundColor: currentSkin.wingColor }}
                />
              </div>
            </div>
          </div>
          <div className="absolute bottom-2 text-xs text-white/70 font-medium">
            {currentSkin.name} {currentAccessory.id !== 'none' ? `· ${currentAccessory.name}` : ''}
          </div>
        </div>

        {/* Tab switcher (Segmented controls) */}
        <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-xl mb-3 border border-white/5">
          <button
            onClick={() => setActiveTab('skins')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'skins' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Plumage
          </button>
          <button
            onClick={() => setActiveTab('hats')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'hats' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Accessories
          </button>
          <button
            onClick={() => setActiveTab('themes')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'themes' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Worlds
          </button>
        </div>

        {/* Item List scrollable */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px]">
          {activeTab === 'skins' &&
            Object.values(BIRD_SKINS).map(item => {
              const isUnlocked = stats.unlockedSkins.includes(item.id);
              const isSelected = stats.selectedSkin === item.id;
              const canAfford = stats.totalSeeds >= item.cost;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectSkin(item.id)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400/10 border-amber-400'
                      : 'bg-slate-800/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center shadow-md relative"
                      style={{ backgroundColor: item.primaryColor }}
                    >
                      <div
                        className="w-4 h-4 rounded-full absolute bottom-1 right-1"
                        style={{ backgroundColor: item.wingColor }}
                      />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        {item.name}
                        {isSelected && <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 rounded-full font-bold">EQUIPPED</span>}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1">{item.description}</div>
                    </div>
                  </div>

                  <div>
                    {isUnlocked ? (
                      <span className="p-1.5 rounded-lg text-amber-400 bg-amber-400/10 block">
                        <Check className="w-4 h-4" />
                      </span>
                    ) : (
                      <div
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                          canAfford
                            ? 'bg-amber-500 text-slate-950 border-amber-300'
                            : 'bg-slate-700 text-slate-400 border-white/10'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>{item.cost} 🌰</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          {activeTab === 'hats' &&
            Object.values(ACCESSORIES).map(item => {
              const isUnlocked = stats.unlockedAccessories.includes(item.id);
              const isSelected = stats.selectedAccessory === item.id;
              const canAfford = stats.totalSeeds >= item.cost;

              const emoji =
                item.id === 'crown'
                  ? '👑'
                  : item.id === 'flower'
                  ? '🌼'
                  : item.id === 'leaf_sprout'
                  ? '🌱'
                  : item.id === 'aviator'
                  ? '🥽'
                  : item.id === 'halo'
                  ? '😇'
                  : '✨';

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectAccessory(item.id)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400/10 border-amber-400'
                      : 'bg-slate-800/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-700/80 border border-white/10 flex items-center justify-center text-xl shadow-md">
                      {emoji}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        {item.name}
                        {isSelected && <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 rounded-full font-bold">EQUIPPED</span>}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1">{item.description}</div>
                    </div>
                  </div>

                  <div>
                    {isUnlocked ? (
                      <span className="p-1.5 rounded-lg text-amber-400 bg-amber-400/10 block">
                        <Check className="w-4 h-4" />
                      </span>
                    ) : (
                      <div
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                          canAfford
                            ? 'bg-amber-500 text-slate-950 border-amber-300'
                            : 'bg-slate-700 text-slate-400 border-white/10'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>{item.cost} 🌰</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          {activeTab === 'themes' &&
            Object.values(WORLD_THEMES).map(item => {
              const isUnlocked = stats.unlockedThemes.includes(item.id);
              const isSelected = stats.selectedTheme === item.id;
              const canAfford = stats.totalSeeds >= item.cost;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectTheme(item.id)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400/10 border-amber-400'
                      : 'bg-slate-800/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl border border-white/10 shadow-md"
                      style={{ background: `linear-gradient(135deg, ${item.skyTop}, ${item.skyBottom})` }}
                    />
                    <div className="text-left">
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        {item.name}
                        {isSelected && <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 rounded-full font-bold">ACTIVE</span>}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1">{item.description}</div>
                    </div>
                  </div>

                  <div>
                    {isUnlocked ? (
                      <span className="p-1.5 rounded-lg text-amber-400 bg-amber-400/10 block">
                        <Check className="w-4 h-4" />
                      </span>
                    ) : (
                      <div
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                          canAfford
                            ? 'bg-amber-500 text-slate-950 border-amber-300'
                            : 'bg-slate-700 text-slate-400 border-white/10'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>{item.cost} 🌰</span>
                      </div>
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
