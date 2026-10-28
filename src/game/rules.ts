/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Difficulty, DifficultyConfig, Rect, RunSnapshot } from './types';

export const DIFFICULTY_PRESETS: Record<Difficulty, DifficultyConfig> = {
  facil: {
    id: 'facil',
    name: 'Fácil',
    subtitle: 'Exploração Serenada',
    description: 'Campanha massiva de 50 fases com combate tolerante, regeneração de alma e exploração acessível.',
    totalStages: 50,
    playerMaxHp: 6,
    playerHpMultiplier: 1.5,
    enemyDmgMultiplier: 0.6,
    enemySpeedMultiplier: 0.8,
    parryWindowSeconds: 0.35,
    dodgeCooldownSeconds: 0.5,
    soulRegenPerSec: 1.5,
    eliteChance: 0.0,
    scoreMultiplier: 0.8,
    badge: 'Iniciado',
    accentColor: '#34d399', // Emerald
    bgGlow: 'rgba(52, 211, 153, 0.2)',
  },
  medio: {
    id: 'medio',
    name: 'Médio',
    subtitle: 'A Jornada do Herói',
    description: 'A épica jornada de 100 fases: ritmo ágil, 10 biomas evolutivos e guardiões desafiadores a cada marco.',
    totalStages: 100,
    playerMaxHp: 4,
    playerHpMultiplier: 1.0,
    enemyDmgMultiplier: 1.0,
    enemySpeedMultiplier: 1.0,
    parryWindowSeconds: 0.22,
    dodgeCooldownSeconds: 0.7,
    soulRegenPerSec: 0.4,
    eliteChance: 0.15,
    scoreMultiplier: 1.0,
    badge: 'Cavaleiro',
    accentColor: '#38bdf8', // Sky blue
    bgGlow: 'rgba(56, 189, 248, 0.2)',
  },
  dificil: {
    id: 'dificil',
    name: 'Difícil',
    subtitle: 'Desafio Implacável',
    description: 'Expedição monumental de 150 fases com inimigos agressivos, reflexos rápidos, emboscadas e perigos em abundância.',
    totalStages: 150,
    playerMaxHp: 3,
    playerHpMultiplier: 0.75,
    enemyDmgMultiplier: 1.45,
    enemySpeedMultiplier: 1.25,
    parryWindowSeconds: 0.15,
    dodgeCooldownSeconds: 0.85,
    soulRegenPerSec: 0.0,
    eliteChance: 0.4,
    scoreMultiplier: 1.5,
    badge: 'Veterano',
    accentColor: '#fb923c', // Orange
    bgGlow: 'rgba(251, 146, 60, 0.2)',
  },
  hard_master: {
    id: 'hard_master',
    name: 'Hard Master',
    subtitle: 'O Julgamento da Alma Suprema',
    description: 'O Desafio Máximo Supremo: 200 Fases Colossais! 10 biomas profundos, modificadores de elite, dano letal (2.1x) e confronto no topo do mundo.',
    totalStages: 200,
    playerMaxHp: 2,
    playerHpMultiplier: 0.5,
    enemyDmgMultiplier: 2.1,
    enemySpeedMultiplier: 1.45,
    parryWindowSeconds: 0.09,
    dodgeCooldownSeconds: 1.0,
    soulRegenPerSec: 0.0,
    eliteChance: 0.8,
    scoreMultiplier: 2.5,
    badge: 'Mestre da Alma',
    accentColor: '#f43f5e', // Rose/Crimson
    bgGlow: 'rgba(244, 63, 94, 0.3)',
  },
};

export function getDifficultyConfig(difficulty: Difficulty): DifficultyConfig {
  return DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.medio;
}

export function clampDeltaTime(rawDt: number, maxDt = 0.05): number {
  if (isNaN(rawDt) || rawDt <= 0) return 0.016;
  return Math.min(rawDt, maxDt);
}

export function aabbCollision(r1: Rect, r2: Rect): boolean {
  return (
    r1.x < r2.x + r2.w &&
    r1.x + r1.w > r2.x &&
    r1.y < r2.y + r2.h &&
    r1.y + r1.h > r2.y
  );
}

export function calculateDamage(
  baseDmg: number,
  multiplier: number,
  isCritical = false,
  isDefending = false
): number {
  let dmg = baseDmg * multiplier;
  if (isCritical) {
    dmg *= 1.75;
  }
  if (isDefending) {
    dmg *= 0.2; // 80% damage reduction when shielding
  }
  return Math.max(1, Math.round(dmg));
}

export function calculateParrySuccess(timingDeltaSeconds: number, windowSeconds: number): boolean {
  return timingDeltaSeconds >= 0 && timingDeltaSeconds <= windowSeconds;
}

export function calculateSoulGain(baseGain: number, comboStreak: number, difficulty: Difficulty): number {
  const config = getDifficultyConfig(difficulty);
  const comboBonus = Math.min(2.0, 1 + comboStreak * 0.1);
  return Math.round(baseGain * comboBonus * (difficulty === 'facil' ? 1.4 : 1.0));
}

export function coyoteJumpEligible(timeSinceGrounded: number, coyoteThreshold = 0.1): boolean {
  return timeSinceGrounded <= coyoteThreshold;
}

export function bufferActionEligible(bufferTimer: number, bufferThreshold = 0.12): boolean {
  return bufferTimer <= bufferThreshold;
}

export function calculateRank(
  clearTimeSeconds: number,
  damageTaken: number,
  shardsCollected: number,
  totalShards: number,
  difficulty: Difficulty,
  enemiesDefeated: number
): { rank: 'S+' | 'S' | 'A' | 'B' | 'C'; score: number; title: string } {
  const config = getDifficultyConfig(difficulty);
  
  // Base points
  const timeScore = Math.max(0, Math.round(15000 - clearTimeSeconds * 40));
  const damagePenalty = damageTaken * 120;
  const shardScore = shardsCollected * 400;
  const allShardsBonus = shardsCollected >= totalShards ? 2500 : 0;
  const enemiesScore = enemiesDefeated * 350;

  const rawScore = Math.max(100, (timeScore - damagePenalty + shardScore + allShardsBonus + enemiesScore));
  const finalScore = Math.round(rawScore * config.scoreMultiplier);

  let rank: 'S+' | 'S' | 'A' | 'B' | 'C' = 'C';
  let title = 'Peregrino da Alma';

  if (damageTaken === 0 && shardsCollected === totalShards && difficulty === 'hard_master') {
    rank = 'S+';
    title = 'Semideus da Alma - Perfeição Absoluta';
  } else if (finalScore >= 18000) {
    rank = 'S+';
    title = 'Lenda Celestial';
  } else if (finalScore >= 13000) {
    rank = 'S';
    title = 'Mestre dos Remanescentes';
  } else if (finalScore >= 8500) {
    rank = 'A';
    title = 'Guerreiro Abençoado';
  } else if (finalScore >= 5000) {
    rank = 'B';
    title = 'Combatente Determinado';
  } else {
    rank = 'C';
    title = 'Sobrevivente Novato';
  }

  return { rank, score: finalScore, title };
}

export function isFinalStage(currentStage: number, difficulty: Difficulty): boolean {
  const config = getDifficultyConfig(difficulty);
  return currentStage >= config.totalStages;
}

export function getNextStage(currentStage: number, difficulty: Difficulty): number | null {
  const config = getDifficultyConfig(difficulty);
  if (currentStage >= config.totalStages) {
    return null;
  }
  return currentStage + 1;
}
