import React from 'react';

/**
 * Avatar Component
 * Sizes: xs (18px) | sm (22px) | md (28px)
 */
export function Avatar({
  user,
  size = 'sm',
  showName = false,
  className = ''
}) {
  const getDimensions = () => {
    switch (size) {
      case 'xs': return 18;
      case 'md': return 28;
      case 'sm':
      default: return 22;
    }
  };

  const dim = getDimensions();

  if (!user) {
    return (
      <div
        title="Unassigned"
        style={{
          width: `${dim}px`,
          height: `${dim}px`,
          borderRadius: '50%',
          border: '1px dashed var(--border-strong)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--text-2xs)',
          color: 'var(--text-muted)',
          backgroundColor: 'transparent',
          flexShrink: 0
        }}
      >
        —
      </div>
    );
  }

  return (
    <div
      className={`avatar-container ${className}`}
      title={`${user.name} (${user.role || 'Member'})`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        lineHeight: 1
      }}
    >
      <div
        style={{
          width: `${dim}px`,
          height: `${dim}px`,
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface-active)',
          border: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size === 'xs' ? '9px' : '11px',
          fontWeight: 'var(--font-medium)',
          color: 'var(--text-primary)',
          flexShrink: 0
        }}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span>{user.initials || user.name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      {showName && (
        <span
          className="truncate"
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-primary)',
            fontWeight: 'var(--font-regular)'
          }}
        >
          {user.name}
        </span>
      )}
    </div>
  );
}
