/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { Difficulty, GameState, PlayerStats, RunSnapshot } from './game/types';
import { DIFFICULTY_PRESETS } from './game/rules';
import { sounds } from './game/audio';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { PauseModal } from './components/PauseModal';
import { StageClearModal } from './components/StageClearModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { DocumentationModal } from './components/DocumentationModal';
import { AchievementsModal } from './components/AchievementsModal';
import { AchievementToast } from './components/AchievementToast';
import { achievementManager } from './game/achievements';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // High-level App State
  const [gameState, setGameState] = useState<GameState>('title');
  const [difficulty, setDifficulty] = useState<Difficulty>('medio');
  const [isDocOpen, setIsDocOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Stage Clear Info
  const [stageClearInfo, setStageClearInfo] = useState<{
    currentStage: number;
    totalStages: number;
    stageName: string;
    nextStageName: string;
    stageTime: number;
  }>({
    currentStage: 1,
    totalStages: DIFFICULTY_PRESETS.medio.totalStages,
    stageName: 'As Ruínas do Despertar',
    nextStageName: 'O Bosque Espectral',
    stageTime: 0,
  });

  // Live Stats for HUD (throttled from engine)
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    hp: 4,
    maxHp: 4,
    soul: 50,
    maxSoul: 100,
    shards: 0,
    maxShards: 15,
    combo: 0,
    maxCombo: 0,
    damageTaken: 0,
    damageDealt: 0,
    enemiesDefeated: 0,
    parriesExecuted: 0,
    timeElapsed: 0,
    difficulty: 'medio',
    currentStage: 1,
    totalStages: DIFFICULTY_PRESETS.medio.totalStages,
  });

  // Boss state for HUD
  const [bossState, setBossState] = useState<{
    active: boolean;
    hp: number;
    maxHp: number;
    phase: number;
    name: string;
  } | null>(null);

  // Snapshot for Game Over / Victory
  const [runSnapshot, setRunSnapshot] = useState<RunSnapshot | null>(null);

  // Sync state to body dataset
  useEffect(() => {
    const stateAttr = gameState === 'victory' ? 'gameover' : (gameState === 'stage_clear' ? 'playing' : gameState);
    document.body.dataset.state = stateAttr;
  }, [gameState]);

  // Handle Resize
  const handleResize = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  // Initialize Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    handleResize();
    window.addEventListener('resize', handleResize);

    const engine = new GameEngine(canvasRef.current, {
      onStatsUpdate: (stats) => {
        setPlayerStats(stats);
        achievementManager.checkPlayerProgress(stats);
        achievementManager.recordHighestFloor(stats.difficulty, stats.currentStage);
      },
      onStateChange: (newState, snapshot) => {
        setGameState(newState);
        if (snapshot) {
          setRunSnapshot(snapshot);
        }
      },
      onBossUpdate: (boss) => {
        setBossState(boss);
      },
      onStageClear: (currentStage, totalStages, stageName, nextStageName, stageTime) => {
        achievementManager.checkPlayerProgress(playerStats, { bossDefeated: bossState?.hp === 0 });
        setStageClearInfo({
          currentStage,
          totalStages,
          stageName,
          nextStageName,
          stageTime,
        });
      },
    });

    engine.setDifficulty(difficulty);
    engineRef.current = engine;

    // Check for ?autostart=1 query parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setGameState('playing');
      engine.start();
    } else {
      engine.render();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.unbind();
    };
  }, []);

  // Sync difficulty changes with engine
  const handleSelectDifficulty = (newDiff: Difficulty) => {
    setDifficulty(newDiff);
    if (engineRef.current) {
      engineRef.current.setDifficulty(newDiff);
    }
  };

  // Start Game
  const handleStartGame = useCallback((startingFloor = 1) => {
    if (!engineRef.current) return;
    if (startingFloor > 1) {
      achievementManager.unlock('astral_elevator');
    }
    setGameState('playing');
    engineRef.current.setDifficulty(difficulty, startingFloor);
    engineRef.current.start();
  }, [difficulty]);

  // Next Stage
  const handleNextStage = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.advanceToNextStage();
    setGameState('playing');
  }, []);

  // Pause / Resume
  const handlePause = useCallback(() => {
    if (!engineRef.current || gameState !== 'playing') return;
    engineRef.current.pause();
    setGameState('paused');
  }, [gameState]);

  const handleResume = useCallback(() => {
    if (!engineRef.current || gameState !== 'paused') return;
    engineRef.current.resume();
    setGameState('playing');
  }, [gameState]);

  const handleRestart = useCallback((targetFloor?: number) => {
    if (!engineRef.current) return;
    setGameState('playing');
    setRunSnapshot(null);
    engineRef.current.restart(targetFloor);
  }, []);

  const handleGoTitle = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.stop();
    setGameState('title');
    setRunSnapshot(null);
    engineRef.current.render();
  }, []);

  const handleToggleMute = useCallback(() => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  }, []);

  // Global Keyboard listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // In Title screen: Space or Enter starts game
      if (gameState === 'title') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleStartGame();
        } else if (e.code === 'KeyH' || e.code === 'Tab') {
          e.preventDefault();
          setIsDocOpen((prev) => !prev);
        }
        return;
      }

      // In Stage Clear: Space or Enter advances to next stage
      if (gameState === 'stage_clear') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleNextStage();
        } else if (e.code === 'KeyH') {
          e.preventDefault();
          setIsDocOpen(true);
        }
        return;
      }

      // In Playing: Escape or P pauses, H opens doc, M mutes, R restarts
      if (gameState === 'playing') {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          e.preventDefault();
          handlePause();
        } else if (e.code === 'KeyH') {
          e.preventDefault();
          handlePause();
          setIsDocOpen(true);
        } else if (e.code === 'KeyM') {
          e.preventDefault();
          handleToggleMute();
        } else if (e.code === 'KeyR') {
          e.preventDefault();
          handleRestart();
        }
        return;
      }

      // In Paused: Escape resumes
      if (gameState === 'paused') {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          e.preventDefault();
          handleResume();
        } else if (e.code === 'KeyH') {
          e.preventDefault();
          setIsDocOpen((prev) => !prev);
        }
        return;
      }

      // In Game Over or Victory: Space or Enter restarts
      if (gameState === 'gameover' || gameState === 'victory') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleRestart();
        } else if (e.code === 'KeyH') {
          e.preventDefault();
          setIsDocOpen(true);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, handleStartGame, handleNextStage, handlePause, handleResume, handleRestart, handleToggleMute]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      
      {/* Isolated Canvas Container */}
      <canvas
        ref={canvasRef}
        data-testid="game-canvas"
        className="absolute inset-0 w-full h-full block cursor-crosshair"
      />

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <TitleScreen
          currentDifficulty={difficulty}
          onSelectDifficulty={handleSelectDifficulty}
          onStartGame={handleStartGame}
          onOpenDoc={() => setIsDocOpen(true)}
          onOpenAchievements={() => setIsAchievementsOpen(true)}
        />
      )}

      {/* Playing HUD Overlay */}
      {gameState === 'playing' && (
        <GameHUD
          stats={playerStats}
          difficulty={difficulty}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={handlePause}
          onOpenDoc={() => {
            handlePause();
            setIsDocOpen(true);
          }}
          onOpenAchievements={() => {
            handlePause();
            setIsAchievementsOpen(true);
          }}
          onRestart={handleRestart}
          boss={bossState}
        />
      )}

      {/* Stage Clear Transition Modal */}
      {gameState === 'stage_clear' && (
        <StageClearModal
          isOpen={true}
          currentStage={stageClearInfo.currentStage}
          totalStages={stageClearInfo.totalStages}
          difficulty={difficulty}
          stageName={stageClearInfo.stageName}
          nextStageName={stageClearInfo.nextStageName}
          stageTime={stageClearInfo.stageTime}
          shardsFound={playerStats.shards}
          onNextStage={handleNextStage}
          onGoTitle={handleGoTitle}
          onOpenDoc={() => setIsDocOpen(true)}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'paused' && (
        <PauseModal
          isOpen={true}
          onResume={handleResume}
          onRestart={handleRestart}
          onGoTitle={handleGoTitle}
          onOpenDoc={() => setIsDocOpen(true)}
          onOpenAchievements={() => setIsAchievementsOpen(true)}
          currentDifficulty={difficulty}
          onChangeDifficulty={handleSelectDifficulty}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <GameOverModal
          isOpen={true}
          snapshot={runSnapshot}
          onRestart={handleRestart}
          onGoTitle={handleGoTitle}
          onOpenDoc={() => setIsDocOpen(true)}
        />
      )}

      {/* Victory Modal */}
      {gameState === 'victory' && (
        <VictoryModal
          isOpen={true}
          snapshot={runSnapshot}
          onRestart={handleRestart}
          onGoTitle={handleGoTitle}
          onOpenDoc={() => setIsDocOpen(true)}
        />
      )}

      {/* In-Game Documentation & Technical Manual */}
      <DocumentationModal
        isOpen={isDocOpen}
        onClose={() => setIsDocOpen(false)}
      />

      {/* Conquistas & Hall da Fama Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        currentDifficulty={difficulty}
      />

      {/* Floating Real-time Achievement Toast */}
      <AchievementToast />

    </div>
  );
}
