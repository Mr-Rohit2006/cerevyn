import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseGameTimerReturn {
  elapsedSeconds: number;
  isRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

/**
 * Custom hook for game elapsed active time tracking.
 * Uses interval with precise wall-clock delta calculation to prevent drift.
 */
export function useGameTimer(autoStart = false): UseGameTimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);

  const startTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef<number>(0);
  const intervalIdRef = useRef<number | null>(null);

  const clearTimerInterval = useCallback(() => {
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    startTimeRef.current = Date.now();
  }, [isRunning]);

  const stopTimer = useCallback(() => {
    if (!isRunning) return;
    if (startTimeRef.current !== null) {
      accumulatedRef.current += (Date.now() - startTimeRef.current) / 1000;
      startTimeRef.current = null;
    }
    clearTimerInterval();
    setIsRunning(false);
  }, [isRunning, clearTimerInterval]);

  const resetTimer = useCallback(() => {
    clearTimerInterval();
    startTimeRef.current = null;
    accumulatedRef.current = 0;
    setElapsedSeconds(0);
    setIsRunning(false);
  }, [clearTimerInterval]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      intervalIdRef.current = window.setInterval(() => {
        if (startTimeRef.current !== null) {
          const currentDelta = (Date.now() - startTimeRef.current) / 1000;
          const totalSecs = Math.floor(accumulatedRef.current + currentDelta);
          setElapsedSeconds(totalSecs);
        }
      }, 250);
    } else {
      clearTimerInterval();
    }

    return () => {
      clearTimerInterval();
    };
  }, [isRunning, clearTimerInterval]);

  return {
    elapsedSeconds,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
  };
}
