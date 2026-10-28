/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Difficulty } from '../game/types';
import { DIFFICULTY_PRESETS } from '../game/rules';
import { Play, Sparkles, Trophy, BookOpen, Home, Zap } from 'lucide-react';

interface StageClearModalProps {
  isOpen: boolean;
  currentStage: number;
  totalStages: number;
  difficulty: Difficulty;
  stageName: string;
  nextStageName: string;
  stageTime: number;
  shardsFound: number;
  onNextStage: () => void;
  onGoTitle: () => void;
  onOpenDoc: () => void;
}

export const StageClearModal: React.FC<StageClearModalProps> = ({
  isOpen,
  currentStage,
  totalStages,
  difficulty,
  stageName,
  nextStageName,
  stageTime,
  shardsFound,
  onNextStage,
  onGoTitle,
  onOpenDoc,
}) => {
  if (!isOpen) return null;

  const diffConfig = DIFFICULTY_PRESETS[difficulty];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 select-none pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stage-clear-title"
    >
      <div className="w-full max-w-md bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-2xl p-6 text-slate-200 flex flex-col gap-5">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-cyan-950/90 border border-cyan-400 flex items-center justify-center text-cyan-300 mb-2 shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
            Fase {currentStage} de {totalStages} Concluída
          </span>
          <h2 id="stage-clear-title" className="text-xl font-bold tracking-wide text-white uppercase font-serif mt-0.5">
            {stageName}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sua essência atravessou o portal de transição celestial!
          </p>
        </div>

        {/* Stage Performance Cards */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Tempo da Fase</span>
            <span className="font-bold text-white text-sm tabular-nums mt-0.5 block">
              {Math.floor(stageTime)}s
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Fragmentos de Alma</span>
            <span className="font-bold text-cyan-300 text-sm tabular-nums mt-0.5 block">
              +{shardsFound}
            </span>
          </div>
        </div>

        {/* Next Stage Teaser */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Próximo Desafio:</span>
          <div className="font-bold text-white text-sm mt-0.5 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Fase {currentStage + 1}: {nextStageName}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {difficulty === 'hard_master' 
              ? 'Aviso: No Hard Master as fases seguintes possuem maior densidade de inimigos de elite e armadilhas!'
              : 'Sua vida foi parcialmente restaurada pela energia do portal.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onNextStage}
            data-start="true"
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-cyan-950"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Avançar para a Próxima Fase (Espaço / Enter)</span>
          </button>

          <button
            onClick={onOpenDoc}
            className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Ver Detalhes na Documentação</span>
          </button>

          <button
            onClick={onGoTitle}
            className="w-full py-2 rounded-xl bg-transparent hover:bg-slate-900 text-slate-400 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Voltar ao Menu Principal</span>
          </button>
        </div>

      </div>
    </div>
  );
};
