/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Difficulty } from '../game/types';
import { DIFFICULTY_PRESETS } from '../game/rules';
import { BookOpen, Play, ShieldAlert, Sparkles, Flame, Check } from 'lucide-react';

interface TitleScreenProps {
  currentDifficulty: Difficulty;
  onSelectDifficulty: (diff: Difficulty) => void;
  onStartGame: (startingFloor?: number) => void;
  onOpenDoc: () => void;
  onOpenAchievements: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  currentDifficulty,
  onSelectDifficulty,
  onStartGame,
  onOpenDoc,
  onOpenAchievements,
}) => {
  const difficulties: Difficulty[] = ['facil', 'medio', 'dificil', 'hard_master'];
  const maxFloor = DIFFICULTY_PRESETS[currentDifficulty].totalStages;
  const [selectedFloor, setSelectedFloor] = React.useState<number>(1);

  // Keep floor within max range when difficulty changes
  React.useEffect(() => {
    if (selectedFloor > maxFloor) {
      setSelectedFloor(1);
    }
  }, [maxFloor, selectedFloor]);

  // Milestone checkpoints proporcionalmente calculados até maxFloor
  const checkpoints = React.useMemo(() => {
    if (maxFloor <= 50) return [1, 10, 20, 30, 40, 50];
    if (maxFloor <= 100) return [1, 20, 40, 60, 80, 100];
    if (maxFloor <= 150) return [1, 25, 50, 75, 100, 125, 150];
    return [1, 25, 50, 75, 100, 125, 150, 175, 200];
  }, [maxFloor]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-between items-center p-4 sm:p-8 select-none bg-gradient-to-b from-slate-950/70 via-slate-950/85 to-slate-950 overflow-y-auto">
      
      {/* Top Bar: Engine Tribute & Docs */}
      <div className="w-full max-w-5xl flex justify-between items-center text-xs">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300">
          <Flame className="w-3.5 h-3.5 text-cyan-400" />
          <span>Inspirado no <strong>Godot Engine 3.6.3</strong> & Chaomoon</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAchievements}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-semibold transition-all shadow-lg hover:shadow-amber-950/50"
          >
            <span>🏆</span>
            <span>Troféus & Save</span>
          </button>

          <button
            onClick={onOpenDoc}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-semibold transition-all shadow-lg hover:shadow-cyan-950/50"
          >
            <BookOpen className="w-4 h-4" />
            <span>Manual & Docs</span>
          </button>
        </div>
      </div>

      {/* Center Lockup: Bespoke SVG Title & Difficulty Selector */}
      <div className="w-full max-w-3xl flex flex-col items-center text-center my-auto py-2">
        
        {/* Bespoke Inline SVG Title Emblem */}
        <div className="mb-4 relative">
          <svg className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-2 text-cyan-400 drop-shadow-[0_0_25px_rgba(56,189,248,0.4)]" viewBox="0 0 100 100" fill="none">
            {/* Outer Runic Crest */}
            <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
            <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            {/* Diamond Core */}
            <polygon points="50,14 84,50 50,86 16,50" stroke="currentColor" strokeWidth="2.5" fill="rgba(6, 182, 212, 0.15)" />
            {/* Soul Flame Glyph */}
            <path d="M50,28 C56,38 66,46 62,60 C58,72 42,72 38,60 C34,48 44,40 50,28 Z" fill="url(#flameGrad)" />
            <circle cx="50" cy="54" r="5" fill="#ffffff" />
            <defs>
              <linearGradient id="flameGrad" x1="50" y1="28" x2="50" y2="72" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="1" stopColor="#818cf8" />
              </linearGradient>
            </defs>
          </svg>

          <h1 className="text-3xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 font-serif drop-shadow-md uppercase">
            Remanescente da Alma
          </h1>
          <p className="text-xs sm:text-sm text-cyan-400 font-mono tracking-widest mt-1 uppercase">
            Soul’s Remnant · Um Jogo da Chaomoon
          </p>
        </div>

        {/* Difficulty Selection Chips */}
        <div className="w-full max-w-2xl bg-slate-900/60 p-4 rounded-2xl border border-slate-800 mb-4 backdrop-none">
          <div className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            Selecione o Nível de Dificuldade
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {difficulties.map((diff) => {
              const conf = DIFFICULTY_PRESETS[diff];
              const isSelected = currentDifficulty === diff;
              return (
                <button
                  key={diff}
                  onClick={() => onSelectDifficulty(diff)}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-cyan-400 bg-slate-800/90 shadow-lg'
                      : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-900/70 hover:border-slate-700'
                  }`}
                  style={{
                    borderColor: isSelected ? conf.accentColor : undefined,
                    boxShadow: isSelected ? `0 0 16px ${conf.accentColor}33` : undefined,
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">{conf.name}</span>
                      {isSelected && (
                        <Check 
                          className="w-4 h-4 shrink-0" 
                          style={{ color: conf.accentColor }} 
                        />
                      )}
                    </div>
                    <span 
                      className="text-[10px] font-mono block font-medium"
                      style={{ color: conf.accentColor }}
                    >
                      {conf.badge}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
                    <div className="font-bold mb-0.5 flex items-center justify-between" style={{ color: conf.accentColor }}>
                      <span>{conf.totalStages} Fases</span>
                      {conf.id === 'hard_master' && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                          ★ MÁXIMO
                        </span>
                      )}
                    </div>
                    <div>Dano: <strong className="text-white">{Math.round(conf.enemyDmgMultiplier * 100)}%</strong></div>
                    <div>HP: <strong className="text-white">{conf.playerMaxHp}</strong></div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Difficulty Details */}
          <div className="mt-2 text-xs text-slate-400 italic">
            "{DIFFICULTY_PRESETS[currentDifficulty].description}"
          </div>

          {/* Elevador Astral / Checkpoint Floor Selector */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col items-center">
            <div className="flex items-center justify-between w-full text-xs text-slate-300 font-semibold mb-2">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Elevador Astral (Seletor de Andar)
              </span>
              <span className="font-mono text-cyan-400">
                Iniciar no Andar: <strong>{selectedFloor} / {maxFloor}</strong>
              </span>
            </div>

            {/* Quick Milestone Buttons */}
            <div className="flex flex-wrap justify-center gap-1.5 w-full mb-2.5">
              {checkpoints.map((cp) => (
                <button
                  key={cp}
                  type="button"
                  onClick={() => setSelectedFloor(cp)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                    selectedFloor === cp
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm font-bold'
                      : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {cp === 1 ? 'Andar 1 (Início)' : cp === maxFloor ? `Andar ${cp} (Chefe Final)` : `Andar ${cp}`}
                </button>
              ))}
            </div>

            {/* Range slider for granular selection */}
            <div className="w-full flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-500">1</span>
              <input
                type="range"
                min={1}
                max={maxFloor}
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] font-mono text-cyan-400">{maxFloor}</span>
            </div>
          </div>
        </div>

        {/* Primary Start CTA */}
        <button
          onClick={() => onStartGame(selectedFloor)}
          data-start="true"
          className="group relative px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 transition-all shadow-xl shadow-cyan-950 flex items-center gap-2.5 active:scale-95"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>Iniciar no Andar {selectedFloor} (Espaço / Enter)</span>
        </button>

      </div>

      {/* Flat Control Hint Line in Safe Margin */}
      <div className="text-xs text-slate-400 font-mono tracking-wide text-center">
        WASD Move · Espaço Pula · J Ataque · K Magia · L Esquiva · Esc Pausa · H Manual
      </div>

    </div>
  );
};
