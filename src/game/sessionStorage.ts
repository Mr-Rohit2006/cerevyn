import { SessionResult } from '../types/game';

const STORAGE_KEY = 'ps09_adaptive_memory_game_sessions';
const MAX_STORED_SESSIONS = 30;

/**
 * Safely retrieves anonymous game history from local storage.
 * Does not collect any personally identifiable information (PII).
 */
export function loadSessionHistory(): SessionResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.warn('Failed to load session history from localStorage:', err);
    return [];
  }
}

/**
 * Saves a new anonymous round result into local storage.
 * Keeps only the most recent N sessions to prevent storage bloat.
 */
export function saveSessionResult(result: SessionResult): SessionResult[] {
  try {
    const existing = loadSessionHistory();
    // Prepend latest result
    const updated = [result, ...existing].slice(0, MAX_STORED_SESSIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save session result to localStorage:', err);
    return [];
  }
}

/**
 * Clears stored anonymous session history.
 */
export function clearSessionHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear session history:', err);
  }
}
