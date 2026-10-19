import React from 'react';
import {
  Trophy,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Equal,
  Sparkles,
} from 'lucide-react';
import { DifficultyDecision } from '../types/game';

interface VictoryModalProps {
  decision: DifficultyDecision | null;
  moves: number;
  elapsedSeconds: number;
  totalPairs: number;
  onPlayNextRound: (useRecommendation: boolean) => void;
  onRestartSameDifficulty: () => void;
  onClose: () => void;
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  decision,
  moves,
  elapsedSeconds,
  totalPairs,
  onPlayNextRound,
  onRestartSameDifficulty,
  onClose,
}) => {
  if (!decision) return null;

  const isPromotion = decision.promoted;
  const isDemotion = decision.demoted;
  const isRetained = decision.retained;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
      data-testid="victory-modal"
    >
      <div className="modal-content victory-card">
        <div className="victory-badge-icon">
          <Trophy size={48} className="trophy-gold" />
        </div>

        <h2 id="victory-title" className="victory-title" data-testid="victory-heading">
          Round Completed!
        </h2>
        <p className="victory-subtitle">
          All {totalPairs} pairs successfully matched!
        </p>

        {/* Performance metrics */}
        <div className="victory-metrics-grid">
          <div className="metric-box">
            <span className="metric-label">Completed Level</span>
            <span className="metric-value font-capitalize">
              {decision.currentDifficulty}
            </span>
          </div>

          <div className="metric-box" data-testid="victory-moves">
            <span className="metric-label">Total Moves</span>
            <span className="metric-value">{moves}</span>
            <span className="metric-sub">
              {decision.metMoves ? (
                <span className="text-success">
                  <CheckCircle size={12} className="inline-icon" /> Met target (≤{decision.movesThreshold})
                </span>
              ) : (
                <span className="text-warning">
                  <XCircle size={12} className="inline-icon" /> Exceeded (≤{decision.movesThreshold})
                </span>
              )}
            </span>
          </div>

          <div className="metric-box" data-testid="victory-time">
            <span className="metric-label">Time Elapsed</span>
            <span className="metric-value">{formatTime(elapsedSeconds)}</span>
            <span className="metric-sub">
              {decision.metTime ? (
                <span className="text-success">
                  <CheckCircle size={12} className="inline-icon" /> Met target (≤{decision.timeThreshold}s)
                </span>
              ) : (
                <span className="text-warning">
                  <XCircle size={12} className="inline-icon" /> Exceeded (≤{decision.timeThreshold}s)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Adaptive Difficulty Recommendation */}
        <div
          className={`adaptation-banner ${
            isPromotion
              ? 'banner-promoted'
              : isDemotion
              ? 'banner-demoted'
              : 'banner-retained'
          }`}
          data-testid="adaptation-banner"
        >
          <div className="adaptation-header">
            {isPromotion && <TrendingUp size={20} className="icon-promote" />}
            {isDemotion && <TrendingDown size={20} className="icon-demote" />}
            {isRetained && <Equal size={20} className="icon-retain" />}
            <span className="adaptation-tag">
              Next Round Recommendation: <strong>{decision.nextDifficulty.toUpperCase()}</strong>
            </span>
          </div>

          <p className="adaptation-reason" data-testid="adaptation-reason">
            {decision.reason}
          </p>

          <div className="rule-disclaimer">
            <Sparkles size={12} className="inline-icon" />
            Transparent Rule-based System: Moves threshold (≤{decision.movesThreshold}) & Time threshold (≤{decision.timeThreshold}s).
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="modal-actions">
          <button
            type="button"
            className="btn-modal btn-primary-action"
            onClick={() => onPlayNextRound(true)}
            data-testid="btn-play-recommended"
          >
            <span>Play Next Round ({decision.nextDifficulty.toUpperCase()})</span>
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            className="btn-modal btn-secondary-action"
            onClick={onRestartSameDifficulty}
            data-testid="btn-replay-same"
          >
            <RotateCcw size={16} />
            <span>Replay Current Level</span>
          </button>

          <button
            type="button"
            className="btn-modal btn-ghost"
            onClick={onClose}
            data-testid="btn-close-victory"
          >
            View Board
          </button>
        </div>
      </div>
    </div>
  );
};
