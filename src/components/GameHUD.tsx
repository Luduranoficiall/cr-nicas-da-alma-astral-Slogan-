/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlayerStats, Difficulty } from '../game/types';
import { DIFFICULTY_PRESETS } from '../game/rules';
import { Volume2, VolumeX, Pause, BookOpen, RotateCcw, Zap } from 'lucide-react';

interface GameHUDProps {
  stats: PlayerStats;
  difficulty: Difficulty;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenDoc: () => void;
  onOpenAchievements: () => void;
  onRestart: () => void;
  boss: { active: boolean; hp: number; maxHp: number; phase: number; name: string } | null;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  difficulty,
  isMuted,
  onToggleMute,
  onPause,
  onOpenDoc,
  onOpenAchievements,
  onRestart,
  boss,
}) => {
  const diffConfig = DIFFICULTY_PRESETS[difficulty];

  // Discrete Vitality Sockets / Heart Pips
  const heartSockets = Array.from({ length: stats.maxHp }, (_, i) => {
    const isFull = i < stats.hp;
    return (
      <div
        key={i}
        className={`w-5 h-5 rounded-sm flex items-center justify-center transition-all ${
          isFull
            ? 'bg-rose-500 shadow-md shadow-rose-500/40 border border-rose-300'
            : 'bg-slate-900/80 border border-slate-700/80'
        }`}
        title={`Coração ${i + 1}`}
      >
        {isFull ? (
          <span className="text-[10px] text-white select-none">♥</span>
        ) : (
          <span className="text-[9px] text-slate-600 select-none">✕</span>
        )}
      </div>
    );
  });

  const soulPct = Math.min(100, Math.max(0, (stats.soul / stats.maxSoul) * 100));

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-30 flex flex-col justify-between p-4 sm:p-6">
      
      {/* Top Perimeter Cluster */}
      <div className="flex justify-between items-start">
        
        {/* Top-Left: Player Vitality & Soul Cluster */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 pointer-events-auto">
          {/* Header Row: Difficulty Badge & Stage Progress & Shards */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <span 
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: diffConfig.accentColor }}
              />
              <span className="text-white uppercase tracking-wider text-[11px]">
                {diffConfig.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                [{diffConfig.badge}]
              </span>
            </div>

            {/* Stage Progress Badge */}
            <div className="px-2 py-0.5 rounded bg-slate-900 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-[10px]">
              FASE <span className="text-white">{stats.currentStage}</span> / {stats.totalStages}
            </div>

            {/* Shard Count */}
            <div className="flex items-center gap-1 text-cyan-300 font-mono font-bold text-xs">
              <span className="text-[11px]">◆</span>
              <span className="tabular-nums">{stats.shards}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400 tabular-nums">{stats.maxShards}</span>
            </div>
          </div>

          {/* Health Pips */}
          <div className="flex items-center gap-1.5">
            {heartSockets}
          </div>

          {/* Soul / Mana Energy Bar */}
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between text-[10px] font-mono font-semibold text-slate-400">
              <span className="flex items-center gap-1 text-cyan-400">
                <Zap className="w-2.5 h-2.5" /> ALMA
              </span>
              <span className="tabular-nums text-cyan-300">{stats.soul} / {stats.maxSoul}</span>
            </div>
            <div className="w-44 h-2 rounded bg-slate-900 border border-slate-700/60 overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-cyan-600 to-sky-400 transition-all duration-150"
                style={{ width: `${soulPct}%` }}
              />
            </div>
          </div>

          {/* Combo Multiplier Alert (when > 1) */}
          {stats.combo > 1 && (
            <div className="flex items-center gap-1 text-amber-400 font-mono text-xs font-bold animate-pulse">
              <span>COMBO x{stats.combo}!</span>
            </div>
          )}
        </div>

        {/* Top-Right: Quick Control Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Achievements Trigger */}
          <button
            onClick={onOpenAchievements}
            aria-label="Abrir Conquistas e Troféus"
            title="Conquistas & Backup [Troféus]"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors shadow-lg"
          >
            <span>🏆</span>
            <span className="hidden sm:inline">Troféus</span>
          </button>

          {/* Documentation Trigger */}
          <button
            onClick={onOpenDoc}
            aria-label="Abrir Documentação (H)"
            title="Documentação e Manual [H / Tab]"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-colors shadow-lg"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Manual [H]</span>
          </button>

          {/* Mute Audio */}
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Desmutar Som (M)' : 'Mutar Som (M)'}
            title="Mutar/Desmutar Som [M]"
            className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs transition-colors shadow-lg"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Restart */}
          <button
            onClick={onRestart}
            aria-label="Reiniciar Run (R)"
            title="Reiniciar Nível [R]"
            className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs transition-colors shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Pause */}
          <button
            onClick={onPause}
            aria-label="Pausar Jogo (Esc / P)"
            title="Pausar Jogo [Esc / P]"
            className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs transition-colors shadow-lg"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Bottom Perimeter Cluster: Boss Vitality Bar (if engaged) */}
      {boss && boss.active && (
        <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-950/90 border border-rose-500/40 pointer-events-auto shadow-2xl">
          <div className="w-full flex justify-between items-center text-xs">
            <span className="font-bold text-rose-400 tracking-wider uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              {boss.name}
            </span>
            <span className="font-mono text-slate-400 text-[11px] tabular-nums">
              Fase {boss.phase} · {Math.max(0, boss.hp)} / {boss.maxHp} HP
            </span>
          </div>

          <div className="w-full h-3 rounded bg-slate-900 border border-slate-800 overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-rose-600 via-pink-500 to-rose-400 transition-all duration-100"
              style={{ width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Controls Toast clue (fade out quietly or subtle bottom-left) */}
      <div className="flex justify-between items-end text-[11px] text-slate-400/80 font-mono">
        <div className="hidden md:block bg-slate-950/60 px-3 py-1 rounded-md border border-slate-800/60">
          WASD: Mover · Espaço: Pular · J: Espada · K: Magia (Alma) · L: Esquiva · H: Documentação
        </div>
        <div className="bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-800/60">
          Tempo: <span className="text-white font-bold tabular-nums">{Math.floor(stats.timeElapsed)}s</span>
        </div>
      </div>

    </div>
  );
};
