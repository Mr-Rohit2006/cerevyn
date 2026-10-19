export type Difficulty = 'easy' | 'hard';

export interface DifficultyConfig {
  name: Difficulty;
  label: string;
  gridRows: number;
  gridCols: number;
  totalCards: number;
  totalPairs: number;
  maxRecommendedMoves: number;
  maxRecommendedTimeSeconds: number;
}

export interface CardItem {
  id: string; // unique card id in the deck, e.g. "card-0", "card-1"
  pairId: number; // identifier of the pair (0 to totalPairs - 1)
  symbol: string; // icon identifier or symbol name
  label: string; // accessible description
  isFlipped: boolean;
  isMatched: boolean;
  isMismatching?: boolean; // temporary highlight for mismatch
}

export interface GameStats {
  moves: number;
  completedPairs: number;
  totalPairs: number;
  elapsedSeconds: number;
  difficulty: Difficulty;
  isVictory: boolean;
  gameStatus: 'idle' | 'playing' | 'completed';
}

export interface DifficultyDecision {
  nextDifficulty: Difficulty;
  currentDifficulty: Difficulty;
  reason: string;
  moves: number;
  movesThreshold: number;
  elapsedSeconds: number;
  timeThreshold: number;
  metMoves: boolean;
  metTime: boolean;
  promoted: boolean;
  demoted: boolean;
  retained: boolean;
}

export interface SessionResult {
  roundId: string;
  completedAt: string; // ISO timestamp
  difficulty: Difficulty;
  moves: number;
  elapsedSeconds: number;
  totalPairs: number;
  nextDifficulty: Difficulty;
  recommendationReason: string;
}
