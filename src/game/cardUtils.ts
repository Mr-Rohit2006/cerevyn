import { CardItem, Difficulty } from '../types/game';
import { DIFFICULTY_CONFIGS } from './difficulty';
import { createPRNG, shuffleArray } from './prng';

export interface SymbolDefinition {
  id: string;
  label: string;
  iconName: string;
}

/**
 * 20 distinct, recognizable symbols with accessible labels.
 * Sufficient for Easy (8 pairs) and Hard (18 pairs).
 */
export const SYMBOL_POOL: SymbolDefinition[] = [
  { id: 'rocket', label: 'Rocket Ship', iconName: 'Rocket' },
  { id: 'gem', label: 'Sparkling Gem', iconName: 'Gem' },
  { id: 'crown', label: 'Royal Crown', iconName: 'Crown' },
  { id: 'flame', label: 'Blazing Fire', iconName: 'Flame' },
  { id: 'heart', label: 'Glowing Heart', iconName: 'Heart' },
  { id: 'zap', label: 'Lightning Bolt', iconName: 'Zap' },
  { id: 'globe', label: 'World Globe', iconName: 'Globe' },
  { id: 'star', label: 'Golden Star', iconName: 'Star' },
  { id: 'compass', label: 'Magnetic Compass', iconName: 'Compass' },
  { id: 'music', label: 'Musical Note', iconName: 'Music' },
  { id: 'anchor', label: 'Nautical Anchor', iconName: 'Anchor' },
  { id: 'feather', label: 'Soft Feather', iconName: 'Feather' },
  { id: 'shield', label: 'Defense Shield', iconName: 'Shield' },
  { id: 'bell', label: 'Ringing Bell', iconName: 'Bell' },
  { id: 'coffee', label: 'Warm Coffee', iconName: 'Coffee' },
  { id: 'sun', label: 'Radiant Sun', iconName: 'Sun' },
  { id: 'moon', label: 'Crescent Moon', iconName: 'Moon' },
  { id: 'palette', label: 'Art Palette', iconName: 'Palette' },
  { id: 'gift', label: 'Gift Box', iconName: 'Gift' },
  { id: 'trophy', label: 'Winner Trophy', iconName: 'Trophy' },
];

/**
 * Creates a paired and shuffled card deck based on difficulty and optional seed.
 */
export function generateDeck(
  difficulty: Difficulty,
  seed?: string | number | null
): CardItem[] {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const requiredPairs = config.totalPairs;

  if (requiredPairs > SYMBOL_POOL.length) {
    throw new Error(
      `Requested ${requiredPairs} pairs, but symbol pool only contains ${SYMBOL_POOL.length}`
    );
  }

  // Select symbols for this deck
  const selectedSymbols = SYMBOL_POOL.slice(0, requiredPairs);

  // Create two cards for each symbol
  const rawCards: Array<Omit<CardItem, 'id'>> = [];
  selectedSymbols.forEach((sym, pairIndex) => {
    // Card A
    rawCards.push({
      pairId: pairIndex,
      symbol: sym.id,
      label: sym.label,
      isFlipped: false,
      isMatched: false,
    });
    // Card B
    rawCards.push({
      pairId: pairIndex,
      symbol: sym.id,
      label: sym.label,
      isFlipped: false,
      isMatched: false,
    });
  });

  // Shuffle deck deterministically if seed is provided, else standard random
  const randomFn = seed !== undefined && seed !== null && seed !== ''
    ? createPRNG(seed)
    : Math.random;

  const shuffled = shuffleArray(rawCards, randomFn);

  // Assign stable unique IDs based on final shuffled indices
  return shuffled.map((card, index) => ({
    ...card,
    id: `card-${index}`,
  }));
}
