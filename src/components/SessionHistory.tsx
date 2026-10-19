import React, { useState } from 'react';
import { History, Trash2, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { SessionResult } from '../types/game';

interface SessionHistoryProps {
  history: SessionResult[];
  onClearHistory: () => void;
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return isoString;
  }
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  history,
  onClearHistory,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="session-history-container" aria-label="Session History">
      <div className="session-history-header">
        <button
          type="button"
          className="history-toggle-button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          data-testid="toggle-history-btn"
        >
          <div className="history-title-group">
            <History size={18} className="history-icon" />
            <span className="history-title">Session History</span>
            <span className="history-count-badge">{history.length}</span>
          </div>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {history.length > 0 && isOpen && (
          <button
            type="button"
            className="btn-clear-history"
            onClick={onClearHistory}
            data-testid="btn-clear-history"
            title="Clear all stored local rounds"
          >
            <Trash2 size={14} className="inline-icon" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="session-history-body" data-testid="session-history-content">
          <div className="privacy-notice">
            <ShieldCheck size={14} className="inline-icon text-success" />
            <span>
              Privacy-first: All data is stored strictly in your browser's local storage. No personal data or cookies are collected.
            </span>
          </div>

          {history.length === 0 ? (
            <p className="history-empty" data-testid="history-empty-msg">
              No completed sessions recorded yet. Finish a round to see your performance history and adaptive recommendations!
            </p>
          ) : (
            <div className="history-table-wrapper">
              <table className="history-table" data-testid="history-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Level</th>
                    <th>Pairs</th>
                    <th>Moves</th>
                    <th>Duration</th>
                    <th>Next Level</th>
                    <th>Adaptive Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.roundId} data-testid={`history-row-${item.roundId}`}>
                      <td className="history-time-col">{formatDate(item.completedAt)}</td>
                      <td>
                        <span className={`badge-pill badge-${item.difficulty}`}>
                          {item.difficulty.toUpperCase()}
                        </span>
                      </td>
                      <td>{item.totalPairs}/{item.totalPairs}</td>
                      <td><strong>{item.moves}</strong></td>
                      <td className="font-mono">{formatTime(item.elapsedSeconds)}</td>
                      <td>
                        <span className={`badge-pill badge-${item.nextDifficulty}`}>
                          {item.nextDifficulty.toUpperCase()}
                        </span>
                      </td>
                      <td className="history-reason-col" title={item.recommendationReason}>
                        {item.recommendationReason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
