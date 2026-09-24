import React from 'react';

/**
 * AppShell Layout Component
 * Orchestrates navigation rail, contextual header, main viewport, and inspector drawer
 */
export function AppShell({
  sidebar,
  actionStrip,
  children,
  inspector,
  bulkActionBar,
  overlays
}) {
  return (
    <div
      className="app-shell-root"
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      {/* 1. Left Rail / Sidebar */}
      {sidebar}

      {/* 2. Central Main Workspace Column */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          height: '100%',
          overflow: 'hidden',
          minWidth: 0,
          position: 'relative'
        }}
      >
        {/* Context & Action Strip */}
        {actionStrip}

        {/* Dynamic Canvas Projection */}
        <main
          role="main"
          style={{
            flex: 1,
            height: '100%',
            overflow: 'hidden',
            display: 'flex'
          }}
        >
          {children}
        </main>

        {/* Multi-Select Floating Bulk Action Bar */}
        {bulkActionBar}
      </div>

      {/* 3. Right Contextual Inspector Drawer */}
      {inspector}

      {/* 4. Global Modals / Overlays */}
      {overlays}
    </div>
  );
}
