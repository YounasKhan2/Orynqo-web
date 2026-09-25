import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog, Button } from '../../../design-system';

/**
 * TeamChangeConfirmation Component
 * Consequence confirmation modal shown before committing a Team change on an existing WorkItem.
 * Ensures zero silent property destruction.
 */
export function TeamChangeConfirmation({
  isOpen,
  onClose,
  onCancel,
  consequenceData,
  consequences: rawConsequences,
  targetTeamId,
  onConfirm
}) {
  const data = consequenceData || {
    consequences: Array.isArray(rawConsequences)
      ? rawConsequences
      : rawConsequences?.consequences
      ? rawConsequences.consequences
      : [
          rawConsequences?.statusChange && {
            property: 'Status',
            current: rawConsequences.statusChange.current,
            proposed: rawConsequences.statusChange.proposed
          },
          rawConsequences?.cycleChange && {
            property: 'Cycle',
            current: rawConsequences.cycleChange.current,
            proposed: rawConsequences.cycleChange.proposed
          },
          rawConsequences?.projectChange && {
            property: 'Project',
            current: rawConsequences.projectChange.current,
            proposed: rawConsequences.projectChange.proposed
          }
        ].filter(Boolean),
    proposedPatch: {
      teamId: targetTeamId || consequenceData?.targetTeamId || 'team-core',
      ...(rawConsequences?.statusChange ? { status: rawConsequences.statusChange.proposed } : {}),
      ...(rawConsequences?.cycleChange ? { cycleId: rawConsequences.cycleChange.proposed } : {})
    },
    targetTeamName: targetTeamId || consequenceData?.targetTeamName || 'target team'
  };

  if (!isOpen) return null;

  const { consequences = [], proposedPatch = {}, targetTeamName } = data;

  const handleClose = () => {
    onCancel?.();
    onClose?.();
  };

  const handleConfirm = () => {
    onConfirm?.(proposedPatch);
    onClose?.();
  };

  const footer = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
      <Button variant="ghost" onClick={handleClose} aria-label="Keep Current Team">
        Keep Current Team
      </Button>
      <Button variant="primary" onClick={handleConfirm} aria-label="Move & Apply Changes">
        Move & Apply Changes
      </Button>
    </div>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Team Change"
      width="460px"
      zIndex={2500}
      footer={footer}
    >
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <AlertTriangle size={18} style={{ color: 'var(--priority-urgent, #ef4444)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 'var(--font-semibold, 600)', color: 'var(--text-primary)' }}>
              Moving item to {targetTeamName}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              The target team has different workflow configurations. The following properties will be updated atomically:
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            backgroundColor: 'var(--bg-surface, rgba(255, 255, 255, 0.03))',
            border: '1px solid var(--border-default, rgba(255, 255, 255, 0.1))',
            borderRadius: 'var(--radius-sm, 6px)',
            padding: '10px'
          }}
        >
          {consequences.map((c, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                paddingBottom: idx < consequences.length - 1 ? '8px' : '0',
                borderBottom: idx < consequences.length - 1 ? '1px solid var(--border-subtle, rgba(255, 255, 255, 0.05))' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ fontWeight: 'var(--font-semibold, 600)', color: 'var(--text-secondary)' }}>
                  {c.property}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  <span style={{ textDecoration: 'line-through' }}>{c.current}</span> →{' '}
                  <span style={{ color: 'var(--primary, #3b82f6)', fontWeight: 'var(--font-medium, 500)' }}>
                    {c.proposed}
                  </span>
                </span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {c.reason}
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          Clicking <strong>Cancel</strong> makes zero changes. Clicking <strong>Confirm Changes</strong> applies one coherent atomic mutation.
        </div>
      </div>
    </Dialog>
  );
}
