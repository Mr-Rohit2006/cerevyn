import React, { useState } from 'react';
import { RotateCcw, HelpCircle, Dices, Layers } from 'lucide-react';
import { Difficulty } from '../types/game';

interface GameControlsProps {
  difficulty: Difficulty;
  activeSeed: string | null;
  onRestart: () => void;
  onChangeDifficulty: (newDifficulty: Difficulty) => void;
  onSetSeed: (seed: string | null) => void;
  onOpenInstructions: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  difficulty,
  activeSeed,
  onRestart,
  onChangeDifficulty,
  onSetSeed,
  onOpenInstructions,
}) => {
  const [isSeedOpen, setIsSeedOpen] = useState(false);
  const [customSeedInput, setCustomSeedInput] = useState(activeSeed || '');

  const handleApplySeed = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customSeedInput.trim();
    onSetSeed(clean === '' ? null : clean);
  };

  const handleClearSeed = () => {
    setCustomSeedInput('');
    onSetSeed(null);
  };

  return (
    <div className="game-controls-container" role="toolbar" aria-label="Game controls">
      <div className="controls-group difficulty-buttons">
        <span className="controls-label">
          <Layers size={14} className="inline-icon" /> Mode:
        </span>
        <button
          type="button"
          className={`btn-toggle ${difficulty === 'easy' ? 'active' : ''}`}
          onClick={() => onChangeDifficulty('easy')}
          data-testid="difficulty-toggle-easy"
          aria-pressed={difficulty === 'easy'}
        >
          Easy (4×4)
        </button>
        <button
          type="button"
          className={`btn-toggle ${difficulty === 'hard' ? 'active' : ''}`}
          onClick={() => onChangeDifficulty('hard')}
          data-testid="difficulty-toggle-hard"
          aria-pressed={difficulty === 'hard'}
        >
          Hard (6×6)
        </button>
      </div>

      <div className="controls-group action-buttons">
        <button
          type="button"
          className="btn-action btn-restart"
          onClick={onRestart}
          data-testid="btn-restart"
          title="Reset board, timer, and pending mismatch timers"
        >
          <RotateCcw size={16} className="btn-icon" />
          <span>Restart</span>
        </button>

        <button
          type="button"
          className={`btn-action btn-seed-toggle ${activeSeed ? 'has-seed' : ''}`}
          onClick={() => setIsSeedOpen(!isSeedOpen)}
          data-testid="btn-seed-toggle"
          title="Toggle reproducible test seed"
        >
          <Dices size={16} className="btn-icon" />
          <span>{activeSeed ? `Seed: ${activeSeed}` : 'Seed'}</span>
        </button>

        <button
          type="button"
          className="btn-action btn-instructions"
          onClick={onOpenInstructions}
          data-testid="btn-instructions"
          title="View game rules & difficulty adaptation criteria"
        >
          <HelpCircle size={16} className="btn-icon" />
          <span>How to Play</span>
        </button>
      </div>

      {isSeedOpen && (
        <div className="seed-popover" data-testid="seed-popover">
          <form onSubmit={handleApplySeed} className="seed-form">
            <label htmlFor="seed-input" className="seed-label">
              Reproducible Random Seed:
            </label>
            <div className="seed-input-row">
              <input
                id="seed-input"
                type="text"
                value={customSeedInput}
                onChange={(e) => setCustomSeedInput(e.target.value)}
                placeholder="e.g. test-seed-123"
                className="seed-input"
                data-testid="seed-input"
              />
              <button
                type="submit"
                className="btn-seed-apply"
                data-testid="btn-apply-seed"
              >
                Apply
              </button>
              {activeSeed && (
                <button
                  type="button"
                  className="btn-seed-clear"
                  onClick={handleClearSeed}
                  data-testid="btn-clear-seed"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="seed-hint">
              Enter any text to generate an identical reproducible card shuffle for interview demos and tests.
            </p>
          </form>
        </div>
      )}
    </div>
  );
};
