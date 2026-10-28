/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RunSnapshot } from '../game/types';
import { DIFFICULTY_PRESETS } from '../game/rules';
import { RotateCcw, Home, Trophy, BookOpen, Sparkles, Award } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  snapshot: RunSnapshot | null;
  onRestart: () => void;
  onGoTitle: () => void;
  onOpenDoc: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  snapshot,
  onRestart,
  onGoTitle,
  onOpenDoc,
}) => {
  if (!isOpen || !snapshot) return null;

  const diffConfig = DIFFICULTY_PRESETS[snapshot.difficulty];
  const isMasterCleared = snapshot.difficulty === 'hard_master';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 select-none pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
    >
      <div className="w-full max-w-lg bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-2xl p-6 text-slate-200 flex flex-col gap-5">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-cyan-950/90 border border-cyan-400 flex items-center justify-center text-cyan-300 mb-2 shadow-lg shadow-cyan-500/20">
            <Trophy className="w-7 h-7" />
          </div>
          <h2 id="victory-title" className="text-2xl sm:text-3xl font-black tracking-widest text-white uppercase font-serif">
            A Alma Conquistou o Vazio!
          </h2>
          <p className="text-xs text-cyan-300 mt-1 font-mono">
            O Remanescente Primordial foi purificado com maestria
          </p>
        </div>

        {/* Rank & Score Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Classificação Final</span>
            <div className="text-3xl font-black text-amber-400 font-serif tracking-wider">
              RANK {snapshot.rank}
            </div>
            <span className="text-xs text-slate-300 font-medium">
              {diffConfig.name} [{diffConfig.badge}]
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Pontuação Total</span>
            <div className="text-2xl font-black text-cyan-300 font-mono tabular-nums">
              {snapshot.finalScore.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Multiplicador: {diffConfig.scoreMultiplier}x
            </span>
          </div>
        </div>

        {/* Hard Master Special Trophy */}
        {isMasterCleared ? (
          <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-950/30 flex items-center gap-3">
            <Award className="w-8 h-8 text-rose-400 shrink-0" />
            <div className="text-xs">
              <div className="font-bold text-rose-300">Conquista Suprema: Mestre da Alma Implacável ({snapshot.totalStages} FASES CONCLUÍDAS - MÁXIMO ABSOLUTO!)</div>
              <p className="text-slate-300 text-[11px]">
                Você superou a monumental maratona de <strong>{snapshot.totalStages} andares ininterruptos</strong> no modo Hard Master, atravessando todos os 10 biomas celestiais e purificando o Trono Primordial!
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-center text-xs font-mono text-cyan-300">
            ★ Todas as {snapshot.totalStages} Fases Concluídas com Sucesso! ★
          </div>
        )}

        {/* Detailed Run Statistics */}
        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
            <span className="text-slate-400 text-[10px] block">Tempo de Conclusão</span>
            <span className="font-bold text-white text-sm tabular-nums">
              {Math.floor(snapshot.timeSeconds)}s
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
            <span className="text-slate-400 text-[10px] block">Dano Recebido</span>
            <span className="font-bold text-rose-400 text-sm tabular-nums">
              {snapshot.damageTaken}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
            <span className="text-slate-400 text-[10px] block">Maior Combo</span>
            <span className="font-bold text-amber-300 text-sm tabular-nums">
              x{snapshot.maxCombo}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
            <span className="text-slate-400 text-[10px] block">Fragmentos</span>
            <span className="font-bold text-cyan-300 text-sm tabular-nums">
              {snapshot.shardsCollected} / {snapshot.totalShards}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
            <span className="text-slate-400 text-[10px] block">Inimigos Vencidos</span>
            <span className="font-bold text-white text-sm tabular-nums">
              {snapshot.enemiesDefeated}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
            <span className="text-slate-400 text-[10px] block">Parries Realizados</span>
            <span className="font-bold text-emerald-400 text-sm tabular-nums">
              {snapshot.parriesExecuted}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={onRestart}
            data-start="true"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-cyan-950"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Jogar Novamente (Espaço / Enter)</span>
          </button>

          <button
            onClick={onOpenDoc}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Ver Documentação & Tributo Godot</span>
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
