/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ACHIEVEMENTS_CATALOG, Achievement, achievementManager } from '../game/achievements';
import { Difficulty } from '../game/types';
import { DIFFICULTY_PRESETS } from '../game/rules';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDifficulty: Difficulty;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  currentDifficulty,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'combat' | 'progression' | 'mastery'>('all');
  const [saveJsonInput, setSaveJsonInput] = useState<string>('');
  const [saveStatusMsg, setSaveStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [showSaveTab, setShowSaveTab] = useState<boolean>(false);

  if (!isOpen) return null;

  const unlockedIds = achievementManager.getUnlockedIds();
  const highestFloors = achievementManager.getHighestFloors();
  const totalCount = ACHIEVEMENTS_CATALOG.length;
  const unlockedCount = unlockedIds.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const filteredAchievements = ACHIEVEMENTS_CATALOG.filter((item) => {
    const isUnlocked = unlockedIds.includes(item.id);
    if (filter === 'unlocked' && !isUnlocked) return false;
    if (filter === 'locked' && isUnlocked) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    return true;
  });

  const handleExportSave = () => {
    const jsonStr = achievementManager.exportSave();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `remanescente-da-alma-save-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSaveStatusMsg({ text: 'Backup de progresso exportado com sucesso!', isError: false });
  };

  const handleImportSave = () => {
    if (!saveJsonInput.trim()) {
      setSaveStatusMsg({ text: 'Cole o conteúdo JSON do save no campo abaixo.', isError: true });
      return;
    }
    const res = achievementManager.importSave(saveJsonInput);
    if (res.success) {
      setSaveStatusMsg({ text: 'Progresso e conquistas restaurados com sucesso!', isError: false });
      setSaveJsonInput('');
    } else {
      setSaveStatusMsg({ text: `Falha ao importar: ${res.error || 'Formato inválido'}`, isError: true });
    }
  };

  const rarityColors = {
    comum: { border: 'border-slate-700', bg: 'bg-slate-900/60', text: 'text-slate-300', tag: 'bg-slate-800 text-slate-300' },
    raro: { border: 'border-cyan-500/40', bg: 'bg-cyan-950/30', text: 'text-cyan-300', tag: 'bg-cyan-900/60 text-cyan-300' },
    epico: { border: 'border-purple-500/40', bg: 'bg-purple-950/30', text: 'text-purple-300', tag: 'bg-purple-900/60 text-purple-300' },
    lendario: { border: 'border-amber-500/50', bg: 'bg-amber-950/30', text: 'text-amber-300', tag: 'bg-amber-900/70 text-amber-200' },
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Conquistas e Backup"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-950 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-950/40 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-amber-300">
                Conquistas & Hall da Fama
              </h2>
              <p className="text-xs text-slate-400">
                Progresso Geral: {unlockedCount} de {totalCount} desbloqueadas ({progressPercent}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSaveTab(!showSaveTab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                showSaveTab
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              {showSaveTab ? 'Ver Troféus' : 'Backup / Importar Save'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 h-2">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {showSaveTab ? (
            /* Save / Backup Tab */
            <div className="space-y-6">
              <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <span>💾</span> Exportar Save Local (JSON)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gere um backup seguro contendo todos os seus andares conquistados (até o Andar 200),
                  conquistas desbloqueadas e estatísticas para jogar em outro navegador ou computador.
                </p>
                <button
                  onClick={handleExportSave}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-lg shadow-md transition-all flex items-center gap-2"
                >
                  <span>⬇️</span> Baixar Arquivo de Save (.json)
                </button>
              </div>

              <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <span>📂</span> Importar Save
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cole o código JSON do seu save abaixo para restaurar seus troféus e checkpoints desbloqueados:
                </p>
                <textarea
                  rows={4}
                  value={saveJsonInput}
                  onChange={(e) => setSaveJsonInput(e.target.value)}
                  placeholder='{"version": 1, "highestFloors": { "hard_master": 200 }, ...}'
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleImportSave}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs rounded-lg shadow-md transition-all flex items-center gap-2"
                >
                  <span>⬆️</span> Restaurar Dados
                </button>
              </div>

              {saveStatusMsg && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold ${
                    saveStatusMsg.isError
                      ? 'bg-red-950/70 border border-red-700/60 text-red-300'
                      : 'bg-emerald-950/70 border border-emerald-700/60 text-emerald-300'
                  }`}
                >
                  {saveStatusMsg.text}
                </div>
              )}

              {/* Record Summary */}
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Recorde de Andares Conquistados por Dificuldade:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['facil', 'medio', 'dificil', 'hard_master'] as Difficulty[]).map((diff) => {
                    const preset = DIFFICULTY_PRESETS[diff];
                    const record = highestFloors[diff] || 1;
                    return (
                      <div key={diff} className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 text-center">
                        <div className="text-xs font-semibold text-slate-400">{preset.name}</div>
                        <div className="text-lg font-black text-amber-400 mt-1">
                          {record} <span className="text-xs font-normal text-slate-500">/ {preset.totalStages}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Achievements Trophy Case */
            <>
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl">
                  {(['all', 'unlocked', 'locked'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFilter(mode)}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                        filter === mode
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode === 'all' && 'Todas'}
                      {mode === 'unlocked' && `Desbloqueadas (${unlockedCount})`}
                      {mode === 'locked' && `Bloqueadas (${totalCount - unlockedCount})`}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Categoria:</span>
                  {(['all', 'combat', 'progression', 'mastery'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                        selectedCategory === cat
                          ? 'bg-slate-700 text-amber-300 font-bold'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {cat === 'all' && 'Geral'}
                      {cat === 'combat' && 'Combate'}
                      {cat === 'progression' && 'Fases'}
                      {cat === 'mastery' && 'Maestria'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Trophies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredAchievements.map((item) => {
                  const isUnlocked = unlockedIds.includes(item.id);
                  const style = rarityColors[item.rarity];

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border flex items-start gap-3.5 transition-all ${
                        isUnlocked
                          ? `${style.bg} ${style.border} shadow-sm`
                          : 'bg-slate-900/30 border-slate-800/80 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                          isUnlocked
                            ? 'bg-slate-800/90 shadow-inner'
                            : 'bg-slate-950 grayscale opacity-40'
                        }`}
                      >
                        {item.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4
                            className={`text-sm font-bold truncate ${
                              isUnlocked ? style.text : 'text-slate-400'
                            }`}
                          >
                            {item.title}
                          </h4>
                          <span
                            className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                              isUnlocked ? style.tag : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {item.rarity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 capitalize">{item.category}</span>
                          <span className={isUnlocked ? 'text-emerald-400 font-semibold' : 'text-slate-600'}>
                            {isUnlocked ? '✓ Conquistado' : '🔒 Bloqueado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Dificuldade Ativa:</span>
            <span className="font-bold text-amber-300 uppercase">{currentDifficulty.replace('_', ' ')}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
