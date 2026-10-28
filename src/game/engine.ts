/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Difficulty, DifficultyConfig, Enemy, Particle, Platform, Projectile, FloatingText, Collectible, Rect, RunSnapshot, PlayerStats } from './types';
import { getDifficultyConfig, clampDeltaTime, aabbCollision, calculateDamage, calculateParrySuccess, calculateRank, isFinalStage, getNextStage } from './rules';
import { sounds } from './audio';

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: PlayerStats) => void;
  onStateChange: (state: 'playing' | 'paused' | 'stage_clear' | 'gameover' | 'victory', snapshot?: RunSnapshot) => void;
  onBossUpdate: (boss: { active: boolean; hp: number; maxHp: number; phase: number; name: string } | null) => void;
  onStageClear?: (currentStage: number, totalStages: number, stageName: string, nextStageName: string, stageTime: number) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  // Difficulty & Stages
  public difficulty: Difficulty = 'medio';
  public config: DifficultyConfig = getDifficultyConfig('medio');
  public currentStage: number = 1;
  public totalStages: number = 5;
  private stageTimeElapsed: number = 0;

  // Input states
  private keysHeld: Set<string> = new Set();
  private keysJustPressed: Set<string> = new Set();

  // Buffering & Coyote time
  private jumpBufferTimer: number = 0;
  private attackBufferTimer: number = 0;
  private dashBufferTimer: number = 0;
  private timeSinceGrounded: number = 0;

  // Camera & Shake
  private cameraX: number = 0;
  private cameraY: number = 0;
  private trauma: number = 0;

  // Hitstop
  private hitstopTimer: number = 0;

  // Portal entity for non-final stages
  private portal = {
    x: 2380,
    y: 350,
    w: 50,
    h: 80,
    pulse: 0,
  };

  // Player state
  private player = {
    x: 120,
    y: 350,
    vx: 0,
    vy: 0,
    w: 26,
    h: 40,
    isGrounded: false,
    facing: 1, // 1 for right, -1 for left
    hp: 4,
    maxHp: 4,
    soul: 50,
    maxSoul: 100,
    isInvulnerable: false,
    invulnTimer: 0,
    isDashing: false,
    dashTimer: 0,
    dashCooldown: 0,
    isAttacking: false,
    attackTimer: 0,
    comboStep: 0,
    comboResetTimer: 0,
    crouch: false,
    squashX: 1,
    squashY: 1,
    walkFrame: 0,
  };

  // Run Stats
  private stats: PlayerStats = {
    hp: 4,
    maxHp: 4,
    soul: 50,
    maxSoul: 100,
    shards: 0,
    maxShards: 5,
    combo: 0,
    maxCombo: 0,
    damageTaken: 0,
    damageDealt: 0,
    enemiesDefeated: 0,
    parriesExecuted: 0,
    timeElapsed: 0,
    difficulty: 'medio',
    currentStage: 1,
    totalStages: 5,
  };

  // World objects
  private platforms: Platform[] = [];
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private collectibles: Collectible[] = [];

  // Boss reference (active on final stage)
  private bossEnemy: Enemy | null = null;
  private bossDefeatedTimer: number = 0;

  // Particle pool
  private readonly MAX_PARTICLES = 160;

  // Timing
  private lastTime: number = 0;
  private lastStatsPush: number = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
    this.callbacks = callbacks;

    this.bindInputs();
    this.setDifficulty('medio');
  }

  public setDifficulty(diff: Difficulty, startingStage = 1) {
    this.difficulty = diff;
    this.config = getDifficultyConfig(diff);
    this.totalStages = this.config.totalStages;
    this.currentStage = Math.max(1, Math.min(this.totalStages, startingStage));
    this.stageTimeElapsed = 0;

    this.player.maxHp = this.config.playerMaxHp;
    this.player.hp = this.config.playerMaxHp;

    this.stats.maxHp = this.config.playerMaxHp;
    this.stats.hp = this.config.playerMaxHp;
    this.stats.difficulty = diff;
    this.stats.currentStage = this.currentStage;
    this.stats.totalStages = this.totalStages;
    this.stats.maxShards = this.totalStages * 3;

    this.setupCurrentStage();
  }

  public getBiome(stageNum: number): { name: string; skyTop: string; skyBottom: string; pillarColor: string } {
    const fraction = (stageNum - 1) / Math.max(1, this.totalStages - 1);
    const biomeIndex = Math.min(9, Math.floor(fraction * 10));

    const biomes = [
      {
        name: 'Ruínas do Despertar',
        skyTop: '#020617',
        skyBottom: '#0e1726',
        pillarColor: 'rgba(30, 41, 59, 0.6)',
      },
      {
        name: 'Bosque Espectral',
        skyTop: '#042f2e',
        skyBottom: '#021f20',
        pillarColor: 'rgba(19, 78, 74, 0.6)',
      },
      {
        name: 'Fortaleza de Obsidiana',
        skyTop: '#311003',
        skyBottom: '#180702',
        pillarColor: 'rgba(124, 45, 18, 0.6)',
      },
      {
        name: 'Cripta Congelada de Glacies',
        skyTop: '#082f49',
        skyBottom: '#0c1e2e',
        pillarColor: 'rgba(14, 116, 144, 0.6)',
      },
      {
        name: 'Abismo Cósmico do Vazio',
        skyTop: '#1e082b',
        skyBottom: '#0d0214',
        pillarColor: 'rgba(88, 28, 135, 0.6)',
      },
      {
        name: 'Cidade Flutuante dos Antigos',
        skyTop: '#172554',
        skyBottom: '#0f172a',
        pillarColor: 'rgba(59, 130, 246, 0.6)',
      },
      {
        name: 'Labirinto dos Espelhos da Perdição',
        skyTop: '#2e1065',
        skyBottom: '#140b2b',
        pillarColor: 'rgba(147, 51, 234, 0.6)',
      },
      {
        name: 'Caldeira do Apocalipse',
        skyTop: '#450a0a',
        skyBottom: '#1a0404',
        pillarColor: 'rgba(220, 38, 38, 0.6)',
      },
      {
        name: 'Santuário do Eclipse',
        skyTop: '#3b0717',
        skyBottom: '#18020a',
        pillarColor: 'rgba(159, 18, 57, 0.6)',
      },
      {
        name: 'Pináculo Supremo & Trono Primordial',
        skyTop: '#290635',
        skyBottom: '#08010d',
        pillarColor: 'rgba(217, 70, 239, 0.7)',
      },
    ];

    return biomes[biomeIndex] || biomes[0];
  }

  public getStageName(stageNum: number): string {
    if (stageNum === this.totalStages) {
      return `O Trono do Remanescente Primordial (Confronto Final - Andar ${stageNum}/${this.totalStages})`;
    }
    const biome = this.getBiome(stageNum);
    const suffixes = [
      'Entrada dos Templos',
      'Salão das Runas Ancestrais',
      'Passagem Sombria',
      'Pontes do Éter Suspenso',
      'Câmara dos Guardiões',
      'Fenda dos Ecos Temporais',
      'Labirinto dos Espelhos',
      'Torre Alta dos Vigias',
      'Caminho do Santuário Proibido',
      'Altar do Vazio Cósmico',
      'Passo do Vento Cortante',
      'Catacumbas Iluminadas',
      'Bastilha dos Esquecidos',
      'Garganta do Dragão de Pedra',
      'Cúpula Estelar',
      'Pináculo dos Remanescentes',
      'Ponte de Cristal Etéreo',
      'Vestíbulo da Corrupção',
      'Portão dos Sussurros',
      'Câmara de Ascensão Dimensional',
    ];
    const suffix = suffixes[(stageNum - 1) % suffixes.length];
    const isMilestone = stageNum % 25 === 0;
    const milestoneTag = isMilestone ? ' [GUARDIÃO DO MARCO]' : '';
    return `${biome.name} - ${suffix} (Andar ${stageNum})${milestoneTag}`;
  }

  public getNextStageName(stageNum: number): string {
    if (stageNum + 1 === this.totalStages) {
      return `O Trono do Remanescente Primordial (Confronto Final - Andar ${this.totalStages}/${this.totalStages})`;
    }
    return this.getStageName(stageNum + 1);
  }

  private bindInputs() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  public unbind() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.stop();
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const gameKeys = ['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyJ', 'KeyK', 'KeyL', 'KeyZ', 'KeyX', 'KeyC'];
    if (gameKeys.includes(e.code)) {
      e.preventDefault();
    }

    if (!this.keysHeld.has(e.code)) {
      this.keysJustPressed.add(e.code);
    }
    this.keysHeld.add(e.code);

    if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
      this.jumpBufferTimer = 0.12;
    }
    if (e.code === 'KeyJ' || e.code === 'KeyZ') {
      this.attackBufferTimer = 0.12;
    }
    if (e.code === 'KeyL' || e.code === 'KeyC' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this.dashBufferTimer = 0.12;
    }
    if (e.code === 'KeyK' || e.code === 'KeyX') {
      this.castMagic();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keysHeld.delete(e.code);

    if ((e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') && this.player.vy < 0) {
      this.player.vy *= 0.45;
    }
  };

  private handleBlur = () => {
    this.keysHeld.clear();
    this.keysJustPressed.clear();
  };

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.keysHeld.clear();
      this.keysJustPressed.clear();
    }
  };

  public setupCurrentStage() {
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.bossDefeatedTimer = 0;
    this.trauma = 0;
    this.hitstopTimer = 0;
    this.bossEnemy = null;

    const isBossStage = this.currentStage === this.totalStages;
    const isMilestoneBoss = !isBossStage && this.currentStage % 25 === 0;
    const stage = this.currentStage;

    // Platform generation based on stage index
    this.platforms = [
      // Base Floor
      { x: 0, y: 440, w: 2600, h: 60, type: 'solid' },
      { x: -30, y: -200, w: 30, h: 700, type: 'solid' },
      { x: 2600, y: -200, w: 30, h: 700, type: 'solid' },
    ];

    // Stage specific architecture
    if (isBossStage || isMilestoneBoss) {
      // Grand Boss / Guardian Arena
      this.platforms.push(
        { x: 200, y: 350, w: 140, h: 18, type: 'one_way' },
        { x: 420, y: 280, w: 160, h: 18, type: 'one_way' },
        { x: 750, y: 330, w: 180, h: 18, type: 'one_way' },
        { x: 1100, y: 350, w: 200, h: 18, type: 'one_way' },
        { x: 1450, y: 280, w: 180, h: 18, type: 'one_way' },
        // Elevated guardian sanctuary
        { x: 1800, y: 370, w: 750, h: 22, type: 'solid' },
        { x: 1950, y: 270, w: 140, h: 16, type: 'one_way' },
        { x: 2350, y: 270, w: 140, h: 16, type: 'one_way' },
        { x: 2150, y: 190, w: 160, h: 16, type: 'one_way' }
      );
    } else {
      // 4 dynamic architectural archetypes across the 200 stages
      const layoutType = stage % 4;
      if (layoutType === 0) {
        // High moving bridges
        this.platforms.push(
          { x: 240, y: 360, w: 150, h: 18, type: 'one_way' },
          { x: 460, y: 280, w: 140, h: 18, type: 'one_way' },
          { x: 700, y: 320, w: 130, h: 18, type: 'one_way' },
          { x: 920, y: 280, w: 140, h: 18, type: 'moving', minX: 900, maxX: 1080, speed: 45 + Math.min(60, stage * 1.5) },
          { x: 1180, y: 240, w: 160, h: 18, type: 'solid' },
          { x: 1420, y: 310, w: 150, h: 18, type: 'one_way' },
          { x: 1640, y: 240, w: 140, h: 18, type: 'one_way' },
          { x: 1860, y: 300, w: 160, h: 18, type: 'moving', minX: 1840, maxX: 2040, speed: 50 + Math.min(60, stage * 1.5) },
          { x: 2120, y: 360, w: 180, h: 18, type: 'one_way' },
          { x: 2320, y: 430, w: 180, h: 20, type: 'solid' }
        );
      } else if (layoutType === 1) {
        // Terraced ascension
        this.platforms.push(
          { x: 220, y: 340, w: 160, h: 18, type: 'one_way' },
          { x: 450, y: 260, w: 150, h: 18, type: 'solid' },
          { x: 670, y: 200, w: 130, h: 18, type: 'one_way' },
          { x: 860, y: 270, w: 140, h: 18, type: 'one_way' },
          { x: 1080, y: 340, w: 170, h: 18, type: 'moving', minX: 1060, maxX: 1220, speed: 40 + Math.min(50, stage) },
          { x: 1340, y: 260, w: 160, h: 18, type: 'solid' },
          { x: 1580, y: 200, w: 140, h: 18, type: 'one_way' },
          { x: 1800, y: 280, w: 150, h: 18, type: 'one_way' },
          { x: 2050, y: 350, w: 170, h: 18, type: 'one_way' },
          { x: 2320, y: 430, w: 180, h: 20, type: 'solid' }
        );
      } else if (layoutType === 2) {
        // Dual moving platforms & wide gaps
        this.platforms.push(
          { x: 260, y: 370, w: 140, h: 18, type: 'one_way' },
          { x: 480, y: 310, w: 150, h: 18, type: 'moving', minX: 460, maxX: 620, speed: 50 + Math.min(55, stage) },
          { x: 740, y: 250, w: 150, h: 18, type: 'solid' },
          { x: 980, y: 330, w: 140, h: 18, type: 'one_way' },
          { x: 1200, y: 270, w: 160, h: 18, type: 'one_way' },
          { x: 1460, y: 340, w: 150, h: 18, type: 'moving', minX: 1440, maxX: 1620, speed: 55 + Math.min(55, stage) },
          { x: 1720, y: 260, w: 160, h: 18, type: 'solid' },
          { x: 1980, y: 330, w: 140, h: 18, type: 'one_way' },
          { x: 2180, y: 370, w: 150, h: 18, type: 'one_way' },
          { x: 2320, y: 430, w: 180, h: 20, type: 'solid' }
        );
      } else {
        // Floating spires
        this.platforms.push(
          { x: 200, y: 330, w: 130, h: 18, type: 'one_way' },
          { x: 400, y: 250, w: 130, h: 18, type: 'one_way' },
          { x: 620, y: 340, w: 140, h: 18, type: 'one_way' },
          { x: 840, y: 260, w: 150, h: 18, type: 'solid' },
          { x: 1090, y: 320, w: 140, h: 18, type: 'moving', minX: 1070, maxX: 1230, speed: 45 + Math.min(50, stage) },
          { x: 1320, y: 240, w: 140, h: 18, type: 'one_way' },
          { x: 1540, y: 330, w: 150, h: 18, type: 'one_way' },
          { x: 1780, y: 250, w: 150, h: 18, type: 'solid' },
          { x: 2040, y: 340, w: 160, h: 18, type: 'one_way' },
          { x: 2320, y: 430, w: 180, h: 20, type: 'solid' }
        );
      }
    }

    // Collectibles in this stage (Shards & Hearts)
    this.collectibles = [
      { id: stage * 10 + 1, type: 'shard', x: 480, y: 240, w: 20, h: 20, collected: false, hoverOffset: 0 },
      { id: stage * 10 + 2, type: 'shard', x: 1180, y: 220, w: 20, h: 20, collected: false, hoverOffset: 0.8 },
      { id: stage * 10 + 3, type: 'shard', x: 1880, y: 260, w: 20, h: 20, collected: false, hoverOffset: 1.6 },
      { id: stage * 10 + 4, type: 'heart', x: 1400, y: 380, w: 20, h: 20, collected: false, hoverOffset: 2.2 },
    ];

    // Spawn enemies appropriate for this stage
    this.spawnStageEnemies(stage, isBossStage);

    // Reposition Portal
    this.portal.x = 2380;
    this.portal.y = 350;
    this.portal.pulse = 0;
  }

  private spawnStageEnemies(stage: number, isBossStage: boolean) {
    let nextId = stage * 100 + 1;
    this.enemies = [];

    const eliteChance = Math.min(0.9, this.config.eliteChance + (stage - 1) * 0.06);

    const isMilestoneBoss = !isBossStage && stage % 25 === 0;

    if (isBossStage) {
      // Final Stage: Boss + Royal Escort
      const bossHp = this.difficulty === 'hard_master' ? 450 : 280;
      this.bossEnemy = {
        id: nextId++,
        type: 'boss',
        x: 2280,
        y: 290,
        vx: 0,
        vy: 0,
        w: 64,
        h: 80,
        hp: bossHp,
        maxHp: bossHp,
        isDead: false,
        facing: -1,
        isGrounded: true,
        state: 'idle',
        stateTimer: 0,
        attackCooldown: 1.5,
        hitFlashTimer: 0,
        phase: 1,
        isElite: true,
        enraged: false,
      };
      this.enemies.push(this.bossEnemy);

      // Boss Guardians
      this.enemies.push({
        id: nextId++,
        type: 'crawler',
        x: 650,
        y: 400,
        vx: -35,
        vy: 0,
        w: 32,
        h: 24,
        hp: 35,
        maxHp: 35,
        isDead: false,
        facing: -1,
        isGrounded: true,
        state: 'walk',
        stateTimer: 0,
        attackCooldown: 1.2,
        hitFlashTimer: 0,
        isElite: true,
      });

      this.enemies.push({
        id: nextId++,
        type: 'archer',
        x: 1200,
        y: 310,
        vx: 0,
        vy: 0,
        w: 26,
        h: 36,
        hp: 45,
        maxHp: 45,
        isDead: false,
        facing: -1,
        isGrounded: true,
        state: 'idle',
        stateTimer: 0,
        attackCooldown: 2.0,
        hitFlashTimer: 0,
        isElite: true,
      });

    } else if (isMilestoneBoss) {
      // Milestone Floor Guardian Boss (Every 25 floors)
      const milestoneHp = Math.min(360, 160 + stage * 1.4) * (this.difficulty === 'hard_master' ? 1.4 : 1.0);
      this.bossEnemy = {
        id: nextId++,
        type: 'boss',
        x: 2280,
        y: 290,
        vx: 0,
        vy: 0,
        w: 64,
        h: 80,
        hp: Math.round(milestoneHp),
        maxHp: Math.round(milestoneHp),
        isDead: false,
        facing: -1,
        isGrounded: true,
        state: 'idle',
        stateTimer: 0,
        attackCooldown: 1.6,
        hitFlashTimer: 0,
        phase: 1,
        isElite: true,
        enraged: false,
      };
      this.enemies.push(this.bossEnemy);

      this.enemies.push({
        id: nextId++,
        type: 'sentinel',
        x: 1100,
        y: 310,
        vx: 25,
        vy: 0,
        w: 36,
        h: 46,
        hp: 60 + stage * 2,
        maxHp: 60 + stage * 2,
        isDead: false,
        facing: -1,
        isGrounded: true,
        state: 'walk',
        stateTimer: 0,
        attackCooldown: 1.8,
        hitFlashTimer: 0,
        shieldActive: true,
        isElite: true,
      });

    } else {
      // Non-final stage progression
      // Base crawler
      this.enemies.push({
        id: nextId++,
        type: 'crawler',
        x: 480,
        y: 400,
        vx: -35,
        vy: 0,
        w: 32,
        h: 24,
        hp: 30 + stage * 4,
        maxHp: 30 + stage * 4,
        isDead: false,
        facing: -1,
        isGrounded: true,
        state: 'walk',
        stateTimer: 0,
        attackCooldown: 1.2,
        hitFlashTimer: 0,
        isElite: Math.random() < eliteChance,
      });

      // Archer on elevated platform
      if (stage >= 2) {
        this.enemies.push({
          id: nextId++,
          type: 'archer',
          x: 720,
          y: 250,
          vx: 0,
          vy: 0,
          w: 26,
          h: 36,
          hp: 35 + stage * 4,
          maxHp: 35 + stage * 4,
          isDead: false,
          facing: -1,
          isGrounded: true,
          state: 'idle',
          stateTimer: 0,
          attackCooldown: 2.0,
          hitFlashTimer: 0,
          isElite: Math.random() < eliteChance,
        });
      }

      // Sentinel Knight
      if (stage >= 3) {
        this.enemies.push({
          id: nextId++,
          type: 'sentinel',
          x: 1220,
          y: 220,
          vx: 25,
          vy: 0,
          w: 36,
          h: 46,
          hp: 75 + stage * 10,
          maxHp: 75 + stage * 10,
          isDead: false,
          facing: -1,
          isGrounded: true,
          state: 'walk',
          stateTimer: 0,
          attackCooldown: 1.8,
          hitFlashTimer: 0,
          shieldActive: true,
          isElite: Math.random() < eliteChance,
        });
      }

      // Additional enemies for higher stages / Hard Master gauntlet
      if (stage >= 4) {
        this.enemies.push({
          id: nextId++,
          type: 'crawler',
          x: 1500,
          y: 390,
          vx: 40,
          vy: 0,
          w: 32,
          h: 24,
          hp: 35 + stage * 5,
          maxHp: 35 + stage * 5,
          isDead: false,
          facing: 1,
          isGrounded: true,
          state: 'walk',
          stateTimer: 0,
          attackCooldown: 1.0,
          hitFlashTimer: 0,
          isElite: Math.random() < eliteChance,
        });
      }

      if (stage >= 6) {
        this.enemies.push({
          id: nextId++,
          type: 'archer',
          x: 1750,
          y: 210,
          vx: 0,
          vy: 0,
          w: 26,
          h: 36,
          hp: 40 + stage * 5,
          maxHp: 40 + stage * 5,
          isDead: false,
          facing: -1,
          isGrounded: true,
          state: 'idle',
          stateTimer: 0,
          attackCooldown: 1.8,
          hitFlashTimer: 0,
          isElite: true,
        });
      }

      if (stage >= 8) {
        this.enemies.push({
          id: nextId++,
          type: 'sentinel',
          x: 1980,
          y: 380,
          vx: 30,
          vy: 0,
          w: 36,
          h: 46,
          hp: 90 + stage * 10,
          maxHp: 90 + stage * 10,
          isDead: false,
          facing: -1,
          isGrounded: true,
          state: 'walk',
          stateTimer: 0,
          attackCooldown: 1.5,
          hitFlashTimer: 0,
          shieldActive: true,
          isElite: true,
        });
      }
    }
  }

  public advanceToNextStage() {
    if (this.currentStage >= this.totalStages) {
      this.triggerVictory();
      return;
    }

    this.currentStage++;
    this.stats.currentStage = this.currentStage;
    this.stageTimeElapsed = 0;

    // Healing bonus upon completing stage
    const healBonus = this.difficulty === 'facil' ? 2 : 1;
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healBonus);
    this.player.soul = Math.min(this.player.maxSoul, this.player.soul + 30);

    // Reset player position
    this.player.x = 120;
    this.player.y = 350;
    this.player.vx = 0;
    this.player.vy = 0;

    sounds.playShardPickup();
    this.setupCurrentStage();

    this.isPaused = false;
    this.callbacks.onStateChange('playing');
    this.callbacks.onStatsUpdate({ ...this.stats, hp: this.player.hp, soul: Math.round(this.player.soul) });
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public pause() {
    this.isPaused = true;
    this.callbacks.onStateChange('paused');
  }

  public resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
    this.callbacks.onStateChange('playing');
    this.loop(this.lastTime);
  }

  public restart(startingStage?: number) {
    this.currentStage = Math.max(1, Math.min(this.totalStages, startingStage ?? 1));
    this.stageTimeElapsed = 0;
    this.player.x = 120;
    this.player.y = 350;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.hp = this.config.playerMaxHp;
    this.player.maxHp = this.config.playerMaxHp;
    this.player.soul = 50;
    this.player.isInvulnerable = false;
    this.player.isDashing = false;
    this.player.isAttacking = false;

    this.stats = {
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      soul: 50,
      maxSoul: 100,
      shards: (this.currentStage - 1) * 2,
      maxShards: this.totalStages * 3,
      combo: 0,
      maxCombo: 0,
      damageTaken: 0,
      damageDealt: 0,
      enemiesDefeated: (this.currentStage - 1) * 2,
      parriesExecuted: 0,
      timeElapsed: (this.currentStage - 1) * 25,
      difficulty: this.difficulty,
      currentStage: this.currentStage,
      totalStages: this.totalStages,
    };

    this.setupCurrentStage();
    this.callbacks.onStatsUpdate(this.stats);
    this.callbacks.onBossUpdate(this.bossEnemy ? {
      active: true,
      hp: this.bossEnemy.hp,
      maxHp: this.bossEnemy.maxHp,
      phase: this.bossEnemy.phase || 1,
      name: this.currentStage === this.totalStages ? 'Remanescente Primordial' : `Guardião do Marco ${this.currentStage}`,
    } : null);
    this.resume();
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = (currentTime: number) => {
    if (!this.isRunning) return;

    const rawDt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    const dt = clampDeltaTime(rawDt, 0.05);

    if (!this.isPaused) {
      this.update(dt);
    }
    this.render();

    this.keysJustPressed.clear();

    if (this.isRunning && !this.isPaused) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  };

  private update(dt: number) {
    this.stats.timeElapsed += dt;
    this.stageTimeElapsed += dt;

    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 2.2);
    }

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.updateParticles(dt);
      return;
    }

    if (this.config.soulRegenPerSec > 0 && this.player.soul < this.player.maxSoul) {
      this.player.soul = Math.min(this.player.maxSoul, this.player.soul + this.config.soulRegenPerSec * dt);
    }

    this.updatePlayer(dt);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updateCollectibles(dt);
    this.updateFloatingTexts(dt);
    this.updateParticles(dt);

    // Check Transition Portal collision on non-final stages
    if (this.currentStage < this.totalStages) {
      this.portal.pulse += dt * 3;
      const playerBox: Rect = { x: this.player.x, y: this.player.y, w: this.player.w, h: this.player.h };
      const portalBox: Rect = { x: this.portal.x, y: this.portal.y, w: this.portal.w, h: this.portal.h };

      if (aabbCollision(playerBox, portalBox)) {
        // Player reached exit portal!
        this.isPaused = true;
        sounds.playShardPickup();
        const stageName = this.getStageName(this.currentStage);
        const nextStageName = this.getNextStageName(this.currentStage);

        this.callbacks.onStageClear?.(
          this.currentStage,
          this.totalStages,
          stageName,
          nextStageName,
          this.stageTimeElapsed
        );
        this.callbacks.onStateChange('stage_clear');
        return;
      }
    }

    // Camera follow player
    const targetCamX = this.player.x - this.canvas.width * 0.35;
    this.cameraX += (targetCamX - this.cameraX) * 0.12;
    this.cameraX = Math.max(0, Math.min(2600 - this.canvas.width, this.cameraX));

    // Throttled HUD update
    if (performance.now() - this.lastStatsPush > 100) {
      this.lastStatsPush = performance.now();
      this.stats.hp = this.player.hp;
      this.stats.soul = Math.round(this.player.soul);
      this.callbacks.onStatsUpdate({ ...this.stats });

      if (this.bossEnemy && !this.bossEnemy.isDead && this.player.x > 1700) {
        this.callbacks.onBossUpdate({
          active: true,
          hp: this.bossEnemy.hp,
          maxHp: this.bossEnemy.maxHp,
          phase: this.bossEnemy.phase || 1,
          name: this.bossEnemy.enraged ? 'Remanescente Primordial (ENRAGED)' : 'Remanescente Primordial',
        });
      } else {
        this.callbacks.onBossUpdate(null);
      }
    }

    // Check Victory
    if (this.bossEnemy && this.bossEnemy.isDead) {
      this.bossDefeatedTimer += dt;
      if (this.bossDefeatedTimer > 1.2) {
        this.triggerVictory();
      }
    }

    // Check Game Over
    if (this.player.hp <= 0) {
      this.triggerGameOver();
    }
  }

  private updatePlayer(dt: number) {
    const p = this.player;

    if (p.invulnTimer > 0) p.invulnTimer -= dt;
    p.isInvulnerable = p.invulnTimer > 0 || p.isDashing;

    if (p.dashCooldown > 0) p.dashCooldown -= dt;
    if (p.dashTimer > 0) {
      p.dashTimer -= dt;
      if (p.dashTimer <= 0) p.isDashing = false;
    }

    if (p.attackTimer > 0) {
      p.attackTimer -= dt;
      if (p.attackTimer <= 0) p.isAttacking = false;
    }

    if (p.comboResetTimer > 0) {
      p.comboResetTimer -= dt;
      if (p.comboResetTimer <= 0) p.comboStep = 0;
    }

    if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= dt;
    if (this.attackBufferTimer > 0) this.attackBufferTimer -= dt;
    if (this.dashBufferTimer > 0) this.dashBufferTimer -= dt;

    if (p.isGrounded) {
      this.timeSinceGrounded = 0;
    } else {
      this.timeSinceGrounded += dt;
    }

    p.squashX += (1 - p.squashX) * 12 * dt;
    p.squashY += (1 - p.squashY) * 12 * dt;

    if (this.dashBufferTimer > 0 && p.dashCooldown <= 0 && !p.isDashing) {
      this.dashBufferTimer = 0;
      p.isDashing = true;
      p.dashTimer = 0.18;
      p.dashCooldown = this.config.dodgeCooldownSeconds;
      p.vx = p.facing * 380;
      p.vy = 0;
      this.addShake(0.15);
      sounds.playDash();
      this.spawnDashGhost(p.x, p.y, p.facing);
    }

    if (p.isDashing) {
      p.x += p.vx * dt;
      this.spawnDust(p.x + p.w / 2, p.y + p.h, '#38bdf8', 2);
      return;
    }

    const moveLeft = this.keysHeld.has('KeyA') || this.keysHeld.has('ArrowLeft');
    const moveRight = this.keysHeld.has('KeyD') || this.keysHeld.has('ArrowRight');

    const accel = p.isGrounded ? 1500 : 900;
    const maxSpeed = 210;
    const friction = p.isGrounded ? 1400 : 400;

    if (moveLeft && !moveRight) {
      p.vx = Math.max(-maxSpeed, p.vx - accel * dt);
      p.facing = -1;
      p.walkFrame += dt * 10;
    } else if (moveRight && !moveLeft) {
      p.vx = Math.min(maxSpeed, p.vx + accel * dt);
      p.facing = 1;
      p.walkFrame += dt * 10;
    } else {
      if (p.vx > 0) {
        p.vx = Math.max(0, p.vx - friction * dt);
      } else if (p.vx < 0) {
        p.vx = Math.min(0, p.vx + friction * dt);
      }
    }

    const canJump = p.isGrounded || this.timeSinceGrounded <= 0.1;
    if (this.jumpBufferTimer > 0 && canJump) {
      this.jumpBufferTimer = 0;
      this.timeSinceGrounded = 999;
      p.vy = -480;
      p.isGrounded = false;
      p.squashX = 0.8;
      p.squashY = 1.25;
      sounds.playJump();
      this.spawnDust(p.x + p.w / 2, p.y + p.h, '#e2e8f0', 6);
    }

    const gravity = p.vy < 0 ? 1100 : 1400;
    p.vy += gravity * dt;
    p.vy = Math.min(650, p.vy);

    this.moveAndCollide(p, dt);

    if (this.attackBufferTimer > 0 && !p.isAttacking) {
      this.attackBufferTimer = 0;
      this.performAttack();
    }
  }

  private performAttack() {
    const p = this.player;
    p.isAttacking = true;
    p.attackTimer = 0.22;
    p.comboStep = (p.comboStep % 3) + 1;
    p.comboResetTimer = 0.55;

    sounds.playAttackSlash(p.comboStep);
    p.vx += p.facing * (p.comboStep === 3 ? 140 : 80);

    const attackBox: Rect = {
      x: p.facing === 1 ? p.x + p.w : p.x - 42,
      y: p.y - 6,
      w: p.comboStep === 3 ? 52 : 42,
      h: p.h + 12,
    };

    const isCritical = p.comboStep === 3;
    const baseDamage = isCritical ? 24 : 14;

    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;
      const enemyBox: Rect = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };

      if (aabbCollision(attackBox, enemyBox)) {
        if (enemy.type === 'sentinel' && enemy.shieldActive) {
          const isHittingFromFront = (enemy.facing === 1 && p.x < enemy.x) || (enemy.facing === -1 && p.x > enemy.x);
          if (isHittingFromFront && !isCritical) {
            sounds.playHit(false);
            this.spawnFloatingText('DEFLETIDO!', enemy.x + enemy.w / 2, enemy.y, '#94a3b8');
            this.addShake(0.1);
            p.vx = -p.facing * 120;
            continue;
          }
        }

        const dmg = calculateDamage(baseDamage, 1.0, isCritical, false);
        enemy.hp -= dmg;
        enemy.hitFlashTimer = 0.12;
        this.stats.damageDealt += dmg;

        enemy.vx = p.facing * (isCritical ? 180 : 90);
        enemy.vy = -70;

        this.stats.combo++;
        if (this.stats.combo > this.stats.maxCombo) {
          this.stats.maxCombo = this.stats.combo;
        }
        p.soul = Math.min(p.maxSoul, p.soul + (isCritical ? 14 : 7));

        this.addShake(isCritical ? 0.35 : 0.18);
        this.hitstopTimer = isCritical ? 0.06 : 0.03;
        sounds.playHit(isCritical);
        this.spawnBloodSparks(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, isCritical ? '#f59e0b' : '#38bdf8');
        this.spawnFloatingText(isCritical ? `${dmg} CRÍTICO!` : `${dmg}`, enemy.x + enemy.w / 2, enemy.y, isCritical ? '#f59e0b' : '#38bdf8');

        if (enemy.hp <= 0) {
          enemy.isDead = true;
          this.stats.enemiesDefeated++;
          sounds.playEnemyDeath();
          this.spawnDeathBurst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.type === 'boss');
          this.addShake(enemy.type === 'boss' ? 0.8 : 0.4);
        }
      }
    }

    for (const proj of this.projectiles) {
      if (!proj.isPlayer) {
        const projBox: Rect = { x: proj.x - proj.radius, y: proj.y - proj.radius, w: proj.radius * 2, h: proj.radius * 2 };
        if (aabbCollision(attackBox, projBox)) {
          proj.isPlayer = true;
          proj.vx = -proj.vx * 1.5;
          proj.vy = -proj.vy * 0.5;
          proj.color = '#38bdf8';
          proj.damage *= 1.8;
          this.stats.parriesExecuted++;
          p.soul = Math.min(p.maxSoul, p.soul + 25);
          sounds.playParry();
          this.hitstopTimer = 0.08;
          this.addShake(0.3);
          this.spawnFloatingText('PARRY!', proj.x, proj.y - 10, '#38bdf8');
        }
      }
    }
  }

  private castMagic() {
    const p = this.player;
    if (p.soul < 25) {
      this.spawnFloatingText('SEM ALMA!', p.x + p.w / 2, p.y - 10, '#cbd5e1');
      return;
    }

    p.soul -= 25;
    sounds.playMagicCast();
    this.addShake(0.12);

    this.projectiles.push({
      id: Math.random(),
      x: p.facing === 1 ? p.x + p.w + 8 : p.x - 8,
      y: p.y + p.h * 0.4,
      vx: p.facing * 440,
      vy: 0,
      radius: 9,
      isPlayer: true,
      damage: 28,
      lifetime: 1.8,
      color: '#38bdf8',
      piercing: true,
    });
  }

  private moveAndCollide(p: typeof this.player, dt: number) {
    const wasGrounded = p.isGrounded;

    p.x += p.vx * dt;
    for (const plat of this.platforms) {
      if (plat.type === 'solid') {
        const platBox: Rect = { x: plat.x, y: plat.y, w: plat.w, h: plat.h };
        const playerBox: Rect = { x: p.x, y: p.y, w: p.w, h: p.h };
        if (aabbCollision(playerBox, platBox)) {
          if (p.vx > 0) {
            p.x = plat.x - p.w;
            p.vx = 0;
          } else if (p.vx < 0) {
            p.x = plat.x + plat.w;
            p.vx = 0;
          }
        }
      }
    }

    p.y += p.vy * dt;
    p.isGrounded = false;

    for (const plat of this.platforms) {
      const platBox: Rect = { x: plat.x, y: plat.y, w: plat.w, h: plat.h };
      const playerBox: Rect = { x: p.x, y: p.y, w: p.w, h: p.h };

      if (plat.type === 'solid') {
        if (aabbCollision(playerBox, platBox)) {
          if (p.vy > 0) {
            p.y = plat.y - p.h;
            p.vy = 0;
            p.isGrounded = true;
          } else if (p.vy < 0) {
            p.y = plat.y + plat.h;
            p.vy = 0;
          }
        }
      } else if (plat.type === 'one_way' || plat.type === 'moving') {
        const feetPrevY = p.y + p.h - p.vy * dt;
        if (p.vy >= 0 && feetPrevY <= plat.y + 4 && aabbCollision(playerBox, platBox)) {
          p.y = plat.y - p.h;
          p.vy = 0;
          p.isGrounded = true;
        }
      }
    }

    if (!wasGrounded && p.isGrounded) {
      p.squashX = 1.25;
      p.squashY = 0.78;
      this.spawnDust(p.x + p.w / 2, p.y + p.h, '#e2e8f0', 4);
    }
  }

  private updateEnemies(dt: number) {
    const p = this.player;
    const speedMult = this.config.enemySpeedMultiplier;
    const dmgMult = this.config.enemyDmgMultiplier;

    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;

      if (enemy.hitFlashTimer > 0) enemy.hitFlashTimer -= dt;
      if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
      enemy.stateTimer += dt;

      const distToPlayer = Math.hypot((enemy.x + enemy.w / 2) - (p.x + p.w / 2), (enemy.y + enemy.h / 2) - (p.y + p.h / 2));
      const dirToPlayer = p.x > enemy.x ? 1 : -1;

      switch (enemy.type) {
        case 'crawler': {
          if (distToPlayer < 240) {
            enemy.facing = dirToPlayer;
            if (enemy.attackCooldown <= 0 && enemy.isGrounded) {
              enemy.attackCooldown = 2.0 / speedMult;
              enemy.vx = dirToPlayer * 180 * speedMult;
              enemy.vy = -260;
              enemy.isGrounded = false;
              this.spawnDust(enemy.x + enemy.w / 2, enemy.y + enemy.h, '#a855f7', 3);
            }
          } else {
            if (Math.random() < 0.01) enemy.facing *= -1;
            enemy.vx = enemy.facing * 35 * speedMult;
          }

          enemy.vy += 1200 * dt;
          enemy.x += enemy.vx * dt;
          enemy.y += enemy.vy * dt;
          if (enemy.y > 440 - enemy.h) {
            enemy.y = 440 - enemy.h;
            enemy.vy = 0;
            enemy.isGrounded = true;
          }
          break;
        }

        case 'archer': {
          enemy.facing = dirToPlayer;
          if (distToPlayer < 100) {
            enemy.vx = -dirToPlayer * 60 * speedMult;
          } else {
            enemy.vx = 0;
          }
          enemy.x += enemy.vx * dt;

          if (distToPlayer < 400 && enemy.attackCooldown <= 0) {
            enemy.attackCooldown = (this.difficulty === 'hard_master' ? 1.6 : 2.5) / speedMult;
            this.projectiles.push({
              id: Math.random(),
              x: enemy.x + (enemy.facing === 1 ? enemy.w : 0),
              y: enemy.y + 14,
              vx: enemy.facing * 280 * speedMult,
              vy: 0,
              radius: 6,
              isPlayer: false,
              damage: Math.round(1 * dmgMult),
              lifetime: 3.0,
              color: '#c084fc',
            });
          }
          break;
        }

        case 'sentinel': {
          enemy.facing = dirToPlayer;
          if (distToPlayer < 200) {
            enemy.vx = dirToPlayer * 40 * speedMult;
          } else {
            enemy.vx = 0;
          }
          enemy.x += enemy.vx * dt;

          if (distToPlayer < 60 && enemy.attackCooldown <= 0) {
            enemy.attackCooldown = 1.8 / speedMult;
            this.spawnDust(enemy.x + enemy.w / 2, enemy.y + enemy.h, '#fbbf24', 5);
            const sweepBox: Rect = {
              x: enemy.facing === 1 ? enemy.x : enemy.x - 30,
              y: enemy.y,
              w: enemy.w + 30,
              h: enemy.h,
            };
            const playerBox: Rect = { x: p.x, y: p.y, w: p.w, h: p.h };
            if (aabbCollision(sweepBox, playerBox) && !p.isInvulnerable) {
              this.hurtPlayer(Math.round(1 * dmgMult), enemy.facing * 180);
            }
          }
          break;
        }

        case 'boss': {
          const boss = enemy;
          boss.facing = dirToPlayer;

          if (boss.hp < boss.maxHp * 0.5 && boss.phase === 1) {
            boss.phase = 2;
            boss.enraged = true;
            this.addShake(0.5);
            sounds.playBossRoar();
            this.spawnFloatingText('FASE 2: ASAS DA ALMA!', boss.x + boss.w / 2, boss.y - 20, '#f43f5e');
          }

          if (this.difficulty === 'hard_master' && boss.hp < boss.maxHp * 0.3 && !boss.enraged) {
            boss.enraged = true;
            sounds.playBossRoar();
            this.spawnFloatingText('HARD MASTER ENRAGE!', boss.x + boss.w / 2, boss.y - 20, '#e11d48');
          }

          if (boss.phase === 1) {
            if (distToPlayer > 80) {
              boss.vx = dirToPlayer * 55 * speedMult;
            } else {
              boss.vx = 0;
            }
            boss.x += boss.vx * dt;

            if (boss.attackCooldown <= 0) {
              boss.attackCooldown = (boss.enraged ? 1.5 : 2.5) / speedMult;
              sounds.playHit(true);
              this.addShake(0.3);
              this.spawnDust(boss.x + boss.w / 2, boss.y + boss.h, '#f43f5e', 8);

              this.projectiles.push({
                id: Math.random(),
                x: boss.x,
                y: boss.y + boss.h - 10,
                vx: -220 * speedMult,
                vy: 0,
                radius: 12,
                isPlayer: false,
                damage: Math.round(1 * dmgMult),
                lifetime: 2.0,
                color: '#f43f5e',
              });
              this.projectiles.push({
                id: Math.random(),
                x: boss.x + boss.w,
                y: boss.y + boss.h - 10,
                vx: 220 * speedMult,
                vy: 0,
                radius: 12,
                isPlayer: false,
                damage: Math.round(1 * dmgMult),
                lifetime: 2.0,
                color: '#f43f5e',
              });
            }
          } else {
            boss.y = 200 + Math.sin(this.stats.timeElapsed * 2) * 40;
            boss.x += dirToPlayer * 45 * speedMult * dt;

            if (boss.attackCooldown <= 0) {
              boss.attackCooldown = (boss.enraged ? 1.8 : 2.6) / speedMult;
              sounds.playBossRoar();
              this.addShake(0.2);

              const bullets = 8;
              for (let i = 0; i < bullets; i++) {
                const angle = (i / bullets) * Math.PI * 2;
                this.projectiles.push({
                  id: Math.random(),
                  x: boss.x + boss.w / 2,
                  y: boss.y + boss.h / 2,
                  vx: Math.cos(angle) * 160 * speedMult,
                  vy: Math.sin(angle) * 160 * speedMult,
                  radius: 8,
                  isPlayer: false,
                  damage: Math.round(1 * dmgMult),
                  lifetime: 3.5,
                  color: '#fb7185',
                });
              }
            }
          }
          break;
        }
      }

      const enemyBox: Rect = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };
      const playerBox: Rect = { x: p.x, y: p.y, w: p.w, h: p.h };

      if (aabbCollision(enemyBox, playerBox) && !p.isInvulnerable) {
        this.hurtPlayer(Math.round(1 * dmgMult), dirToPlayer * -150);
      }
    }
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.lifetime -= dt;

      if (Math.random() < 0.4) {
        this.spawnParticle(proj.x, proj.y, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, proj.color, 0.3, 3);
      }

      if (proj.lifetime <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      const projBox: Rect = { x: proj.x - proj.radius, y: proj.y - proj.radius, w: proj.radius * 2, h: proj.radius * 2 };

      if (proj.isPlayer) {
        for (const enemy of this.enemies) {
          if (enemy.isDead) continue;
          const enemyBox: Rect = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };
          if (aabbCollision(projBox, enemyBox)) {
            enemy.hp -= proj.damage;
            enemy.hitFlashTimer = 0.12;
            this.stats.damageDealt += proj.damage;
            sounds.playHit(false);
            this.spawnFloatingText(`${proj.damage}`, enemy.x + enemy.w / 2, enemy.y, '#38bdf8');
            this.spawnBloodSparks(proj.x, proj.y, '#38bdf8');

            if (enemy.hp <= 0) {
              enemy.isDead = true;
              this.stats.enemiesDefeated++;
              sounds.playEnemyDeath();
              this.spawnDeathBurst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.type === 'boss');
            }

            if (!proj.piercing) {
              this.projectiles.splice(i, 1);
              break;
            }
          }
        }
      } else {
        const playerBox: Rect = { x: this.player.x, y: this.player.y, w: this.player.w, h: this.player.h };
        if (aabbCollision(projBox, playerBox) && !this.player.isInvulnerable) {
          this.hurtPlayer(proj.damage, proj.vx > 0 ? 120 : -120);
          this.projectiles.splice(i, 1);
        }
      }
    }
  }

  private hurtPlayer(amount: number, knockbackX = 0) {
    const p = this.player;
    if (p.isInvulnerable) return;

    p.hp = Math.max(0, p.hp - amount);
    p.invulnTimer = 0.7;
    p.vx = knockbackX;
    p.vy = -160;
    this.stats.combo = 0;
    this.stats.damageTaken += amount;

    this.addShake(0.4);
    sounds.playHit(true);
    this.hitstopTimer = 0.05;
    this.spawnFloatingText(`-${amount}`, p.x + p.w / 2, p.y - 10, '#ef4444');
    this.spawnBloodSparks(p.x + p.w / 2, p.y + p.h / 2, '#ef4444');
  }

  private updateCollectibles(dt: number) {
    const p = this.player;
    const playerBox: Rect = { x: p.x, y: p.y, w: p.w, h: p.h };

    for (const c of this.collectibles) {
      if (c.collected) continue;
      c.hoverOffset += dt * 3;
      const currentY = c.y + Math.sin(c.hoverOffset) * 4;
      const cBox: Rect = { x: c.x, y: currentY, w: c.w, h: c.h };

      if (aabbCollision(playerBox, cBox)) {
        c.collected = true;
        if (c.type === 'shard') {
          this.stats.shards++;
          p.soul = Math.min(p.maxSoul, p.soul + 20);
          sounds.playShardPickup();
          this.spawnFloatingText('+1 FRAGMENTO', c.x, c.y - 12, '#38bdf8');
          this.spawnDust(c.x + 10, c.y + 10, '#38bdf8', 12);
        } else if (c.type === 'heart') {
          p.hp = Math.min(p.maxHp, p.hp + 1);
          sounds.playShardPickup();
          this.spawnFloatingText('+1 CORAÇÃO', c.x, c.y - 12, '#34d399');
          this.spawnDust(c.x + 10, c.y + 10, '#34d399', 12);
        } else if (c.type === 'lore') {
          sounds.playShardPickup();
          this.spawnFloatingText(c.loreTitle || 'LORE ENCONTRADA', c.x, c.y - 20, '#fbbf24');
        }
      }
    }
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      pt.alpha = pt.life / pt.maxLife;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private spawnParticle(x: number, y: number, vx: number, vy: number, color: string, life = 0.5, size = 3) {
    if (this.particles.length >= this.MAX_PARTICLES) {
      this.particles.shift();
    }
    this.particles.push({ x, y, vx, vy, size, life, maxLife: life, color, alpha: 1 });
  }

  private spawnDust(x: number, y: number, color: string, count = 6) {
    for (let i = 0; i < count; i++) {
      const vx = (Math.random() - 0.5) * 80;
      const vy = -Math.random() * 40;
      this.spawnParticle(x, y, vx, vy, color, 0.4, 2 + Math.random() * 3);
    }
  }

  private spawnBloodSparks(x: number, y: number, color: string) {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 140;
      this.spawnParticle(x, y, Math.cos(angle) * spd, Math.sin(angle) * spd, color, 0.35, 2.5);
    }
  }

  private spawnDeathBurst(x: number, y: number, isBoss = false) {
    const count = isBoss ? 45 : 20;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * 220;
      this.spawnParticle(x, y, Math.cos(angle) * spd, Math.sin(angle) * spd, isBoss ? '#f43f5e' : '#a855f7', 0.8, 3.5);
    }
  }

  private spawnDashGhost(x: number, y: number, facing: number) {
    for (let i = 0; i < 6; i++) {
      this.spawnParticle(x + (Math.random() * 20 - 10), y + (Math.random() * 30), -facing * 40, (Math.random() - 0.5) * 20, '#38bdf8', 0.25, 4);
    }
  }

  private spawnFloatingText(text: string, x: number, y: number, color: string) {
    this.floatingTexts.push({
      id: Math.random(),
      text,
      x,
      y,
      vy: -35,
      life: 0.8,
      maxLife: 0.8,
      color,
      size: 13,
    });
  }

  private addShake(intensity: number) {
    this.trauma = Math.min(1.0, this.trauma + intensity);
  }

  private triggerVictory() {
    this.isRunning = false;
    sounds.playVictory();
    const rankInfo = calculateRank(
      this.stats.timeElapsed,
      this.stats.damageTaken,
      this.stats.shards,
      this.stats.maxShards,
      this.difficulty,
      this.stats.enemiesDefeated
    );

    const snapshot: RunSnapshot = {
      timeSeconds: this.stats.timeElapsed,
      damageTaken: this.stats.damageTaken,
      damageDealt: this.stats.damageDealt,
      shardsCollected: this.stats.shards,
      totalShards: this.stats.maxShards,
      enemiesDefeated: this.stats.enemiesDefeated,
      maxCombo: this.stats.maxCombo,
      parriesExecuted: this.stats.parriesExecuted,
      difficulty: this.difficulty,
      stageReached: this.currentStage,
      totalStages: this.totalStages,
      rank: rankInfo.rank,
      finalScore: rankInfo.score,
      isVictory: true,
    };

    this.callbacks.onStateChange('victory', snapshot);
  }

  private triggerGameOver() {
    this.isRunning = false;
    sounds.playDefeat();
    const rankInfo = calculateRank(
      this.stats.timeElapsed,
      this.stats.damageTaken,
      this.stats.shards,
      this.stats.maxShards,
      this.difficulty,
      this.stats.enemiesDefeated
    );

    const snapshot: RunSnapshot = {
      timeSeconds: this.stats.timeElapsed,
      damageTaken: this.stats.damageTaken,
      damageDealt: this.stats.damageDealt,
      shardsCollected: this.stats.shards,
      totalShards: this.stats.maxShards,
      enemiesDefeated: this.stats.enemiesDefeated,
      maxCombo: this.stats.maxCombo,
      parriesExecuted: this.stats.parriesExecuted,
      difficulty: this.difficulty,
      stageReached: this.currentStage,
      totalStages: this.totalStages,
      rank: rankInfo.rank,
      finalScore: rankInfo.score,
      isVictory: false,
    };

    this.callbacks.onStateChange('gameover', snapshot);
  }

  // ==========================================
  // RENDER PIPELINE
  // ==========================================
  public render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const shakeOffset = this.trauma * this.trauma * 14;
    const shakeX = (Math.random() - 0.5) * shakeOffset;
    const shakeY = (Math.random() - 0.5) * shakeOffset;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    this.renderParallaxBackground(ctx, w, h);

    ctx.translate(-Math.round(this.cameraX) + shakeX, shakeY);

    this.renderPlatforms(ctx);

    // Render Stage Transition Portal on non-final stages
    if (this.currentStage < this.totalStages) {
      this.renderPortal(ctx);
    }

    this.renderCollectibles(ctx);
    this.renderEnemies(ctx);
    this.renderPlayer(ctx);
    this.renderProjectiles(ctx);
    this.renderParticles(ctx);
    this.renderFloatingTexts(ctx);

    ctx.restore();
  }

  private renderParallaxBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const biome = this.getBiome(this.currentStage);
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, biome.skyTop);
    skyGrad.addColorStop(0.6, biome.skyTop);
    skyGrad.addColorStop(1, biome.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137) - this.cameraX * 0.05) % w;
      const sy = (i * 93) % (h * 0.7);
      const starX = sx < 0 ? sx + w : sx;
      ctx.fillRect(starX, sy, 2, 2);
    }

    ctx.fillStyle = 'rgba(10, 15, 30, 0.75)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 100) {
      const worldX = x + this.cameraX * 0.15;
      const y = h - 140 - Math.sin(worldX * 0.005) * 50 - Math.cos(worldX * 0.012) * 30;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = biome.pillarColor;
    for (let i = 0; i < 10; i++) {
      const pillarWorldX = i * 280;
      const screenX = pillarWorldX - this.cameraX * 0.35;
      if (screenX > -100 && screenX < w + 100) {
        ctx.fillRect(screenX, 180, 24, 280);
        ctx.fillRect(screenX - 6, 175, 36, 10);
      }
    }
  }

  private renderPlatforms(ctx: CanvasRenderingContext2D) {
    for (const p of this.platforms) {
      if (p.type === 'solid') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(p.x, p.y, p.w, p.h);

        ctx.fillStyle = '#0284c7';
        ctx.fillRect(p.x, p.y, p.w, 4);

        ctx.fillStyle = '#0ea5e9';
        for (let rx = p.x + 20; rx < p.x + p.w - 20; rx += 50) {
          ctx.fillRect(rx, p.y + 10, 4, 12);
        }

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x, p.y, p.w, p.h);
      } else {
        ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
        ctx.fillRect(p.x, p.y, p.w, p.h);

        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(p.x, p.y, p.w, 3);

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x, p.y, p.w, p.h);
      }
    }
  }

  private renderPortal(ctx: CanvasRenderingContext2D) {
    const p = this.portal;
    const pulseScale = 1 + Math.sin(p.pulse) * 0.08;

    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
    ctx.scale(pulseScale, pulseScale);

    // Outer swirling portal glow
    const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, 42);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#38bdf8');
    grad.addColorStop(0.7, '#818cf8');
    grad.addColorStop(1, 'rgba(129, 140, 248, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // Runic border ring
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 42, p.pulse * 0.5, 0, Math.PI * 2);
    ctx.stroke();

    // Portal label
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PORTAL', 0, -50);

    ctx.restore();
  }

  private renderCollectibles(ctx: CanvasRenderingContext2D) {
    for (const c of this.collectibles) {
      if (c.collected) continue;
      const y = c.y + Math.sin(c.hoverOffset) * 4;

      if (c.type === 'shard') {
        ctx.save();
        ctx.translate(c.x + c.w / 2, y + c.h / 2);
        ctx.rotate(c.hoverOffset * 0.6);

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.lineTo(8, 0);
        ctx.lineTo(0, 9);
        ctx.lineTo(-8, 0);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      } else if (c.type === 'heart') {
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(c.x + 6, y + 6, 6, 0, Math.PI * 2);
        ctx.arc(c.x + 14, y + 6, 6, 0, Math.PI * 2);
        ctx.lineTo(c.x + 10, y + 18);
        ctx.closePath();
        ctx.fill();
      } else if (c.type === 'lore') {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(c.x, y, c.w, c.h);
        ctx.strokeStyle = '#d97706';
        ctx.strokeRect(c.x, y, c.w, c.h);
        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('Ω', c.x + 7, y + 17);
      }
    }
  }

  private renderEnemies(ctx: CanvasRenderingContext2D) {
    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;

      ctx.save();
      if (enemy.hitFlashTimer > 0) {
        ctx.fillStyle = '#ffffff';
      }

      if (enemy.type === 'crawler') {
        ctx.fillStyle = enemy.hitFlashTimer > 0 ? '#fff' : (enemy.isElite ? '#f43f5e' : '#8b5cf6');
        ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);

        ctx.fillStyle = '#ef4444';
        const eyeX = enemy.facing === 1 ? enemy.x + enemy.w - 8 : enemy.x + 4;
        ctx.fillRect(eyeX, enemy.y + 6, 4, 4);

        ctx.strokeStyle = '#6d28d9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(enemy.x + 4, enemy.y + enemy.h);
        ctx.lineTo(enemy.x - 2, enemy.y + enemy.h + 4);
        ctx.moveTo(enemy.x + enemy.w - 4, enemy.y + enemy.h);
        ctx.lineTo(enemy.x + enemy.w + 2, enemy.y + enemy.h + 4);
        ctx.stroke();
      } else if (enemy.type === 'archer') {
        ctx.fillStyle = enemy.hitFlashTimer > 0 ? '#fff' : '#0284c7';
        ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);

        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(enemy.x + (enemy.facing === 1 ? 4 : 2), enemy.y + 2, 14, 12);

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        const bowX = enemy.facing === 1 ? enemy.x + enemy.w + 4 : enemy.x - 4;
        ctx.beginPath();
        ctx.arc(bowX, enemy.y + 18, 12, enemy.facing === 1 ? -Math.PI / 2 : Math.PI / 2, enemy.facing === 1 ? Math.PI / 2 : (Math.PI * 3) / 2);
        ctx.stroke();

        if (enemy.attackCooldown < 0.8) {
          ctx.strokeStyle = 'rgba(192, 132, 252, 0.6)';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(bowX, enemy.y + 18);
          ctx.lineTo(bowX + enemy.facing * 350, enemy.y + 18);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else if (enemy.type === 'sentinel') {
        ctx.fillStyle = enemy.hitFlashTimer > 0 ? '#fff' : '#475569';
        ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);

        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(enemy.facing === 1 ? enemy.x + enemy.w - 10 : enemy.x + 4, enemy.y + 8, 6, 3);

        ctx.fillStyle = enemy.shieldActive ? '#0284c7' : '#64748b';
        const shieldX = enemy.facing === 1 ? enemy.x + enemy.w - 4 : enemy.x - 8;
        ctx.fillRect(shieldX, enemy.y + 6, 12, enemy.h - 12);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(shieldX, enemy.y + 6, 12, enemy.h - 12);
      } else if (enemy.type === 'boss') {
        ctx.fillStyle = enemy.hitFlashTimer > 0 ? '#fff' : (enemy.enraged ? '#881337' : '#1e1b4b');
        ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);

        if (enemy.phase === 2) {
          ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
          ctx.beginPath();
          ctx.ellipse(enemy.x - 20, enemy.y + 20, 36, 14, -0.4, 0, Math.PI * 2);
          ctx.ellipse(enemy.x + enemy.w + 20, enemy.y + 20, 36, 14, 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(enemy.x + 10, enemy.y);
        ctx.lineTo(enemy.x + 16, enemy.y - 14);
        ctx.lineTo(enemy.x + 26, enemy.y);
        ctx.lineTo(enemy.x + 38, enemy.y - 18);
        ctx.lineTo(enemy.x + 48, enemy.y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = enemy.enraged ? '#f43f5e' : '#38bdf8';
        ctx.fillRect(enemy.x + (enemy.facing === 1 ? 36 : 12), enemy.y + 20, 16, 6);
      }

      if (enemy.type !== 'boss') {
        const hpPct = Math.max(0, enemy.hp / enemy.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(enemy.x, enemy.y - 8, enemy.w, 4);
        ctx.fillStyle = enemy.isElite ? '#f43f5e' : '#34d399';
        ctx.fillRect(enemy.x, enemy.y - 8, enemy.w * hpPct, 4);
      }

      ctx.restore();
    }
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    const p = this.player;

    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h);
    ctx.scale(p.squashX, p.squashY);
    ctx.translate(-(p.x + p.w / 2), -(p.y + p.h));

    if (p.isInvulnerable && Math.floor(performance.now() / 60) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(p.x, p.y + 12, p.w, p.h - 12);

    ctx.fillStyle = '#38bdf8';
    const capeW = 12;
    const capeX = p.facing === 1 ? p.x - capeW + 4 : p.x + p.w - 4;
    ctx.fillRect(capeX, p.y + 14, capeW, p.h - 16);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(p.x + 2, p.y, p.w - 4, 14);

    ctx.fillStyle = '#38bdf8';
    const eyeX = p.facing === 1 ? p.x + p.w - 8 : p.x + 4;
    ctx.fillRect(eyeX, p.y + 5, 4, 3);

    if (p.isAttacking) {
      ctx.save();
      ctx.strokeStyle = p.comboStep === 3 ? '#f59e0b' : '#e0f2fe';
      ctx.lineWidth = 4;
      ctx.beginPath();
      const slashCenterX = p.facing === 1 ? p.x + p.w + 10 : p.x - 10;
      ctx.arc(slashCenterX, p.y + p.h / 2, 28, p.facing === 1 ? -Math.PI / 3 : (Math.PI * 2) / 3, p.facing === 1 ? Math.PI / 3 : (Math.PI * 4) / 3);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(p.facing === 1 ? p.x - 3 : p.x + p.w + 1, p.y + 6, 2, 24);
    }

    ctx.restore();
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D) {
    for (const proj of this.projectiles) {
      ctx.save();
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const pt of this.particles) {
      ctx.save();
      ctx.globalAlpha = pt.alpha;
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
      ctx.restore();
    }
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.life / ft.maxLife;
      ctx.fillStyle = ft.color;
      ctx.font = `bold ${ft.size}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}
