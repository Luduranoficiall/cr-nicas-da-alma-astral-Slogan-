/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Difficulty = 'facil' | 'medio' | 'dificil' | 'hard_master';

export interface DifficultyConfig {
  id: Difficulty;
  name: string;
  subtitle: string;
  description: string;
  totalStages: number;
  playerMaxHp: number;
  playerHpMultiplier: number;
  enemyDmgMultiplier: number;
  enemySpeedMultiplier: number;
  parryWindowSeconds: number;
  dodgeCooldownSeconds: number;
  soulRegenPerSec: number;
  eliteChance: number;
  scoreMultiplier: number;
  badge: string;
  accentColor: string;
  bgGlow: string;
}

export type GameState = 'title' | 'playing' | 'paused' | 'stage_clear' | 'gameover' | 'victory';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  soul: number;
  maxSoul: number;
  shards: number;
  maxShards: number;
  combo: number;
  maxCombo: number;
  damageTaken: number;
  damageDealt: number;
  enemiesDefeated: number;
  parriesExecuted: number;
  timeElapsed: number;
  difficulty: Difficulty;
  currentStage: number;
  totalStages: number;
}

export interface Enemy {
  id: number;
  type: 'crawler' | 'archer' | 'sentinel' | 'boss';
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  isDead: boolean;
  facing: number; // 1 or -1
  isGrounded: boolean;
  state: 'idle' | 'walk' | 'telegraph' | 'attack' | 'hurt' | 'blocking';
  stateTimer: number;
  attackCooldown: number;
  hitFlashTimer: number;
  isElite: boolean;
  // Archetype specifics
  shieldActive?: boolean;
  phase?: number;
  bulletCooldown?: number;
  targetX?: number;
  enraged?: boolean;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isPlayer: boolean;
  damage: number;
  lifetime: number;
  color: string;
  piercing?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  alpha: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Collectible {
  id: number;
  type: 'shard' | 'heart' | 'lore';
  x: number;
  y: number;
  w: number;
  h: number;
  collected: boolean;
  hoverOffset: number;
  loreTitle?: string;
  loreText?: string;
}

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'solid' | 'one_way' | 'moving' | 'spikes';
  minX?: number;
  maxX?: number;
  speed?: number;
}

export interface RunSnapshot {
  timeSeconds: number;
  damageTaken: number;
  damageDealt: number;
  shardsCollected: number;
  totalShards: number;
  enemiesDefeated: number;
  maxCombo: number;
  parriesExecuted: number;
  difficulty: Difficulty;
  stageReached: number;
  totalStages: number;
  rank: string;
  finalScore: number;
  isVictory: boolean;
}
