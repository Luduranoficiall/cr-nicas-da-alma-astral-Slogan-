/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DIFFICULTY_PRESETS,
  getDifficultyConfig,
  clampDeltaTime,
  aabbCollision,
  calculateDamage,
  calculateParrySuccess,
  calculateSoulGain,
  coyoteJumpEligible,
  bufferActionEligible,
  calculateRank,
  isFinalStage,
  getNextStage,
} from './rules';

test('Difficulty presets define all 4 required difficulties', () => {
  const difficulties = ['facil', 'medio', 'dificil', 'hard_master'] as const;
  for (const diff of difficulties) {
    const config = getDifficultyConfig(diff);
    assert.ok(config, `Missing config for ${diff}`);
    assert.equal(config.id, diff);
    assert.ok(config.playerMaxHp > 0);
    assert.ok(config.enemyDmgMultiplier > 0);
    assert.ok(config.parryWindowSeconds > 0);
  }

  // Hard Master must be the most lethal
  const facil = getDifficultyConfig('facil');
  const hardMaster = getDifficultyConfig('hard_master');
  assert.ok(hardMaster.enemyDmgMultiplier > facil.enemyDmgMultiplier);
  assert.ok(hardMaster.parryWindowSeconds < facil.parryWindowSeconds);
  assert.ok(hardMaster.playerMaxHp < facil.playerMaxHp);
});

test('clampDeltaTime limits raw dt to maxDt (0.05 default)', () => {
  assert.equal(clampDeltaTime(0.016), 0.016);
  assert.equal(clampDeltaTime(0.2), 0.05);
  assert.equal(clampDeltaTime(1.5), 0.05);
  assert.equal(clampDeltaTime(0), 0.016);
  assert.equal(clampDeltaTime(-0.1), 0.016);
});

test('aabbCollision accurately identifies overlaps and separations', () => {
  const box1 = { x: 10, y: 10, w: 20, h: 20 };
  const overlappingBox = { x: 25, y: 25, w: 20, h: 20 };
  const distantBox = { x: 100, y: 100, w: 20, h: 20 };

  assert.equal(aabbCollision(box1, overlappingBox), true);
  assert.equal(aabbCollision(box1, distantBox), false);
});

test('calculateDamage handles multipliers, criticals, and shielding', () => {
  // Base 10, mult 1.0 -> 10
  assert.equal(calculateDamage(10, 1.0, false, false), 10);
  // Base 10, mult 2.1 (Hard Master) -> 21
  assert.equal(calculateDamage(10, 2.1, false, false), 21);
  // Base 10, mult 1.0, critical 1.75 -> 18
  assert.equal(calculateDamage(10, 1.0, true, false), 18);
  // Base 10, defending (80% reduction) -> 2
  assert.equal(calculateDamage(10, 1.0, false, true), 2);
  // Never less than 1
  assert.equal(calculateDamage(1, 0.1, false, true), 1);
});

test('calculateParrySuccess checks timing within active window', () => {
  const windowSec = 0.22;
  assert.equal(calculateParrySuccess(0.1, windowSec), true);
  assert.equal(calculateParrySuccess(0.22, windowSec), true);
  assert.equal(calculateParrySuccess(0.25, windowSec), false);
  assert.equal(calculateParrySuccess(-0.01, windowSec), false);
});

test('coyoteJumpEligible and bufferActionEligible work within thresholds', () => {
  assert.equal(coyoteJumpEligible(0.05, 0.1), true);
  assert.equal(coyoteJumpEligible(0.15, 0.1), false);

  assert.equal(bufferActionEligible(0.08, 0.12), true);
  assert.equal(bufferActionEligible(0.18, 0.12), false);
});

test('calculateRank calculates score based on speed, damage and difficulty', () => {
  // Hard master flawless run
  const masterRun = calculateRank(60, 0, 5, 5, 'hard_master', 10);
  assert.equal(masterRun.rank, 'S+');
  assert.ok(masterRun.score > 20000);

  // Casual run
  const easyRun = calculateRank(300, 20, 2, 5, 'facil', 4);
  assert.ok(easyRun.score < masterRun.score);
});

test('Difficulty levels define correct stage counts (Hard Master has maximum 200 stages)', () => {
  assert.equal(getDifficultyConfig('facil').totalStages, 50);
  assert.equal(getDifficultyConfig('medio').totalStages, 100);
  assert.equal(getDifficultyConfig('dificil').totalStages, 150);
  assert.equal(getDifficultyConfig('hard_master').totalStages, 200);
});

test('Stage progression helpers correctly identify final stage and next stage', () => {
  // Fácil (50 stages)
  assert.equal(isFinalStage(1, 'facil'), false);
  assert.equal(isFinalStage(49, 'facil'), false);
  assert.equal(isFinalStage(50, 'facil'), true);
  assert.equal(getNextStage(1, 'facil'), 2);
  assert.equal(getNextStage(50, 'facil'), null);

  // Hard Master (200 stages)
  assert.equal(isFinalStage(1, 'hard_master'), false);
  assert.equal(isFinalStage(199, 'hard_master'), false);
  assert.equal(isFinalStage(200, 'hard_master'), true);
  assert.equal(getNextStage(1, 'hard_master'), 2);
  assert.equal(getNextStage(199, 'hard_master'), 200);
  assert.equal(getNextStage(200, 'hard_master'), null);
});

test('AchievementManager supports unlocking, catalog lookup, and export/import', async () => {
  const { AchievementManager, ACHIEVEMENTS_CATALOG } = await import('./achievements.ts');
  const mgr = new AchievementManager();

  assert.ok(ACHIEVEMENTS_CATALOG.length >= 10, 'Catalog should have at least 10 achievements');
  assert.ok(ACHIEVEMENTS_CATALOG.some(a => a.id === 'floor_200'));

  // Test export
  const exported = mgr.exportSave();
  assert.ok(typeof exported === 'string');
  const parsed = JSON.parse(exported);
  assert.equal(parsed.gameTitle, 'Remanescente da Alma');

  // Test import
  const testSave = JSON.stringify({
    version: 1,
    gameTitle: 'Remanescente da Alma',
    highestFloors: { facil: 10, medio: 25, dificil: 50, hard_master: 200 },
    unlockedAchievements: ['first_blood', 'floor_200'],
  });

  const result = mgr.importSave(testSave);
  assert.equal(result.success, true);
  assert.equal(mgr.isUnlocked('floor_200'), true);
  assert.equal(mgr.isUnlocked('first_blood'), true);
});



