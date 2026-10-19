import { Difficulty, DifficultyConfig, DifficultyDecision } from '../types/game';

/**
 * Centralized, configurable thresholds for difficulty adaptation.
 * Rule-based adaptation:
 * - Easy -> Hard: Player must complete the 4x4 grid (8 pairs) within MAX_MOVES and MAX_TIME.
 * - Easy -> Easy: Player exceeded moves or time threshold; remains at Easy to reinforce memory.
 * - Hard -> Hard: Player completed the 6x6 grid (18 pairs) within Hard thresholds (strong performance).
 * - Hard -> Easy: Player struggled on 6x6 grid (exceeded moves or time); adjusted back to Easy.
 */
export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    name: 'easy',
    label: 'Easy (4 × 4)',
    gridRows: 4,
    gridCols: 4,
    totalCards: 16,
    totalPairs: 8,
    maxRecommendedMoves: 14, // Minimum possible is 8; optimal is 10-14
    maxRecommendedTimeSeconds: 40, // 40 seconds
  },
  hard: {
    name: 'hard',
    label: 'Hard (6 × 6)',
    gridRows: 6,
    gridCols: 6,
    totalCards: 36,
    totalPairs: 18,
    maxRecommendedMoves: 40, // Minimum possible is 18; optimal is 26-40
    maxRecommendedTimeSeconds: 110, // 110 seconds
  },
};

/**
 * Pure rule-based difficulty evaluator.
 * Evaluates player performance against configurable thresholds and returns
 * the next difficulty level alongside a clear human-readable explanation.
 */
export function evaluateDifficulty(
  currentDifficulty: Difficulty,
  moves: number,
  elapsedSeconds: number,
  customConfigs?: Partial<Record<Difficulty, Partial<DifficultyConfig>>>
): DifficultyDecision {
  const currentConfig: DifficultyConfig = {
    ...DIFFICULTY_CONFIGS[currentDifficulty],
    ...(customConfigs?.[currentDifficulty] || {}),
  };

  const movesThreshold = currentConfig.maxRecommendedMoves;
  const timeThreshold = currentConfig.maxRecommendedTimeSeconds;

  const metMoves = moves <= movesThreshold;
  const metTime = elapsedSeconds <= timeThreshold;

  let nextDifficulty: Difficulty = currentDifficulty;
  let reason = '';
  let promoted = false;
  let demoted = false;
  let retained = false;

  if (currentDifficulty === 'easy') {
    if (metMoves && metTime) {
      nextDifficulty = 'hard';
      promoted = true;
      reason = `Promoted to Hard! Excellent run with ${moves} moves (threshold ≤ ${movesThreshold}) and finished in ${elapsedSeconds}s (threshold ≤ ${timeThreshold}s).`;
    } else {
      nextDifficulty = 'easy';
      retained = true;
      const reasons: string[] = [];
      if (!metMoves) reasons.push(`moves (${moves} > ${movesThreshold})`);
      if (!metTime) reasons.push(`time (${elapsedSeconds}s > ${timeThreshold}s)`);
      reason = `Remaining on Easy. Target threshold exceeded for ${reasons.join(' and ')}. Keep practicing to unlock Hard mode!`;
    }
  } else {
    // Current difficulty is hard
    if (metMoves && metTime) {
      nextDifficulty = 'hard';
      retained = true;
      reason = `Retained at Hard! Masterful run with ${moves} moves (threshold ≤ ${movesThreshold}) in ${elapsedSeconds}s (threshold ≤ ${timeThreshold}s).`;
    } else {
      nextDifficulty = 'easy';
      demoted = true;
      const reasons: string[] = [];
      if (!metMoves) reasons.push(`moves (${moves} > ${movesThreshold})`);
      if (!metTime) reasons.push(`time (${elapsedSeconds}s > ${timeThreshold}s)`);
      reason = `Adjusted back to Easy. Hard mode thresholds exceeded for ${reasons.join(' and ')}. A quick refresher round on Easy will build momentum!`;
    }
  }

  return {
    nextDifficulty,
    currentDifficulty,
    reason,
    moves,
    movesThreshold,
    elapsedSeconds,
    timeThreshold,
    metMoves,
    metTime,
    promoted,
    demoted,
    retained,
  };
}
