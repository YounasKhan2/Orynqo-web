import React, { useMemo } from 'react';
import {
  LayoutDashboard,
  Table,
  Calendar,
  FolderKanban,
  FileText,
  Users
} from 'lucide-react';

const ICON_MAP = {
  overview: LayoutDashboard,
  work: Table,
  cycles: Calendar,
  projects: FolderKanban,
  docs: FileText,
  members: Users
};

/**
 * TeamResourceNav Component (TEM-001)
 *
 * 36px contextual Resource Navigation strip:
 * - Overview
 * - Work
 * - Cycles (capability-aware, hidden if cyclesEnabled === false)
 * - Projects
 * - Docs
 * - Members
 */
export function TeamResourceNav({
  tabs,
  activeTab = 'overview',
  onTabChange,
  onSelectTab,
  cyclesEnabled = true,
  workCount,
  docsCount,
  projectsCount,
  membersCount
}) {
  const handleSelect = onTabChange || onSelectTab;

  const resolvedTabs = useMemo(() => {
    if (tabs && tabs.length > 0) {
      return tabs.filter(t => !t.hidden && (t.id !== 'cycles' || cyclesEnabled));
    }

    const defaultTabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'work', label: 'Work', badge: workCount },
      ...(cyclesEnabled ? [{ id: 'cycles', label: 'Cycles' }] : []),
      { id: 'projects', label: 'Projects', badge: projectsCount },
      { id: 'docs', label: 'Docs', badge: docsCount },
      { id: 'members', label: 'Members', badge: membersCount }
    ];

    return defaultTabs;
  }, [tabs, cyclesEnabled, workCount, projectsCount, docsCount, membersCount]);

  return (
    <nav
      aria-label="Team Resource Navigation"
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '36px',
        padding: '0 var(--space-4)',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        gap: 'var(--space-1)',
        overflowX: 'auto',
        flexShrink: 0
      }}
    >
      {resolvedTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = ICON_MAP[tab.id];

        return (
          <button
            key={tab.id}
            data-testid={`team-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect?.(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '28px',
              padding: '0 var(--space-2-5)',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: isActive ? 'var(--bg-surface-raised)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              fontWeight: isActive ? 'var(--font-semibold)' : 'var(--font-normal)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--duration-fast) ease'
            }}
          >
            {Icon && <Icon size={14} color={isActive ? 'var(--primary-base)' : 'currentColor'} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                style={{
                  fontSize: 'var(--text-2xs)',
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isActive ? 'var(--primary-subtle)' : 'var(--bg-surface-subtle)',
                  color: isActive ? 'var(--primary-base)' : 'var(--text-muted)'
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export default TeamResourceNav;
