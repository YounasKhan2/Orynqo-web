import React from 'react';

/**
 * AppShell Layout Component
 * Coordinates the 4-region spatial grid:
 * 1. Sidebar (Persistent left rail on desktop, off-canvas sheet on mobile)
 * 2. ContextBar / ActionStrip (Top contextual identity, breadcrumbs, resource tabs)
 * 3. Main Workspace Canvas (Primary content projection)
 * 4. Contextual Inspector (Split panel on wide desktop, slide-over drawer on constrained viewports)
 * Plus independent floating overlays stratum.
 */
export function AppShell({
  sidebar,
  contextBar,
  actionStrip,
  children,
  inspector,
  bulkActionBar,
  overlays,
  isMobileNavOpen = false,
  onCloseMobileNav
}) {
  const effectiveHeader = contextBar || actionStrip;

  return (
    <div
      className="app-shell-root"
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-canvas)',
        position: 'relative'
      }}
    >
      {/* 1. Left Sidebar Rail (Desktop) */}
      <div
        className="app-shell-sidebar-desktop"
        style={{
          display: 'flex',
          height: '100%',
          flexShrink: 0
        }}
      >
        {sidebar}
      </div>

      {/* Mobile Sidebar Overlay Sheet (When mobile drawer is open) */}
      {isMobileNavOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile workspace navigation"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex'
          }}
        >
          {/* Backdrop */}
          <div
            onClick={onCloseMobileNav}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(2px)'
            }}
          />
          {/* Drawer Sheet */}
          <div
            style={{
              position: 'relative',
              width: 'min(85vw, 300px)',
              height: '100%',
              backgroundColor: 'var(--bg-sidebar)',
              boxShadow: 'var(--shadow-drawer)',
              zIndex: 101,
              display: 'flex'
            }}
          >
            {sidebar}
          </div>
        </div>
      )}

      {/* 2 & 3. Central Main Workspace Column */}
      <div
        className="app-shell-main-column"
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
        {/* ContextBar / ActionStrip */}
        {effectiveHeader}

        {/* Dynamic Canvas + Horizontal Inspector Container */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            height: '100%',
            overflow: 'hidden',
            minWidth: 0,
            position: 'relative'
          }}
        >
          {/* Primary Main Content Viewport */}
          <main
            role="main"
            aria-label="Primary content"
            style={{
              flex: 1,
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              minWidth: 0,
              position: 'relative'
            }}
          >
            {children}
          </main>

          {/* 4. Contextual Inspector (Horizontal Split on Desktop) */}
          {inspector}
        </div>

        {/* Floating Bulk Action Bar */}
        {bulkActionBar}
      </div>

      {/* 5. Independent Floating Overlays Stratum */}
      {overlays}
    </div>
  );
}
