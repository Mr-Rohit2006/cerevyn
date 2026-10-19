import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useMemoryGame } from './hooks/useMemoryGame';
import { GameBoard } from './components/GameBoard';
import { GameStats } from './components/GameStats';
import { GameControls } from './components/GameControls';
import { VictoryModal } from './components/VictoryModal';
import { SessionHistory } from './components/SessionHistory';
import { InstructionsModal } from './components/InstructionsModal';
import './styles/game.css';

export const App: React.FC = () => {
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  const {
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
    closeVictoryModal,
    clearHistory,
  } = useMemoryGame({
    initialDifficulty: 'easy',
  });

  return (
    <div className="game-app-container">
      {/* Header */}
      <header className="game-header">
        <div className="header-badge">
          <Sparkles size={14} className="inline-icon" />
          <span>Cerevyn Assessment • PS09</span>
        </div>
        <h1 className="game-title">Adaptive Memory Match</h1>
        <p className="game-description">
          Flip cards to discover pairs. Your move efficiency and speed automatically calibrate the difficulty for your next challenge.
        </p>
      </header>

      {/* Action Controls & Mode Selector */}
      <GameControls
        difficulty={state.difficulty}
        activeSeed={activeSeed}
        onRestart={() => restartGame()}
        onChangeDifficulty={changeDifficulty}
        onSetSeed={(newSeed) => {
          setActiveSeed(newSeed);
          restartGame(state.difficulty, newSeed);
        }}
        onOpenInstructions={() => setIsInstructionsOpen(true)}
      />

      {/* Performance Metrics */}
      <GameStats
        difficulty={state.difficulty}
        moves={state.moves}
        completedPairs={state.completedPairs}
        totalPairs={state.totalPairs}
        elapsedSeconds={timer.elapsedSeconds}
        gameStatus={state.gameStatus}
      />

      {/* Main Interactive Game Board */}
      <main>
        <GameBoard
          cards={state.cards}
          difficulty={state.difficulty}
          isResolvingMismatch={state.isResolvingMismatch}
          onCardClick={handleCardClick}
        />
      </main>

      {/* Anonymous Local Session History */}
      <SessionHistory
        history={sessionHistory}
        onClearHistory={clearHistory}
      />

      {/* Victory Modal with Adaptive Difficulty Recommendation */}
      {showVictoryModal && (
        <VictoryModal
          decision={difficultyDecision}
          moves={state.moves}
          elapsedSeconds={timer.elapsedSeconds}
          totalPairs={state.totalPairs}
          onPlayNextRound={playNextRound}
          onRestartSameDifficulty={() => restartGame(state.difficulty)}
          onClose={closeVictoryModal}
        />
      )}

      {/* Game Rules & Difficulty Explanation Modal */}
      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />
    </div>
  );
};

export default App;
