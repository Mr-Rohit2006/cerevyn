import React from 'react';
import { Timer, MousePointerClick, CheckCircle2, Flame } from 'lucide-react';
import { Difficulty } from '../types/game';
import { DIFFICULTY_CONFIGS } from '../game/difficulty';

interface GameStatsProps {
  difficulty: Difficulty;
  moves: number;
  completedPairs: number;
  totalPairs: number;
  elapsedSeconds: number;
  gameStatus: 'idle' | 'playing' | 'completed';
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const GameStats: React.FC<GameStatsProps> = ({
  difficulty,
  moves,
  completedPairs,
  totalPairs,
  elapsedSeconds,
  gameStatus,
}) => {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const percentComplete = Math.round((completedPairs / totalPairs) * 100);

  return (
    <div className="game-stats-container" role="status" aria-label="Game performance statistics">
      <div className="stat-card" data-testid="stat-difficulty">
        <div className="stat-header">
          <Flame className="stat-icon difficulty-icon" size={18} aria-hidden="true" />
          <span className="stat-label">Difficulty</span>
        </div>
        <div className="stat-value difficulty-badge">
          <span className={`badge-pill badge-${difficulty}`}>
            {difficulty.toUpperCase()} ({config.gridRows}×{config.gridCols})
          </span>
        </div>
        <div className="stat-subtext">
          Target: ≤{config.maxRecommendedMoves} moves / ≤{config.maxRecommendedTimeSeconds}s
        </div>
      </div>

      <div className="stat-card" data-testid="stat-moves">
        <div className="stat-header">
          <MousePointerClick className="stat-icon moves-icon" size={18} aria-hidden="true" />
          <span className="stat-label">Moves</span>
        </div>
        <div className="stat-value" data-testid="moves-counter">
          {moves}
        </div>
        <div className="stat-subtext">
          {moves > config.maxRecommendedMoves ? (
            <span className="threshold-warn">Over target ({config.maxRecommendedMoves})</span>
          ) : (
            <span className="threshold-ok">On pace (≤{config.maxRecommendedMoves})</span>
          )}
        </div>
      </div>

      <div className="stat-card" data-testid="stat-timer">
        <div className="stat-header">
          <Timer className="stat-icon timer-icon" size={18} aria-hidden="true" />
          <span className="stat-label">Active Time</span>
        </div>
        <div className="stat-value font-mono" data-testid="timer-display">
          {formatTime(elapsedSeconds)}
        </div>
        <div className="stat-subtext">
          {gameStatus === 'idle'
            ? 'Starts on first flip'
            : gameStatus === 'completed'
            ? 'Completed!'
            : 'Timer active'}
        </div>
      </div>

      <div className="stat-card" data-testid="stat-pairs">
        <div className="stat-header">
          <CheckCircle2 className="stat-icon pairs-icon" size={18} aria-hidden="true" />
          <span className="stat-label">Pairs Matched</span>
        </div>
        <div className="stat-value" data-testid="pairs-counter">
          {completedPairs} <span className="stat-divider">/</span> {totalPairs}
        </div>
        <div className="stat-progress-bar" aria-hidden="true">
          <div
            className="stat-progress-fill"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>
    </div>
  );
};
