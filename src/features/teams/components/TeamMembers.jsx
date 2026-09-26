import React from 'react';
import { UserAvatar } from '../../../components/avatars/UserAvatar';
import { Users, CheckCircle } from 'lucide-react';

/**
 * TeamMembers Component (TEM-007)
 *
 * Squad roster, roles, and active capacity context.
 */
export function TeamMembers({
  members = [],
  lead
}) {
  return (
    <div
      role="region"
      aria-label="Team Members"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        padding: 'var(--space-6)',
        overflowY: 'auto',
        height: '100%',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Users size={16} color="var(--primary-base)" />
        <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', margin: 0 }}>
          Squad Roster ({members.length})
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
        {members.map((member) => {
          const isLead = lead?.id === member.id;

          return (
            <div
              key={member.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)'
              }}
            >
              <UserAvatar user={member} size={36} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {member.name}
                  </span>
                  {isLead && (
                    <span
                      style={{
                        fontSize: 'var(--text-2xs)',
                        padding: '1px 5px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--primary-subtle)',
                        color: 'var(--primary-base)',
                        fontWeight: 'var(--font-semibold)'
                      }}
                    >
                      Lead
                    </span>
                  )}
                </div>

                <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
                  {member.role || 'Contributor'}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: 'var(--text-2xs)', color: 'var(--text-secondary)' }}>
                  <span>{member.activeWorkCount || 0} active items</span>
                  {member.cyclePoints > 0 && <span>• {member.cyclePoints} pts in cycle</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
