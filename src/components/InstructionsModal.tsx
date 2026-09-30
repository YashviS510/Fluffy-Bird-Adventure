import React from 'react';
import { X, HelpCircle, Gamepad2, Sparkles, Shield, Magnet, Feather } from 'lucide-react';

interface InstructionsModalProps {
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-bold text-xl text-white">How to Play</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 mt-3 pr-1 text-sm text-slate-300">
          {/* Controls */}
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-white/5 space-y-2">
            <div className="text-white font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-400">
              <Gamepad2 className="w-4 h-4" />
              Controls
            </div>
            <div className="text-xs space-y-1">
              <p>• <strong className="text-white">Mobile:</strong> Tap anywhere on the screen.</p>
              <p>• <strong className="text-white">Desktop:</strong> Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-white font-mono">Space</kbd>, <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-white font-mono">↑</kbd>, or Left Click.</p>
              <p>• Each tap gives 1 flap impulse. Holding does not continuous flap.</p>
            </div>
          </div>

          {/* Objectives */}
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-white/5 space-y-2">
            <div className="text-white font-bold text-xs uppercase tracking-wider text-amber-400">
              Flight Rules
            </div>
            <div className="text-xs space-y-1">
              <p>• Fly through the gaps between vertical pillars to score 1 point.</p>
              <p>• Avoid colliding with pillars, the ground, or the top sky boundary.</p>
              <p>• Difficulty gradually ramps up as your score increases.</p>
            </div>
          </div>

          {/* Power-ups & Items */}
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-white/5 space-y-2.5">
            <div className="text-white font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-400">
              <Sparkles className="w-4 h-4" />
              Items & Power-ups
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-base">🌰</span>
                <div>
                  <strong className="text-white">Golden Seeds:</strong> Collect in gaps to unlock new bird plumage, accessories, and worlds!
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-base">🛡️</span>
                <div>
                  <strong className="text-white">Fluff Shield:</strong> Grants a protective bubble that absorbs 1 collision safely.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-base">🧲</span>
                <div>
                  <strong className="text-white">Seed Magnet:</strong> Draws all nearby floating seeds directly into your beak.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-base">🪶</span>
                <div>
                  <strong className="text-white">Feather Float:</strong> Reduces gravity for gentle, effortless gliding.
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 font-display font-bold text-slate-950 text-sm tracking-wide transition-all shadow-md"
        >
          Got it, let's fly!
        </button>
      </div>
    </div>
  );
};
