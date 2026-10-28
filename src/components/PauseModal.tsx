/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Difficulty } from '../game/types';
import { DIFFICULTY_PRESETS } from '../game/rules';
import { Play, RotateCcw, Home, BookOpen, ShieldAlert } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onGoTitle: () => void;
  onOpenDoc: () => void;
  onOpenAchievements: () => void;
  currentDifficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onGoTitle,
  onOpenDoc,
  onOpenAchievements,
  currentDifficulty,
  onChangeDifficulty,
}) => {
  if (!isOpen) return null;

  const difficulties: Difficulty[] = ['facil', 'medio', 'dificil', 'hard_master'];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 select-none pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
    >
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200 flex flex-col gap-5">
        
        {/* Title */}
        <div className="text-center">
          <h2 id="pause-title" className="text-xl font-bold tracking-wider text-white uppercase font-serif">
            Jogo Pausado
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Respire fundo e ajuste sua estratégia
          </p>
        </div>

        {/* Difficulty Switcher */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>Nível de Dificuldade</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {difficulties.map((diff) => {
              const conf = DIFFICULTY_PRESETS[diff];
              const isSelected = currentDifficulty === diff;
              return (
                <button
                  key={diff}
                  onClick={() => onChangeDifficulty(diff)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'border-cyan-400 bg-slate-800 text-white shadow-sm'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                  }`}
                  style={{
                    borderColor: isSelected ? conf.accentColor : undefined,
                    color: isSelected ? conf.accentColor : undefined,
                  }}
                >
                  {conf.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            data-start="true"
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-cyan-950"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Continuar (Esc)</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar Fase (R)</span>
          </button>

          <button
            onClick={onOpenAchievements}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <span>🏆</span>
            <span>Ver Conquistas & Backup</span>
          </button>

          <button
            onClick={onOpenDoc}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Abrir Documentação (H)</span>
          </button>

          <button
            onClick={onGoTitle}
            className="w-full py-2.5 rounded-xl bg-transparent hover:bg-slate-900 text-slate-400 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Voltar ao Menu Principal</span>
          </button>
        </div>

      </div>
    </div>
  );
};
