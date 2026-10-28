/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Difficulty, PlayerStats } from './types';
import { sounds } from './audio';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'combat' | 'progression' | 'mastery';
  rarity: 'comum' | 'raro' | 'epico' | 'lendario';
}

export const ACHIEVEMENTS_CATALOG: Achievement[] = [
  {
    id: 'first_blood',
    title: 'Primeiro Sangue',
    description: 'Derrote seu primeiro inimigo no Abismo Astral.',
    icon: '⚔️',
    category: 'combat',
    rarity: 'comum',
  },
  {
    id: 'parry_master',
    title: 'Mestre da Defesa',
    description: 'Execute 5 defesas perfeitas (Parry) com timing milimétrico.',
    icon: '🛡️',
    category: 'combat',
    rarity: 'raro',
  },
  {
    id: 'combo_demon',
    title: 'Fúria Espiritual',
    description: 'Alcance um combo de 15 golpes consecutivos sem ser atingido.',
    icon: '🔥',
    category: 'combat',
    rarity: 'epico',
  },
  {
    id: 'soul_collector',
    title: 'Colecionador de Almas',
    description: 'Colete 30 fragmentos de alma astral pelo labirinto.',
    icon: '💎',
    category: 'progression',
    rarity: 'comum',
  },
  {
    id: 'floor_25',
    title: 'Desbravador do Abismo',
    description: 'Alcance o Andar 25 em qualquer nível de dificuldade.',
    icon: '🏰',
    category: 'progression',
    rarity: 'comum',
  },
  {
    id: 'floor_50',
    title: 'Conquistador dos Ermos',
    description: 'Conquiste 50 andares e complete o primeiro grande marco.',
    icon: '🌲',
    category: 'progression',
    rarity: 'raro',
  },
  {
    id: 'floor_100',
    title: 'Campeão dos 100 Andares',
    description: 'Domine 100 andares no modo Médio ou superior.',
    icon: '⚡',
    category: 'progression',
    rarity: 'epico',
  },
  {
    id: 'floor_150',
    title: 'Veterano do Vazio',
    description: 'Sobreviva a 150 andares na perigosa expedição Difícil.',
    icon: '🌑',
    category: 'progression',
    rarity: 'epico',
  },
  {
    id: 'floor_200',
    title: 'Lenda Hard Master 200',
    description: 'Alcance o épico 200º Andar no modo Hard Master. A maior provação!',
    icon: '👑',
    category: 'mastery',
    rarity: 'lendario',
  },
  {
    id: 'titan_slayer',
    title: 'Ceifador de Titãs',
    description: 'Derrote um Guardião Ancestral (Boss) em combate direto.',
    icon: '💀',
    category: 'combat',
    rarity: 'raro',
  },
  {
    id: 'untouchable',
    title: 'Espírito Inatingível',
    description: 'Conclua um andar inteiro sem sofrer nenhum dano.',
    icon: '✨',
    category: 'mastery',
    rarity: 'epico',
  },
  {
    id: 'astral_elevator',
    title: 'Viajante das Fendas',
    description: 'Utilize o Elevador Astral para selecionar um checkpoint avançado.',
    icon: '🚀',
    category: 'progression',
    rarity: 'comum',
  },
];

const STORAGE_KEY = 'souls_remnant_achievements_v1';
const HIGHEST_FLOOR_KEY = 'souls_remnant_highest_floors_v1';

export interface GameSaveData {
  version: number;
  exportedAt: string;
  gameTitle: string;
  highestFloors: Record<Difficulty, number>;
  unlockedAchievements: string[];
  totalKills: number;
  totalParries: number;
  totalShards: number;
  bestCombo: number;
}

export class AchievementManager {
  private unlocked: Set<string> = new Set();
  private onUnlockCallbacks: Array<(achievement: Achievement) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          this.unlocked = new Set(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.unlocked)));
    } catch {
      // Ignore storage errors
    }
  }

  public onUnlock(callback: (achievement: Achievement) => void) {
    this.onUnlockCallbacks.push(callback);
  }

  public isUnlocked(id: string): boolean {
    return this.unlocked.has(id);
  }

  public getUnlockedIds(): string[] {
    return Array.from(this.unlocked);
  }

  public getUnlockedCount(): number {
    return this.unlocked.size;
  }

  public unlock(id: string): boolean {
    if (this.unlocked.has(id)) return false;
    const item = ACHIEVEMENTS_CATALOG.find((a) => a.id === id);
    if (!item) return false;

    this.unlocked.add(id);
    this.saveToStorage();

    try {
      sounds.playAchievement();
    } catch {
      // Audio fallback
    }

    this.onUnlockCallbacks.forEach((cb) => {
      try {
        cb(item);
      } catch (err) {
        console.error(err);
      }
    });

    return true;
  }

  public checkPlayerProgress(
    stats: PlayerStats,
    options?: {
      tookDamageThisStage?: boolean;
      bossDefeated?: boolean;
      usedElevator?: boolean;
    }
  ) {
    if (stats.enemiesDefeated >= 1) this.unlock('first_blood');
    if (stats.parriesExecuted >= 5) this.unlock('parry_master');
    if (stats.combo >= 15 || stats.maxCombo >= 15) this.unlock('combo_demon');
    if (stats.shards >= 30) this.unlock('soul_collector');

    if (stats.currentStage >= 25) this.unlock('floor_25');
    if (stats.currentStage >= 50) this.unlock('floor_50');
    if (stats.currentStage >= 100) this.unlock('floor_100');
    if (stats.currentStage >= 150) this.unlock('floor_150');
    if (stats.currentStage >= 200 && stats.difficulty === 'hard_master') {
      this.unlock('floor_200');
    }

    if (options?.bossDefeated) this.unlock('titan_slayer');
    if (options?.tookDamageThisStage === false && stats.currentStage >= 2) {
      this.unlock('untouchable');
    }
    if (options?.usedElevator) this.unlock('astral_elevator');
  }

  public getHighestFloors(): Record<Difficulty, number> {
    const defaults: Record<Difficulty, number> = {
      facil: 1,
      medio: 1,
      dificil: 1,
      hard_master: 1,
    };
    if (typeof window === 'undefined') return defaults;
    try {
      const stored = localStorage.getItem(HIGHEST_FLOOR_KEY);
      if (stored) {
        return { ...defaults, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return defaults;
  }

  public recordHighestFloor(difficulty: Difficulty, floor: number) {
    if (typeof window === 'undefined') return;
    const current = this.getHighestFloors();
    if (floor > (current[difficulty] || 1)) {
      current[difficulty] = floor;
      try {
        localStorage.setItem(HIGHEST_FLOOR_KEY, JSON.stringify(current));
      } catch {
        // ignore
      }
    }
  }

  public exportSave(): string {
    const data: GameSaveData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      gameTitle: 'Remanescente da Alma',
      highestFloors: this.getHighestFloors(),
      unlockedAchievements: this.getUnlockedIds(),
      totalKills: 0,
      totalParries: 0,
      totalShards: 0,
      bestCombo: 0,
    };
    return JSON.stringify(data, null, 2);
  }

  public importSave(jsonString: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonString) as GameSaveData;
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Arquivo de save inválido.' };
      }
      if (Array.isArray(parsed.unlockedAchievements)) {
        parsed.unlockedAchievements.forEach((id) => {
          if (ACHIEVEMENTS_CATALOG.some((a) => a.id === id)) {
            this.unlocked.add(id);
          }
        });
        this.saveToStorage();
      }
      if (parsed.highestFloors && typeof parsed.highestFloors === 'object') {
        const current = this.getHighestFloors();
        (['facil', 'medio', 'dificil', 'hard_master'] as Difficulty[]).forEach((diff) => {
          if (parsed.highestFloors[diff] && parsed.highestFloors[diff] > (current[diff] || 1)) {
            current[diff] = parsed.highestFloors[diff];
          }
        });
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(HIGHEST_FLOOR_KEY, JSON.stringify(current));
          } catch {
            // ignore
          }
        }
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}

export const achievementManager = new AchievementManager();
