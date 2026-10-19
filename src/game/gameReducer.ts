import { CardItem, Difficulty } from '../types/game';
import { DIFFICULTY_CONFIGS } from './difficulty';
import { generateDeck } from './cardUtils';

export interface GameState {
  roundId: string;
  difficulty: Difficulty;
  cards: CardItem[];
  selectedCardIds: string[];
  isResolvingMismatch: boolean;
  moves: number;
  completedPairs: number;
  totalPairs: number;
  gameStatus: 'idle' | 'playing' | 'completed';
  seed: string | null;
}

export type GameAction =
  | { type: 'START_GAME'; payload?: { difficulty?: Difficulty; seed?: string | null } }
  | { type: 'SELECT_CARD'; payload: { cardId: string } }
  | { type: 'RESOLVE_MISMATCH'; payload: { roundId: string } }
  | { type: 'RESET_GAME'; payload?: { difficulty?: Difficulty; seed?: string | null } };

export function generateRoundId(): string {
  return `round-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

export function createInitialState(
  difficulty: Difficulty = 'easy',
  seed: string | null = null
): GameState {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const cards = generateDeck(difficulty, seed);

  return {
    roundId: generateRoundId(),
    difficulty,
    cards,
    selectedCardIds: [],
    isResolvingMismatch: false,
    moves: 0,
    completedPairs: 0,
    totalPairs: config.totalPairs,
    gameStatus: 'idle',
    seed,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
    case 'RESET_GAME': {
      const difficulty = action.payload?.difficulty ?? state.difficulty;
      const seed = action.payload?.seed !== undefined ? action.payload.seed : state.seed;
      return createInitialState(difficulty, seed);
    }

    case 'SELECT_CARD': {
      const { cardId } = action.payload;

      // 1. Block selection if resolving a mismatch
      if (state.isResolvingMismatch) {
        return state;
      }

      // 2. Block if game is already completed
      if (state.gameStatus === 'completed') {
        return state;
      }

      // 3. Find card
      const targetCard = state.cards.find((c) => c.id === cardId);
      if (!targetCard) {
        return state;
      }

      // 4. Ignore already matched or flipped cards
      if (targetCard.isMatched || targetCard.isFlipped) {
        return state;
      }

      // 5. Prevent selecting the same card twice
      if (state.selectedCardIds.includes(cardId)) {
        return state;
      }

      // Case A: First card of a pair selection
      if (state.selectedCardIds.length === 0) {
        const updatedCards = state.cards.map((c) =>
          c.id === cardId ? { ...c, isFlipped: true, isMismatching: false } : c
        );

        return {
          ...state,
          cards: updatedCards,
          selectedCardIds: [cardId],
          gameStatus: state.gameStatus === 'idle' ? 'playing' : state.gameStatus,
        };
      }

      // Case B: Second card of a pair selection
      if (state.selectedCardIds.length === 1) {
        const firstCardId = state.selectedCardIds[0];
        const firstCard = state.cards.find((c) => c.id === firstCardId);

        if (!firstCard) {
          return state;
        }

        const newMoves = state.moves + 1;
        const isMatch = firstCard.pairId === targetCard.pairId;

        if (isMatch) {
          // MATCH FOUND
          const newCompletedPairs = state.completedPairs + 1;
          const isVictory = newCompletedPairs === state.totalPairs;

          const updatedCards = state.cards.map((c) => {
            if (c.id === firstCardId || c.id === cardId) {
              return {
                ...c,
                isFlipped: true,
                isMatched: true,
                isMismatching: false,
              };
            }
            return c;
          });

          return {
            ...state,
            cards: updatedCards,
            selectedCardIds: [],
            isResolvingMismatch: false,
            moves: newMoves,
            completedPairs: newCompletedPairs,
            gameStatus: isVictory ? 'completed' : 'playing',
          };
        } else {
          // MISMATCH
          const updatedCards = state.cards.map((c) => {
            if (c.id === firstCardId || c.id === cardId) {
              return {
                ...c,
                isFlipped: true,
                isMismatching: true,
              };
            }
            return c;
          });

          return {
            ...state,
            cards: updatedCards,
            selectedCardIds: [firstCardId, cardId],
            isResolvingMismatch: true,
            moves: newMoves,
            gameStatus: 'playing',
          };
        }
      }

      // In case more than 2 are somehow selected, reject
      return state;
    }

    case 'RESOLVE_MISMATCH': {
      // Guard: Delayed callback from an old game must never modify the current/restarted game
      if (action.payload.roundId !== state.roundId) {
        return state;
      }

      if (!state.isResolvingMismatch) {
        return state;
      }

      const updatedCards = state.cards.map((c) => {
        if (state.selectedCardIds.includes(c.id) && !c.isMatched) {
          return {
            ...c,
            isFlipped: false,
            isMismatching: false,
          };
        }
        return c;
      });

      return {
        ...state,
        cards: updatedCards,
        selectedCardIds: [],
        isResolvingMismatch: false,
      };
    }

    default:
      return state;
  }
}
