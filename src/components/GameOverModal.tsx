/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RunSnapshot } from '../game/types';
import { DIFFICULTY_PRESETS } from '../game/rules';
import { RotateCcw, Home, Skull, BookOpen, ShieldAlert } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  snapshot: RunSnapshot | null;
  onRestart: () => void;
  onGoTitle: () => void;
  onOpenDoc: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  snapshot,
  onRestart,
  onGoTitle,
  onOpenDoc,
}) => {
  if (!isOpen || !snapshot) return null;

  const diffConfig = DIFFICULTY_PRESETS[snapshot.difficulty];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 select-none pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameover-title"
    >
      <div className="w-full max-w-md bg-slate-950 border border-rose-900/60 rounded-2xl shadow-2xl p-6 text-slate-200 flex flex-col gap-5">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-500 mb-2">
            <Skull className="w-6 h-6" />
          </div>
          <h2 id="gameover-title" className="text-2xl font-black tracking-widest text-white uppercase font-serif">
            A Alma Desvaneceu
          </h2>
          <p className="text-xs text-rose-400 mt-1 font-mono">
            Sua essência foi absorvida pelas sombras do vazio
          </p>
        </div>

        {/* Run Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Dificuldade & Fase</span>
            <span className="font-bold text-white flex items-center justify-between mt-0.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: diffConfig.accentColor }} />
                {diffConfig.name}
              </span>
              <span className="text-cyan-300 text-[11px]">
                Fase {snapshot.stageReached}/{snapshot.totalStages}
              </span>
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Tempo Sobrevivido</span>
            <span className="font-bold text-white mt-0.5 block tabular-nums">
              {Math.floor(snapshot.timeSeconds)}s
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Inimigos Vencidos</span>
            <span className="font-bold text-white mt-0.5 block tabular-nums">
              {snapshot.enemiesDefeated}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Fragmentos Coletados</span>
            <span className="font-bold text-cyan-300 mt-0.5 block tabular-nums">
              {snapshot.shardsCollected} / {snapshot.totalShards}
            </span>
          </div>
        </div>

        {/* Tip for this difficulty */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
          <div className="font-semibold text-cyan-300 mb-0.5 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Dica de Sobrevivência
          </div>
          {snapshot.difficulty === 'hard_master'
            ? 'No Hard Master, evite combate frontal desnecessário e use o Parry (Ataque no impacto) para anular as flechas e recuperar Alma.'
            : 'Lembre-se de utilizar a esquiva (L) que concede invulnerabilidade temporária (iframes) para passar através dos inimigos.'}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onRestart}
            data-start="true"
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-950"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tentar Novamente (Espaço / Enter)</span>
          </button>

          <button
            onClick={onOpenDoc}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Ver Dicas na Documentação</span>
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
