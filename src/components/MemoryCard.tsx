import React from 'react';
import {
  Rocket,
  Gem,
  Crown,
  Flame,
  Heart,
  Zap,
  Globe,
  Star,
  Compass,
  Music,
  Anchor,
  Feather,
  Shield,
  Bell,
  Coffee,
  Sun,
  Moon,
  Palette,
  Gift,
  Trophy,
  HelpCircle,
  LucideProps,
} from 'lucide-react';
import { CardItem } from '../types/game';

interface MemoryCardProps {
  card: CardItem;
  onClick: (cardId: string) => void;
  disabled?: boolean;
}

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  rocket: Rocket,
  gem: Gem,
  crown: Crown,
  flame: Flame,
  heart: Heart,
  zap: Zap,
  globe: Globe,
  star: Star,
  compass: Compass,
  music: Music,
  anchor: Anchor,
  feather: Feather,
  shield: Shield,
  bell: Bell,
  coffee: Coffee,
  sun: Sun,
  moon: Moon,
  palette: Palette,
  gift: Gift,
  trophy: Trophy,
};

export const MemoryCard: React.FC<MemoryCardProps> = ({
  card,
  onClick,
  disabled = false,
}) => {
  const isRevealed = card.isFlipped || card.isMatched;
  const IconComponent = ICON_MAP[card.symbol] || HelpCircle;

  const handleClick = () => {
    if (!disabled && !card.isMatched && !card.isFlipped) {
      onClick(card.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      className={`memory-card ${isRevealed ? 'flipped' : ''} ${
        card.isMatched ? 'matched' : ''
      } ${card.isMismatching ? 'mismatch' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={card.isMatched || disabled}
      aria-label={
        card.isMatched
          ? `Matched card, ${card.label}`
          : isRevealed
          ? `Revealed card, ${card.label}`
          : 'Hidden memory card'
      }
      data-testid={`card-${card.id}`}
      data-symbol={card.symbol}
      data-card-id={card.id}
      data-matched={card.isMatched}
      data-flipped={card.isFlipped}
    >
      <div className="card-inner">
        {/* Back of the card (Hidden state) */}
        <div className="card-face card-back">
          <div className="card-back-pattern">
            <span className="card-back-icon">?</span>
          </div>
        </div>

        {/* Front of the card (Revealed state) */}
        <div className="card-face card-front">
          <div className="card-symbol-wrapper">
            <IconComponent className="card-symbol-icon" size={32} aria-hidden="true" />
            <span className="card-symbol-label">{card.label}</span>
          </div>
        </div>
      </div>
    </button>
  );
};
