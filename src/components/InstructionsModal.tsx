import React from 'react';
import { X, Brain, Target, Shuffle, Award, Check } from 'lucide-react';
import { DIFFICULTY_CONFIGS } from '../game/difficulty';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const easyConfig = DIFFICULTY_CONFIGS.easy;
  const hardConfig = DIFFICULTY_CONFIGS.hard;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="instructions-title"
      data-testid="instructions-modal"
    >
      <div className="modal-content instructions-card">
        <div className="instructions-header">
          <div className="title-with-icon">
            <Brain className="modal-header-icon" size={24} />
            <h2 id="instructions-title">How to Play & Adaptive Rules</h2>
          </div>
          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
            aria-label="Close instructions modal"
            data-testid="btn-close-instructions"
          >
            <X size={20} />
          </button>
        </div>

        <div className="instructions-body">
          {/* Section 1: Gameplay */}
          <div className="instruction-section">
            <h3>
              <Target size={18} className="inline-icon" /> Core Matching Mechanics
            </h3>
            <ul className="instruction-list">
              <li>
                <strong>Flipping:</strong> Click any face-down card to reveal its hidden symbol.
              </li>
              <li>
                <strong>Finding Pairs:</strong> Flip a second card. If both match, they stay face-up and completed.
              </li>
              <li>
                <strong>Mismatches:</strong> If the cards differ, they briefly flash, then flip face-down.
              </li>
              <li>
                <strong>Move Counter:</strong> A move is counted each time the <em>second</em> card of a pair is selected.
              </li>
              <li>
                <strong>Lock Protection:</strong> Board interaction is locked during mismatch resolution to prevent unintended rapid misclicks.
              </li>
            </ul>
          </div>

          {/* Section 2: Adaptive Difficulty */}
          <div className="instruction-section">
            <h3>
              <Award size={18} className="inline-icon" /> Transparent Adaptive Difficulty
            </h3>
            <p className="instruction-intro">
              The game adapts the next round's difficulty based on deterministic performance thresholds (no black-box AI):
            </p>

            <div className="thresholds-comparison">
              <div className="threshold-card">
                <h4>Easy Level (4 × 4)</h4>
                <ul>
                  <li>16 cards (8 pairs)</li>
                  <li>
                    Promotion to <strong>Hard</strong> requires:
                    <div className="criteria-badge">
                      <Check size={14} className="inline-icon text-success" /> Moves ≤ {easyConfig.maxRecommendedMoves}
                    </div>
                    <div className="criteria-badge">
                      <Check size={14} className="inline-icon text-success" /> Active Time ≤ {easyConfig.maxRecommendedTimeSeconds}s
                    </div>
                  </li>
                  <li>Exceeding either threshold keeps you on Easy for further practice.</li>
                </ul>
              </div>

              <div className="threshold-card">
                <h4>Hard Level (6 × 6)</h4>
                <ul>
                  <li>36 cards (18 pairs)</li>
                  <li>
                    Retention at <strong>Hard</strong> requires:
                    <div className="criteria-badge">
                      <Check size={14} className="inline-icon text-success" /> Moves ≤ {hardConfig.maxRecommendedMoves}
                    </div>
                    <div className="criteria-badge">
                      <Check size={14} className="inline-icon text-success" /> Active Time ≤ {hardConfig.maxRecommendedTimeSeconds}s
                    </div>
                  </li>
                  <li>Exceeding thresholds adjusts back to Easy to rebuild momentum.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Seeded PRNG for Interview Demo */}
          <div className="instruction-section">
            <h3>
              <Shuffle size={18} className="inline-icon" /> Reproducible Random Seeds
            </h3>
            <p>
              Use the <strong>Seed</strong> button in the toolbar to enter a deterministic seed (e.g. <code>demo-round-1</code>).
              This guarantees identical card positions for verification, automated testing, and interview demonstrations.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-primary-action btn-full"
            onClick={onClose}
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
