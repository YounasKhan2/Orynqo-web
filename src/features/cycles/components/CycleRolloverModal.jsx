import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Inbox
} from 'lucide-react';
import { ROLLOVER_DESTINATIONS } from '../model/rolloverEngine';

/**
 * CycleRolloverModal Component (UI-05A / UI-05B)
 *
 * Implements the explicit, non-silent rollover review workflow:
 * - Shows completed vs uncompleted count
 * - User explicitly chooses destination for incomplete items:
 *   1. Return to Backlog (clears cycleId)
 *   2. Move to Upcoming Cycle (assigns to nextCycle.id)
 */
export function CycleRolloverModal({
  cycle,
  incompleteItems = [],
  nextCycle = null,
  onConfirm,
  onCancel
}) {
  const [destination, setDestination] = React.useState(
    nextCycle ? ROLLOVER_DESTINATIONS.UPCOMING_CYCLE : ROLLOVER_DESTINATIONS.BACKLOG
  );

  if (!cycle) return null;

  return (
    <div
      data-keyboard-scope="OVERLAY"
      role="dialog"
      aria-labelledby="rollover-title"
      aria-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 'var(--space-4)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-4)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)'
          }}
        >
          <CheckCircle2 size={18} color="var(--status-done)" />
          <h2
            id="rollover-title"
            style={{
              fontSize: 'var(--text-md)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--text-primary)',
              margin: 0
            }}
          >
            Complete {cycle.name || `Cycle ${cycle.number}`}
          </h2>
        </div>

        {/* Content */}
        <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {incompleteItems.length > 0 ? (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--accent-amber-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-primary)'
                }}
              >
                <AlertTriangle size={16} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>{incompleteItems.length} uncompleted item{incompleteItems.length > 1 ? 's' : ''}</strong> will not be silently carried over. Please choose where they should be routed.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--text-secondary)' }}>
                  Rollover Destination:
                </span>

                {/* Option: Upcoming Cycle */}
                {nextCycle && (
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-3)',
                      backgroundColor: destination === ROLLOVER_DESTINATIONS.UPCOMING_CYCLE ? 'var(--bg-surface-raised)' : 'var(--bg-surface-subtle)',
                      border: `1px solid ${destination === ROLLOVER_DESTINATIONS.UPCOMING_CYCLE ? 'var(--border-focus)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="rollover-dest"
                      checked={destination === ROLLOVER_DESTINATIONS.UPCOMING_CYCLE}
                      onChange={() => setDestination(ROLLOVER_DESTINATIONS.UPCOMING_CYCLE)}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>
                        Move to Next Cycle ({nextCycle.name || `Cycle ${nextCycle.number}`})
                      </span>
                      <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
                        Starts {nextCycle.startDate}
                      </span>
                    </div>
                  </label>
                )}

                {/* Option: Backlog */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    backgroundColor: destination === ROLLOVER_DESTINATIONS.BACKLOG ? 'var(--bg-surface-raised)' : 'var(--bg-surface-subtle)',
                    border: `1px solid ${destination === ROLLOVER_DESTINATIONS.BACKLOG ? 'var(--border-focus)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="rollover-dest"
                    checked={destination === ROLLOVER_DESTINATIONS.BACKLOG}
                    onChange={() => setDestination(ROLLOVER_DESTINATIONS.BACKLOG)}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>
                      Return to Team Backlog
                    </span>
                    <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
                      Clears cycle commitment, available for future planning
                    </span>
                  </div>
                </label>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
              All committed items in this cycle were completed! Ready to archive and finalize cycle metrics.
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 'var(--space-2)'
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              height: '28px',
              padding: '0 var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm?.({
                cycleId: cycle.id,
                destination,
                nextCycleId: destination === ROLLOVER_DESTINATIONS.UPCOMING_CYCLE ? nextCycle?.id : null
              });
            }}
            style={{
              height: '28px',
              padding: '0 var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'var(--primary-base)',
              color: 'var(--text-inverse)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              cursor: 'pointer'
            }}
          >
            Confirm & Complete Cycle
          </button>
        </div>
      </div>
    </div>
  );
}
