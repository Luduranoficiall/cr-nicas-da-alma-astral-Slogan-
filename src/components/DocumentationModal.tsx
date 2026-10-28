/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DIFFICULTY_PRESETS } from '../game/rules';
import { Difficulty } from '../game/types';
import { 
  BookOpen, 
  ShieldAlert, 
  Swords, 
  Sparkles, 
  Cpu, 
  X, 
  ExternalLink,
  ChevronRight,
  Flame,
  Award,
  Zap,
  Download,
  Copy,
  Check,
  FileText
} from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'dificuldades' | 'combate' | 'bestiario' | 'godot' | 'arquitetura' | 'cliente';
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'dificuldades',
}) => {
  const [activeTab, setActiveTab] = useState<'dificuldades' | 'combate' | 'bestiario' | 'godot' | 'arquitetura' | 'cliente'>(initialTab);
  const [copied, setCopied] = useState(false);

  const getManualMarkdown = () => {
    return `# ⚔️ REMANESCENTE DA ALMA — MANUAL & DOCUMENTAÇÃO OFICIAL
Tributo a Soul's Remnant (Chaomoon) & Godot Engine 3.6.3 LTS

## 🎚️ NÍVEIS DE DIFICULDADE (SEMPRE 4 NÍVEIS)
- FÁCIL: 50 Fases | Parry: 350ms | Dano: 0.60x | 6 Corações | Regeneração passiva
- MÉDIO: 100 Fases | Parry: 220ms | Dano: 1.00x | 4 Corações | 10 Biomas completos
- DIFÍCIL: 150 Fases | Parry: 150ms | Dano: 1.45x | 3 Corações | 40% Elites
- HARD MASTER: 200 FASES | Parry: 100ms | Dano: 2.10x | 2 Corações | 70% Elites (O Desafio Máximo!)

## 🕹️ CONTROLES
- Mover: [A] / [D] ou Setas
- Pular / Salto Duplo: [Espaço] ou [W]
- Agachar / Descer Plataforma: [S] ou Seta Baixo
- Ataque de Espada: [J] ou [Z] ou Clique Esquerdo
- Projétil de Alma: [K] ou [X] (Custo: 25 Alma)
- Esquiva Astral (Dash com I-Frames): [L] ou [Shift]
- Bloqueio / Parry Perfeito: [S] no chão no momento do impacto
- Manual & Documentação: [H] ou [Tab]
- Pausar: [Esc] ou [P]
- Reiniciar Andar: [R]

## 🌌 OS 10 BIOMAS (200 ANDARES)
1. Andares 1-20: Ruínas do Despertar
2. Andares 21-40: O Bosque Espectral
3. Andares 41-60: Criptas Esquecidas
4. Andares 61-80: Fosso da Lava Arcana
5. Andares 81-100: O Pináculo Celestial
6. Andares 101-120: Abismo Carmesim
7. Andares 121-140: Fenda de Cristal Roxo
8. Andares 141-160: Forja das Almas
9. Andares 161-180: Horizonte das Sombras
10. Andares 181-200: O Núcleo da Alma Primordial (Chefe Final: Titã Supremo)

## 🏛️ PARIDADE GODOT 3.6.3 LTS
- Android API Nível 36 (Android 16 Target)
- iOS 15.0+ 64-bit Target
- FTI (Fixed Time Interpolation) 2D
- Áudio WASAPI / Web Audio sem estalos
- Entropia e aleatoriedade para sementes procedurais

Documentação completa disponível no repositório em /docs/MANUAL_DO_JOGO.md e /docs/ARQUITETURA_TECNICA.md.`;
  };

  const handleCopyManual = async () => {
    try {
      await navigator.clipboard.writeText(getManualMarkdown());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback silencioso
    }
  };

  const handleDownloadManual = () => {
    const text = getManualMarkdown();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'MANUAL_REMANESCENTE_DA_ALMA.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-none select-none pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-title"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/60 overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h2 id="doc-title" className="text-lg font-bold tracking-wide text-white flex items-center gap-2 flex-wrap">
                Documentação & Manual do Jogo
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-900/50 text-cyan-300 border border-cyan-500/30">
                  Godot 3.6.3 Tribute
                </span>
              </h2>
              <p className="text-xs text-slate-400 truncate">
                Remanescente da Alma (Soul’s Remnant) · 200 Fases, Níveis de Dificuldade e Arquitetura
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyManual}
              title="Copiar resumo do manual em Markdown"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copiar MD</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadManual}
              title="Baixar Manual Oficial em arquivo .MD"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 hover:text-white border border-cyan-500/40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Baixar .MD</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Fechar Documentação"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 gap-2 overflow-x-auto scrollbar-none py-2">
          <button
            onClick={() => setActiveTab('dificuldades')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'dificuldades'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            1. Níveis de Dificuldade
          </button>
          <button
            onClick={() => setActiveTab('combate')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'combate'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            2. Combate & Controles
          </button>
          <button
            onClick={() => setActiveTab('bestiario')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'bestiario'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            3. Bestiário & Chefes
          </button>
          <button
            onClick={() => setActiveTab('godot')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'godot'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            4. Tributo Godot 3.6.3
          </button>
          <button
            onClick={() => setActiveTab('arquitetura')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'arquitetura'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            5. Arquitetura do Motor
          </button>
          <button
            onClick={() => setActiveTab('cliente')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'cliente'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-amber-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            6. Dossiê do Cliente & Repo
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300 leading-relaxed">
          
          {/* TAB 1: DIFICULDADES */}
          {activeTab === 'dificuldades' && (
            <div className="space-y-6">
              <div className="border border-cyan-500/20 rounded-xl p-4 bg-cyan-950/20">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-cyan-400" />
                  Sistema de Dificuldades: Sempre Fácil, Médio, Difícil e Hard Master
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  O jogo foi desenhado para abraçar desde o jogador casual que deseja apreciar o mundo e a trilha procedural, até os mestres de ação técnica que exigem tempo de reação milimétrico e precisão cirúrgica.
                </p>
              </div>

              {/* Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['facil', 'medio', 'dificil', 'hard_master'] as Difficulty[]).map((diffKey) => {
                  const conf = DIFFICULTY_PRESETS[diffKey];
                  return (
                    <div 
                      key={diffKey}
                      className="p-4 rounded-xl border flex flex-col justify-between transition-all"
                      style={{
                        borderColor: `${conf.accentColor}44`,
                        backgroundColor: `${conf.accentColor}0a`,
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-3 h-3 rounded-full inline-block shadow-sm"
                              style={{ backgroundColor: conf.accentColor }}
                            />
                            <h4 className="font-bold text-white text-base tracking-wide">
                              {conf.name}
                            </h4>
                          </div>
                          <span 
                            className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                            style={{ 
                              color: conf.accentColor, 
                              borderColor: `${conf.accentColor}55`,
                              backgroundColor: `${conf.accentColor}18` 
                            }}
                          >
                            {conf.badge}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-300 mb-2 italic">
                          "{conf.subtitle}"
                        </p>
                        <p className="text-xs text-slate-400 mb-4">
                          {conf.description}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-3 border-t border-slate-800/80 text-xs font-mono">
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Total de Fases:</span>
                          <span className="font-bold text-cyan-300">
                            {conf.totalStages} Fases {conf.id === 'hard_master' ? '(MÁXIMO SUPREMO)' : ''}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Vida Máxima:</span>
                          <span className="font-semibold text-white">{conf.playerMaxHp} Corações ({conf.playerMaxHp * 25} HP)</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Dano Inimigo:</span>
                          <span className="font-semibold" style={{ color: conf.accentColor }}>{Math.round(conf.enemyDmgMultiplier * 100)}%</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Velocidade Inimiga:</span>
                          <span className="font-semibold text-white">{Math.round(conf.enemySpeedMultiplier * 100)}%</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Janela de Parry:</span>
                          <span className="font-semibold text-cyan-300">{(conf.parryWindowSeconds * 1000).toFixed(0)} ms</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Chance Inimigo Elite:</span>
                          <span className="font-semibold text-white">{(conf.eliteChance * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Multiplicador Pontos:</span>
                          <span className="font-bold text-amber-300">{conf.scoreMultiplier}x</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Multi-Stage Progression & 50-Stage Hard Master Breakdown */}
              {/* Multi-Stage Progression & 200-Stage Hard Master Breakdown */}
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-xs space-y-3">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  Estrutura de Campanha Expandida: 50, 100, 150 e 200 Fases
                </div>
                <p className="text-slate-300">
                  Para atender à exigência de uma campanha monumental e desafiadora, cada nível de dificuldade possui uma quantidade épica de fases distribuídas por 10 biomas celestiais, culminando no supremo <strong>Hard Master com 200 Fases (A Grande Torre dos 200 Andares)</strong>:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-emerald-400 block mb-0.5">Fácil (50 Fases):</strong>
                    Uma jornada completa de 50 andares pelas Ruínas do Despertar e Bosques Astrais com regeneração de alma e exploração serena.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-sky-400 block mb-0.5">Médio (100 Fases):</strong>
                    A experiência balanceada de 100 fases com ritmo ágil, sentinelas blindados, plataformas móveis e guardiões de marco a cada 25 andares.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-amber-400 block mb-0.5">Difícil (150 Fases):</strong>
                    Expedição monumental de 150 fases com reflexos rápidos necessários, armadilhas contínuas, arqueiros letais e alta densidade de inimigos de elite.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-rose-500/50">
                    <strong className="text-rose-400 block mb-0.5">Hard Master (200 Fases - Máximo Absoluto!):</strong>
                    O colosso absoluto de 200 andares ininterruptos! Todos os 10 biomas celestiais, 80% de inimigos de elite, dano brutal (2.1x), guardiões a cada 25 andares e confronto definitivo no Pináculo Supremo.
                  </div>
                </div>
                
                {/* 10 Biomes description */}
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <span className="font-bold text-cyan-300 block mb-1">Os 10 Biomas Celestiais da Torre dos 200 Andares:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10px] text-slate-400">
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                      <strong className="text-sky-400 block">1. Ruínas</strong>
                      Fases 1 a 20
                    </div>
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                      <strong className="text-emerald-400 block">2. Bosque</strong>
                      Fases 21 a 40
                    </div>
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                      <strong className="text-amber-400 block">3. Fortaleza</strong>
                      Fases 41 a 60
                    </div>
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                      <strong className="text-cyan-400 block">4. Cripta Glacies</strong>
                      Fases 61 a 80
                    </div>
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                      <strong className="text-purple-400 block">5. Abismo</strong>
                      Fases 81 a 100
                    </div>
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                      <strong className="text-blue-400 block">6. Cidade Antiga</strong>
                      Fases 101 a 120
                    </div>
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                      <strong className="text-violet-400 block">7. Labirinto</strong>
                      Fases 121 a 140
                    </div>
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                      <strong className="text-red-400 block">8. Caldeira</strong>
                      Fases 141 a 160
                    </div>
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                      <strong className="text-pink-400 block">9. Eclipse</strong>
                      Fases 161 a 180
                    </div>
                    <div className="p-1.5 rounded bg-slate-950 border border-rose-500/40">
                      <strong className="text-fuchsia-400 block">10. Pináculo</strong>
                      Fases 181 a 200
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-slate-300 text-[11px] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>Elevador Astral de Checkpoints:</strong> A qualquer momento, na tela inicial ou no menu de pausa, você pode utilizar o Elevador Astral para saltar diretamente para os marcos (1, 25, 50, 100, 150, 200) para testar ou jogar qualquer andar!</span>
                </div>
              </div>

              {/* Special Note on Hard Master */}
              <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-xs space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <Zap className="w-4 h-4" />
                  Mecânicas Especiais do Modo "Hard Master"
                </div>
                <p className="text-slate-300">
                  No modo <strong>Hard Master</strong>, os inimigos recebem auras sombrias de elite (aumento de alcance e velocidade), o chefe ancestral entra na fase "Enrage" mais cedo com padrões de projéteis em espiral e ondas de choque sísmicas. Apenas jogadores que dominarem a deflexão (parry) e o dash com iframes conseguirão a insígnia <strong>S+ "Semideus da Alma"</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: COMBATE & CONTROLES */}
          {activeTab === 'combate' && (
            <div className="space-y-6">
              <div className="border border-cyan-500/20 rounded-xl p-4 bg-cyan-950/20">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Swords className="w-5 h-5 text-cyan-400" />
                  Manual Completo de Controles e Combate
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Mecânica de plataforma de precisão responsiva com amortecimento de salto, coyote time e combos fluidos.
                </p>
              </div>

              {/* Control Map Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
                  <thead className="bg-slate-900 text-slate-300 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3">Ação</th>
                      <th className="p-3">Teclado Primário</th>
                      <th className="p-3">Teclado Alternativo</th>
                      <th className="p-3">Efeito & Dica</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    <tr className="hover:bg-slate-900/30">
                      <td className="p-3 font-semibold text-white">Mover Esquerda / Direita</td>
                      <td className="p-3 font-mono text-cyan-300">A / D</td>
                      <td className="p-3 font-mono text-slate-400">Setas ← / →</td>
                      <td className="p-3 text-slate-300">Aceleração com inércia física calibrada.</td>
                    </tr>
                    <tr className="hover:bg-slate-900/30">
                      <td className="p-3 font-semibold text-white">Pulo / Pulo Duplo</td>
                      <td className="p-3 font-mono text-cyan-300">Espaço</td>
                      <td className="p-3 font-mono text-slate-400">W / Seta ↑</td>
                      <td className="p-3 text-slate-300">Soltar cedo corta o pulo (jump cut). Possui 100ms de Coyote Time ao cair.</td>
                    </tr>
                    <tr className="hover:bg-slate-900/30">
                      <td className="p-3 font-semibold text-white">Combo de Espada (1-2-3)</td>
                      <td className="p-3 font-mono text-cyan-300">J</td>
                      <td className="p-3 font-mono text-slate-400">Z</td>
                      <td className="p-3 text-slate-300">Seqüência de 3 golpes fluidos. O 3º golpe causa dano crítico e empurrão.</td>
                    </tr>
                    <tr className="hover:bg-slate-900/30">
                      <td className="p-3 font-semibold text-white">Disparo de Alma (Mágico)</td>
                      <td className="p-3 font-mono text-cyan-300">K</td>
                      <td className="p-3 font-mono text-slate-400">X</td>
                      <td className="p-3 text-slate-300">Consome 25 de Alma. Dispara projétil perfurante de longo alcance.</td>
                    </tr>
                    <tr className="hover:bg-slate-900/30">
                      <td className="p-3 font-semibold text-white">Esquiva / Dash Rápido</td>
                      <td className="p-3 font-mono text-cyan-300">L</td>
                      <td className="p-3 font-mono text-slate-400">C / Shift</td>
                      <td className="p-3 text-slate-300">Dash horizontal veloz com 180ms de invulnerabilidade (iframes).</td>
                    </tr>
                    <tr className="hover:bg-slate-900/30">
                      <td className="p-3 font-semibold text-white">Deflexão / Parry Preciso</td>
                      <td className="p-3 font-mono text-cyan-300">Ataque no Momento do Impacto</td>
                      <td className="p-3 font-mono text-slate-400">Ataque sincronizado</td>
                      <td className="p-3 text-slate-300">Desvia projéteis inimigos, atordoa agressores e recupera 30 de Alma.</td>
                    </tr>
                    <tr className="hover:bg-slate-900/30">
                      <td className="p-3 font-semibold text-white">Pausar / Menu</td>
                      <td className="p-3 font-mono text-cyan-300">Esc</td>
                      <td className="p-3 font-mono text-slate-400">P</td>
                      <td className="p-3 text-slate-300">Congela a simulação do jogo e abre opções.</td>
                    </tr>
                    <tr className="hover:bg-slate-900/30">
                      <td className="p-3 font-semibold text-white">Mutar / Desmutar Som</td>
                      <td className="p-3 font-mono text-cyan-300">M</td>
                      <td className="p-3 font-mono text-slate-400">-</td>
                      <td className="p-3 text-slate-300">Silencia os sintetizadores Web Audio procedurais.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Advanced Tech */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                  <h4 className="font-semibold text-white flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Input Buffering & Coyote Time
                  </h4>
                  <p className="text-xs text-slate-400">
                    O motor armazena intenções de pulo e ataque por até <strong>120ms</strong> antes do personagem tocar o solo. Além disso, ao caminhar para fora de uma plataforma, você tem <strong>100ms</strong> de margem para pular no ar sem penalidade.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                  <h4 className="font-semibold text-white flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Hitstop & Feedback de Peso
                  </h4>
                  <p className="text-xs text-slate-400">
                    Cada golpe pesado acerta com uma pausa de simulação de <strong>40 a 70ms</strong>, acompanhada de tremor de câmera quadrático (<code className="text-cyan-300">trauma²</code>) e explosão de partículas coloridas sem alocação de memória no frame.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BESTIÁRIO & CHEFES */}
          {activeTab === 'bestiario' && (
            <div className="space-y-6">
              <div className="border border-cyan-500/20 rounded-xl p-4 bg-cyan-950/20">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Bestiário de Criaturas do Vazio Celestial
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Estude os padrões de inteligência artificial, telegrafias visuais e fraquezas de cada criatura.
                </p>
              </div>

              <div className="space-y-4">
                {/* Crawler */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold shrink-0">
                    RC
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-base">Rastejante do Vazio (Void Crawler)</h4>
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-500/30">Enxame / Chaser</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Patrulha plataformas com passos ligeiros. Quando detecta o jogador a curta distância, agacha-se brevemente (telegraph) e salta ferozmente na direção do herói.
                    </p>
                    <p className="text-xs text-emerald-400 mt-2 font-mono">
                      <strong>Tática:</strong> Golpeie no ar durante o salto ou use o Dash para passar por baixo e desferir o combo pelas costas.
                    </p>
                  </div>
                </div>

                {/* Archer */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold shrink-0">
                    AE
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-base">Arqueiro Espectral (Spectral Archer)</h4>
                      <span className="text-xs px-2 py-0.5 rounded bg-cyan-900/40 text-cyan-300 border border-cyan-500/30">Longo Alcance / Kiter</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Mantém distância e recua caso o herói se aproxime demais. Carrega uma flecha estelar com uma mira laser visível de 0.6s antes do disparo sonoro.
                    </p>
                    <p className="text-xs text-emerald-400 mt-2 font-mono">
                      <strong>Tática:</strong> Use a espada no momento exato em que a flecha chega para realizar um <em>Parry</em> e refletir o projétil de volta!
                    </p>
                  </div>
                </div>

                {/* Sentinel */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shrink-0">
                    SE
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-base">Sentinela Guardião (Void Sentinel)</h4>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-500/30">Defensor Pesado</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Porta um escudo imponente que bloqueia 100% do dano frontal. Após bloquear, telegrafa um golpe giratório de claymore com faíscas incandescentes.
                    </p>
                    <p className="text-xs text-emerald-400 mt-2 font-mono">
                      <strong>Tática:</strong> Salte por cima dele ou use Dash para golpear as costas desprotegidas. No Hard Master, ele gira 180° mais rapidamente.
                    </p>
                  </div>
                </div>

                {/* Boss */}
                <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-rose-950 border border-rose-500 flex items-center justify-center text-rose-300 font-bold shrink-0 shadow-lg shadow-rose-950">
                    RP
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-base flex items-center gap-2">
                        Remanescente Primordial (Soul Overlord)
                        <span className="text-xs px-2 py-0.5 rounded bg-rose-900/80 text-rose-200 border border-rose-500">GRANDE CHEFE</span>
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      O guardião milenar dos Fragmentos de Alma. Possui 2 fases de combate dinâmicas:
                    </p>
                    <ul className="text-xs text-slate-400 mt-2 list-disc list-inside space-y-1">
                      <li><strong>Fase 1 (100% - 50% HP):</strong> Golpes sísmicos com a lâmina ancestral, geração de ondas de choque no solo e invocação de servos rastejantes.</li>
                      <li><strong>Fase 2 (Abaixo de 50% HP):</strong> Desperta asas astrais, flutua pelo campo, dispara orbes estelares em padrões radiais de bullet hell e mergulha em queda esmagadora (Slam).</li>
                      <li><strong>Hard Master Enrage:</strong> Quando atinge 30% de HP no modo Hard Master, seus ataques não possuem intervalo e seu rastro de fogo incandesce as plataformas.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRIBUTO GODOT 3.6.3 */}
          {activeTab === 'godot' && (
            <div className="space-y-6">
              <div className="border border-cyan-500/20 rounded-xl p-4 bg-cyan-950/20">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-cyan-400" />
                  Tributo ao Motor Godot & Lançamento 3.6.3 LTS
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Uma homenagem sincera à Fundação Godot, aos desenvolvedores de código aberto e ao jogo <em>Soul’s Remnant</em> (Remanescente da Alma) da Chaomoon.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  Sobre a Versão de Manutenção Godot 3.6.3 (22 de Agosto de 2026)
                </h4>
                <p className="text-xs text-slate-300">
                  O Godot 3.6.2 permaneceu como a versão estável LTS recomendada da ramificação 3.x por muito tempo. O lançamento 3.6.3 foi publicado para atender às novas exigências dos ecossistemas móveis e garantir total longevidade aos projetos 2D consolidados:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="font-bold text-emerald-400 block mb-1">Android 16 (API 36)</span>
                    <p className="text-slate-400">Atualização obrigatória do SDK para conformidade com as novas diretrizes do Google Play Store.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="font-bold text-sky-400 block mb-1">iOS 15.0 & Xcode 27</span>
                    <p className="text-slate-400">Remoção definitiva de binários legados de 32 bits e suporte aprimorado a compilação cruzada.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="font-bold text-amber-400 block mb-1">Áudio WASAPI & Estalos</span>
                    <p className="text-slate-400">Correção de estalos sonoros através da validação correta de tamanho de buffer do IAudioClient.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="font-bold text-purple-400 block mb-1">FTI - Frame Time Interpolation</span>
                    <p className="text-slate-400">Otimização de itens 2D e renderização desvinculada de threads físicas para taxa de quadros perfeita.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/30 space-y-2">
                <h4 className="font-bold text-cyan-300 text-sm">
                  Destaque da Comunidade: "Remanescente da Alma" por Chaomoon
                </h4>
                <p className="text-xs text-slate-300">
                  A ilustração de capa do anúncio oficial do Godot 3.6.3 é de <strong>Soul’s Remnant</strong>, um MMORPG de plataforma 2D desenvolvido com maestria no Godot pela Chaomoon, onde os jogadores exploram e conquistam reinos misteriosos. Nosso jogo presta homenagem direta a esta fantástica obra com jogabilidade 2D ágil e responsiva!
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: ARQUITETURA DO MOTOR */}
          {activeTab === 'arquitetura' && (
            <div className="space-y-6">
              <div className="border border-cyan-500/20 rounded-xl p-4 bg-cyan-950/20">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  Arquitetura Técnica do Motor & Padrões Ultra-Mode
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Engenharia de ponta em React 19 + TypeScript + Canvas2D a 60 FPS com desacoplamento rigoroso.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <h4 className="font-bold text-cyan-300 mb-1">1. Desacoplamento React / Canvas Loop (60 FPS)</h4>
                  <p className="text-slate-400">
                    O canvas reside em um contêiner isolado com referências mutáveis internas. As atualizações de alta frequência de física e partículas não acionam <code className="text-cyan-300">setState</code> do React. Apenas marcos de fase (game over, vitória, pausa) e números discretos de HUD são emitidos a taxas controladas.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <h4 className="font-bold text-cyan-300 mb-1">2. Clamped Delta-Time & Prevenção de Tunneling</h4>
                  <p className="text-slate-400">
                    A função <code className="text-cyan-300">clampDeltaTime(rawDt, 0.05)</code> garante que mesmo se o usuário trocar de aba ou o navegador sofrer engasgos de GC, o passo de simulação nunca ultrapasse 50ms, impedindo que entidades atravessem plataformas sólidas.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <h4 className="font-bold text-cyan-300 mb-1">3. Ring Buffer de Partículas Zero-GC</h4>
                  <p className="text-slate-400">
                    Partículas e orbes usam conjuntos pré-alocados de tamanho fixo reutilizados sequencialmente. Isso elimina a pressão do coletor de lixo (Garbage Collector) no navegador, garantindo frametimes estáveis de 16.6ms.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <h4 className="font-bold text-cyan-300 mb-1">4. Testes Unitários Nativos (Node.js Test Runner)</h4>
                  <p className="text-slate-400">
                    Todas as regras puras de cálculo de dano, mitigação de escudo, multiplicadores por dificuldade, elegibilidade de coyote time e cálculo de ranking S+/S/A/B/C são cobertas por suíte de testes em <code className="text-cyan-300">src/game/rules.test.ts</code> executadas via <code className="text-cyan-300">node:test</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DOSSIÊ DO CLIENTE & REPOSITÓRIO */}
          {activeTab === 'cliente' && (
            <div className="space-y-6">
              <div className="border border-amber-500/30 rounded-xl p-4 bg-amber-950/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-400" />
                      Dossiê Executivo de Entrega para o Cliente
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Identidade oficial, dados cadastrais para o GitHub, escopo de fases e atalhos de documentação técnica.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                    Status: 100% Pronto
                  </span>
                </div>
              </div>

              {/* Repositório e Descrições Prontas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Nome do Repositório */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                      Nome Recomendado para o Repositório GitHub
                    </span>
                    <div className="mt-1 p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-cyan-300 font-bold text-sm select-all">
                      remanescente-da-alma
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Alternativas: <code>souls-remnant-game</code> ou <code>remanescente-da-alma-2d</code>
                    </span>
                  </div>
                </div>

                {/* Tags / Topics */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                      Tópicos & Tags do GitHub (Topics)
                    </span>
                    <div className="mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 select-all">
                      godot-engine, action-platformer, rpg-2d, typescript, hard-master, 200-floors
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Otimizado para indexação e visibilidade no GitHub.
                    </span>
                  </div>
                </div>

              </div>

              {/* Descrição Curta (About) */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                  Descrição Curta (Para o campo "About" no GitHub - até 350 caracteres)
                </span>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-sans text-xs text-slate-200 select-all leading-relaxed">
                  RPG de Ação e Plataforma 2D inspirado no Godot Engine 3.6.3 e Chaomoon. 4 níveis de dificuldade (Fácil, Médio, Difícil e Hard Master com 200 fases), combate técnico com parry de precisão, 10 biomas, Elevador Astral de checkpoints, sintetizador Web Audio procedural e documentação completa.
                </div>
              </div>

              {/* Tabela de Dificuldades & Fases Exigidas */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono uppercase text-cyan-300 font-bold tracking-wider">
                  Os 4 Níveis de Dificuldade (Com Escala Máxima de Fases)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/30">
                    <span className="text-emerald-400 font-bold block">1. Fácil</span>
                    <span className="text-white font-mono font-bold text-sm">50 Fases</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Regeneração passiva de alma e 6 corações</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-sky-500/30">
                    <span className="text-sky-400 font-bold block">2. Médio</span>
                    <span className="text-white font-mono font-bold text-sm">100 Fases</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Campanha clássica com 10 biomas completos</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-amber-500/30">
                    <span className="text-amber-400 font-bold block">3. Difícil</span>
                    <span className="text-white font-mono font-bold text-sm">150 Fases</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Inimigos agressivos e 40% de tropas de Elite</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-rose-500/40 bg-rose-950/20">
                    <span className="text-rose-400 font-bold block">4. Hard Master</span>
                    <span className="text-white font-mono font-bold text-sm">200 FASES ★</span>
                    <p className="text-[10px] text-rose-300/80 mt-0.5">O teto máximo absoluto com 70% de elites e 100ms parry</p>
                  </div>
                </div>
              </div>

              {/* Relação dos Arquivos da Documentação Oficial */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono uppercase text-amber-400 font-bold tracking-wider">
                  Arquivos Oficiais de Documentação Técnica no Repositório (/docs)
                </h4>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-cyan-300">docs/DOCUMENTACAO_DO_CLIENTE.md</span>
                    <span className="text-slate-400 text-[11px]">Dossiê executivo de entrega e cadastro</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-cyan-300">docs/MANUAL_DO_JOGO.md</span>
                    <span className="text-slate-400 text-[11px]">Manual completo, controles e bestiário</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-cyan-300">docs/TABELA_DE_FASES_E_BIOMAS.md</span>
                    <span className="text-slate-400 text-[11px]">Mapeamento dos 200 andares e chefes</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-cyan-300">docs/ARQUITETURA_TECNICA.md</span>
                    <span className="text-slate-400 text-[11px]">Motor 60 FPS e paridade Godot 3.6.3</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-cyan-300">docs/GUIA_DE_COMPILACAO_E_DEPLOY.md</span>
                    <span className="text-slate-400 text-[11px]">Instalação, testes e deploy em nuvem</span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação Rápida */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleDownloadManual}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors shadow-lg shadow-cyan-950"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Manual Completo (.MD)</span>
                </button>

                <button
                  onClick={handleCopyManual}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                  <span>{copied ? 'Copiado para Área de Transferência!' : 'Copiar Resumo em Markdown'}</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900/60 text-xs">
          <span className="text-slate-400">
            Dica: Você pode reabrir esta documentação a qualquer momento pressionando <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">H</kbd> ou pelo menu de pausa.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors"
          >
            Entendido, Voltar ao Jogo
          </button>
        </div>

      </div>
    </div>
  );
};
