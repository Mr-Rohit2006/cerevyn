import { useReducer, useEffect, useRef, useCallback, useState } from 'react';
import confetti from 'canvas-confetti';
import { Difficulty, DifficultyDecision, SessionResult } from '../types/game';
import {
  gameReducer,
  createInitialState,
} from '../game/gameReducer';
import { evaluateDifficulty } from '../game/difficulty';
import {
  loadSessionHistory,
  saveSessionResult,
  clearSessionHistory as clearStorageHistory,
} from '../game/sessionStorage';
import { useGameTimer } from './useGameTimer';

export interface UseMemoryGameOptions {
  initialDifficulty?: Difficulty;
  initialSeed?: string | null;
  mismatchDurationMs?: number;
}

export function useMemoryGame({
  initialDifficulty = 'easy',
  initialSeed = null,
  mismatchDurationMs = 900,
}: UseMemoryGameOptions = {}) {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    () => createInitialState(initialDifficulty, initialSeed)
  );

  const timer = useGameTimer(false);
  const mismatchTimeoutRef = useRef<number | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionResult[]>(() =>
    loadSessionHistory()
  );
  const [difficultyDecision, setDifficultyDecision] = useState<DifficultyDecision | null>(
    null
  );
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [activeSeed, setActiveSeed] = useState<string | null>(initialSeed);

  // Clear any pending mismatch timer safely
  const clearPendingMismatchTimeout = useCallback(() => {
    if (mismatchTimeoutRef.current !== null) {
      window.clearTimeout(mismatchTimeoutRef.current);
      mismatchTimeoutRef.current = null;
    }
  }, []);

  // Card click handler
  const handleCardClick = useCallback(
    (cardId: string) => {
      // If timer is not running and game is not completed, start timer on first action
      if (!timer.isRunning && state.gameStatus !== 'completed') {
        timer.startTimer();
      }
      dispatch({ type: 'SELECT_CARD', payload: { cardId } });
    },
    [timer, state.gameStatus]
  );

  // Handle mismatch resolution timer
  useEffect(() => {
    if (state.isResolvingMismatch) {
      const currentRoundId = state.roundId;
      clearPendingMismatchTimeout();

      mismatchTimeoutRef.current = window.setTimeout(() => {
        dispatch({
          type: 'RESOLVE_MISMATCH',
          payload: { roundId: currentRoundId },
        });
        mismatchTimeoutRef.current = null;
      }, mismatchDurationMs);
    }

    return () => {
      // Don't auto-clear on every re-render, only on unmount or when condition changes
    };
  }, [state.isResolvingMismatch, state.roundId, mismatchDurationMs, clearPendingMismatchTimeout]);

  // Handle victory completion
  useEffect(() => {
    if (state.gameStatus === 'completed' && !showVictoryModal) {
      timer.stopTimer();
      clearPendingMismatchTimeout();

      // Evaluate difficulty adaptation based on final performance
      const decision = evaluateDifficulty(
        state.difficulty,
        state.moves,
        timer.elapsedSeconds
      );
      setDifficultyDecision(decision);
      setShowVictoryModal(true);

      // Save anonymous session result
      const newResult: SessionResult = {
        roundId: state.roundId,
        completedAt: new Date().toISOString(),
        difficulty: state.difficulty,
        moves: state.moves,
        elapsedSeconds: timer.elapsedSeconds,
        totalPairs: state.totalPairs,
        nextDifficulty: decision.nextDifficulty,
        recommendationReason: decision.reason,
      };

      const updatedHistory = saveSessionResult(newResult);
      setSessionHistory(updatedHistory);

      // Celebration effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Non-critical if canvas confetti fails in certain test environments
      }
    }
  }, [
    state.gameStatus,
    state.difficulty,
    state.moves,
    state.roundId,
    state.totalPairs,
    timer,
    showVictoryModal,
    clearPendingMismatchTimeout,
  ]);

  // Restart game safely (cleans timers, old callbacks cannot mutate restarted game)
  const restartGame = useCallback(
    (newDifficulty?: Difficulty, newSeed?: string | null) => {
      clearPendingMismatchTimeout();
      timer.resetTimer();
      setShowVictoryModal(false);
      setDifficultyDecision(null);

      const chosenDifficulty = newDifficulty ?? state.difficulty;
      const chosenSeed = newSeed !== undefined ? newSeed : activeSeed;
      setActiveSeed(chosenSeed);

      dispatch({
        type: 'RESET_GAME',
        payload: {
          difficulty: chosenDifficulty,
          seed: chosenSeed,
        },
      });
    },
    [clearPendingMismatchTimeout, timer, state.difficulty, activeSeed]
  );

  // Play next round adapting to recommendation
  const playNextRound = useCallback(
    (useRecommendation = true) => {
      const targetDifficulty =
        useRecommendation && difficultyDecision
          ? difficultyDecision.nextDifficulty
          : state.difficulty;
      restartGame(targetDifficulty, activeSeed);
    },
    [difficultyDecision, state.difficulty, restartGame, activeSeed]
  );

  // Manual difficulty switch
  const changeDifficulty = useCallback(
    (newDifficulty: Difficulty) => {
      restartGame(newDifficulty, activeSeed);
    },
    [restartGame, activeSeed]
  );

  // Clear session history
  const handleClearHistory = useCallback(() => {
    clearStorageHistory();
    setSessionHistory([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPendingMismatchTimeout();
    };
  }, [clearPendingMismatchTimeout]);

  return {
    state,
    timer,
    difficultyDecision,
    showVictoryModal,
    sessionHistory,
    activeSeed,
    setActiveSeed,
    handleCardClick,
    restartGame,
    playNextRound,
    changeDifficulty,
    closeVictoryModal: () => setShowVictoryModal(false),
    clearHistory: handleClearHistory,
  };
}
