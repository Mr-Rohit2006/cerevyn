import React from 'react';
import { CardItem, Difficulty } from '../types/game';
import { MemoryCard } from './MemoryCard';

interface GameBoardProps {
  cards: CardItem[];
  difficulty: Difficulty;
  isResolvingMismatch: boolean;
  onCardClick: (cardId: string) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  cards,
  difficulty,
  isResolvingMismatch,
  onCardClick,
}) => {
  return (
    <div
      className={`game-board-container grid-${difficulty}`}
      role="region"
      aria-label={`Memory game board with ${difficulty} difficulty`}
      data-testid="game-board"
    >
      <div className={`card-grid grid-${difficulty}`}>
        {cards.map((card) => (
          <MemoryCard
            key={card.id}
            card={card}
            onClick={onCardClick}
            disabled={isResolvingMismatch}
          />
        ))}
      </div>
    </div>
  );
};
