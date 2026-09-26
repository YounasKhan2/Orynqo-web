import React, { useState } from 'react';

/**
 * CYC-002: CyclePlanningWorkbench
 * High-density planning workbench featuring dual-pane layout:
 * - Left Pane: Team Backlog (uncommitted work eligible for planning)
 * - Right Pane: Next Upcoming Cycle (committed work)
 * 
 * In Narrow responsive mode, switches between Backlog and Upcoming tabs.
 * Supports multi-select, keyboard scheduling, and property inspection.
 */
export const CyclePlanningWorkbench = ({
  upcomingCycle,
  backlogItems = [],
  cycleItems = [],
  estimatesEnabled = true,
  canPlanWork = true,
  onScheduleItem,
  onUnscheduleItem,
  onSelectItem,
  selectedItemId = null,
  activeMobilePane = 'backlog',
  onMobilePaneChange,
}) => {
  const [selectedBacklogIds, setSelectedBacklogIds] = useState(new Set());
  const [selectedCycleIds, setSelectedCycleIds] = useState(new Set());

  // Toggle selection in Backlog
  const toggleBacklogSelection = (id) => {
    setSelectedBacklogIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle selection in Upcoming Cycle
  const toggleCycleSelection = (id) => {
    setSelectedCycleIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Batch schedule from Backlog to Cycle
  const handleBatchSchedule = () => {
    if (!upcomingCycle || !onScheduleItem) return;
    selectedBacklogIds.forEach(id => {
      onScheduleItem(id, upcomingCycle.id);
    });
    setSelectedBacklogIds(new Set());
  };

  // Batch unschedule from Cycle back to Backlog
  const handleBatchUnschedule = () => {
    if (!onUnscheduleItem) return;
    selectedCycleIds.forEach(id => {
      onUnscheduleItem(id);
    });
    setSelectedCycleIds(new Set());
  };

  const totalCyclePoints = cycleItems.reduce((acc, it) => acc + (it.points || 0), 0);
  const totalBacklogPoints = backlogItems.reduce((acc, it) => acc + (it.points || 0), 0);

  return (
    <div
      className="cycle-planning-workbench"
      data-testid="cycle-planning-workbench"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '480px',
        background: 'var(--color-bg-canvas, #0D1117)',
        color: 'var(--color-text-primary, #E6EDF3)',
      }}
    >
      {/* Workbench Header / Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border-subtle, #21262D)',
          background: 'var(--color-bg-surface, #161B22)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>Cycle Planning Workbench</span>
          {upcomingCycle && (
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(88, 166, 255, 0.15)',
                color: '#58A6FF',
                border: '1px solid rgba(88, 166, 255, 0.3)',
              }}
            >
              Upcoming Target: {upcomingCycle.name || upcomingCycle.sequence || upcomingCycle.id}
            </span>
          )}
        </div>

        {/* Responsive Mobile Switcher */}
        <div
          className="planning-responsive-tabs"
          style={{ display: 'flex', gap: '4px' }}
        >
          <button
            type="button"
            className={`btn-subtle btn-xs ${activeMobilePane === 'backlog' ? 'active' : ''}`}
            onClick={() => onMobilePaneChange && onMobilePaneChange('backlog')}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              borderRadius: '4px',
              background: activeMobilePane === 'backlog' ? 'var(--color-bg-active, #21262D)' : 'transparent',
              border: '1px solid var(--color-border-subtle, #30363D)',
              color: activeMobilePane === 'backlog' ? '#58A6FF' : 'inherit',
              cursor: 'pointer',
            }}
          >
            Backlog ({backlogItems.length})
          </button>
          <button
            type="button"
            className={`btn-subtle btn-xs ${activeMobilePane === 'upcoming' ? 'active' : ''}`}
            onClick={() => onMobilePaneChange && onMobilePaneChange('upcoming')}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              borderRadius: '4px',
              background: activeMobilePane === 'upcoming' ? 'var(--color-bg-active, #21262D)' : 'transparent',
              border: '1px solid var(--color-border-subtle, #30363D)',
              color: activeMobilePane === 'upcoming' ? '#58A6FF' : 'inherit',
              cursor: 'pointer',
            }}
          >
            Upcoming Cycle ({cycleItems.length})
          </button>
        </div>
      </div>

      {/* Dual Pane / Responsive Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* LEFT PANE: Backlog */}
        <div
          data-testid="planning-pane-backlog"
          style={{
            borderRight: '1px solid var(--color-border-subtle, #21262D)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Backlog Pane Header */}
          <div
            style={{
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderBottom: '1px solid var(--color-border-subtle, #21262D)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted, #8B949E)' }}>
                TEAM BACKLOG
              </span>
              <span
                style={{
                  fontSize: '11px',
                  background: 'var(--color-bg-active, #21262D)',
                  padding: '1px 6px',
                  borderRadius: '10px',
                }}
              >
                {backlogItems.length} items
              </span>
              {estimatesEnabled && totalBacklogPoints > 0 && (
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #8B949E)' }}>
                  ({totalBacklogPoints} pts)
                </span>
              )}
            </div>

            {canPlanWork && selectedBacklogIds.size > 0 && (
              <button
                type="button"
                data-testid="batch-schedule-btn"
                onClick={handleBatchSchedule}
                disabled={!upcomingCycle}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  background: '#238636',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Schedule {selectedBacklogIds.size} to Cycle →
              </button>
            )}
          </div>

          {/* Backlog Items List */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {backlogItems.length === 0 ? (
              <div
                data-testid="planning-empty-backlog"
                style={{
                  textAlign: 'center',
                  padding: '48px 16px',
                  color: 'var(--color-text-muted, #8B949E)',
                  fontSize: '12px',
                }}
              >
                Backlog is empty. All unstarted work is committed or resolved.
              </div>
            ) : (
              backlogItems.map(item => {
                const isSelected = selectedItemId === item.id;
                const isChecked = selectedBacklogIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    data-testid={`planning-item-${item.id}`}
                    onClick={() => onSelectItem && onSelectItem(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: isSelected ? 'rgba(88, 166, 255, 0.1)' : 'var(--color-bg-surface, #161B22)',
                      border: `1px solid ${isSelected ? '#58A6FF' : 'var(--color-border-subtle, #30363D)'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                      {canPlanWork && (
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleBacklogSelection(item.id);
                          }}
                          aria-label={`Select ${item.title}`}
                          style={{ cursor: 'pointer' }}
                        />
                      )}
                      <span style={{ fontSize: '11px', color: '#8B949E', fontFamily: 'monospace' }}>
                        {item.key || item.id}
                      </span>
                      <span
                        style={{
                          fontSize: '13px',
                          color: 'var(--color-text-primary, #E6EDF3)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {estimatesEnabled && item.points !== undefined && (
                        <span
                          style={{
                            fontSize: '11px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            color: '#8B949E',
                          }}
                        >
                          {item.points} pt{item.points === 1 ? '' : 's'}
                        </span>
                      )}
                      {canPlanWork && upcomingCycle && (
                        <button
                          type="button"
                          data-testid={`schedule-btn-${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onScheduleItem && onScheduleItem(item.id, upcomingCycle.id);
                          }}
                          title="Schedule to Upcoming Cycle"
                          style={{
                            fontSize: '11px',
                            padding: '2px 6px',
                            background: 'rgba(88, 166, 255, 0.1)',
                            border: '1px solid rgba(88, 166, 255, 0.3)',
                            color: '#58A6FF',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: Upcoming Cycle */}
        <div
          data-testid="planning-pane-upcoming"
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Upcoming Pane Header */}
          <div
            style={{
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderBottom: '1px solid var(--color-border-subtle, #21262D)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted, #8B949E)' }}>
                {upcomingCycle ? (upcomingCycle.name || upcomingCycle.sequence || upcomingCycle.id).toUpperCase() : 'NO UPCOMING CYCLE'}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  background: 'var(--color-bg-active, #21262D)',
                  padding: '1px 6px',
                  borderRadius: '10px',
                }}
              >
                {cycleItems.length} committed
              </span>
              {estimatesEnabled && (
                <span style={{ fontSize: '11px', color: '#58A6FF' }}>
                  ({totalCyclePoints} pts committed)
                </span>
              )}
            </div>

            {canPlanWork && selectedCycleIds.size > 0 && (
              <button
                type="button"
                data-testid="batch-unschedule-btn"
                onClick={handleBatchUnschedule}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  background: 'rgba(248, 81, 73, 0.15)',
                  color: '#F85149',
                  border: '1px solid rgba(248, 81, 73, 0.3)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                ← Return {selectedCycleIds.size} to Backlog
              </button>
            )}
          </div>

          {/* Upcoming Items List */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {!upcomingCycle ? (
              <div
                data-testid="planning-no-upcoming-cycle"
                style={{
                  textAlign: 'center',
                  padding: '48px 16px',
                  color: 'var(--color-text-muted, #8B949E)',
                  fontSize: '12px',
                }}
              >
                No upcoming cycle defined. Create or schedule an upcoming cycle to commit planned scope.
              </div>
            ) : cycleItems.length === 0 ? (
              <div
                data-testid="planning-empty-cycle"
                style={{
                  textAlign: 'center',
                  padding: '48px 16px',
                  color: 'var(--color-text-muted, #8B949E)',
                  fontSize: '12px',
                }}
              >
                No items committed to this cycle yet. Add work items from the Backlog.
              </div>
            ) : (
              cycleItems.map(item => {
                const isSelected = selectedItemId === item.id;
                const isChecked = selectedCycleIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    data-testid={`cycle-item-${item.id}`}
                    onClick={() => onSelectItem && onSelectItem(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: isSelected ? 'rgba(88, 166, 255, 0.1)' : 'var(--color-bg-surface, #161B22)',
                      border: `1px solid ${isSelected ? '#58A6FF' : 'var(--color-border-subtle, #30363D)'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                      {canPlanWork && (
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleCycleSelection(item.id);
                          }}
                          aria-label={`Select ${item.title}`}
                          style={{ cursor: 'pointer' }}
                        />
                      )}
                      <span style={{ fontSize: '11px', color: '#8B949E', fontFamily: 'monospace' }}>
                        {item.key || item.id}
                      </span>
                      <span
                        style={{
                          fontSize: '13px',
                          color: 'var(--color-text-primary, #E6EDF3)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {estimatesEnabled && item.points !== undefined && (
                        <span
                          style={{
                            fontSize: '11px',
                            background: 'rgba(88, 166, 255, 0.15)',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            color: '#58A6FF',
                          }}
                        >
                          {item.points} pt{item.points === 1 ? '' : 's'}
                        </span>
                      )}
                      {canPlanWork && (
                        <button
                          type="button"
                          data-testid={`unschedule-btn-${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnscheduleItem && onUnscheduleItem(item.id);
                          }}
                          title="Return to Backlog"
                          style={{
                            fontSize: '11px',
                            padding: '2px 6px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--color-border-subtle, #30363D)',
                            color: 'var(--color-text-muted, #8B949E)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          - Backlog
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyclePlanningWorkbench;
