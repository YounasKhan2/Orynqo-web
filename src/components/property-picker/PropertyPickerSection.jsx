import React from 'react';

/**
 * PropertyPickerSection Component
 * ARIA role="group" with accessible title for categorizing picker options
 */
export function PropertyPickerSection({ title, children }) {
  return (
    <div role="group" aria-label={title} style={{ margin: '4px 0' }}>
      {title && (
        <div
          style={{
            padding: '4px 8px',
            fontSize: '9px',
            fontWeight: 'var(--font-semibold, 600)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)'
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
