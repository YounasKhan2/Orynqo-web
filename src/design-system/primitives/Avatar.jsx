import React from 'react';

/**
 * Avatar Primitive (Domain-Neutral)
 * Represents an entity avatar with initials fallback and presence indicator
 * Sizes: xs (18px) | sm (22px) | md (28px) | lg (36px)
 */
export function Avatar({
  src,
  name,
  initials,
  size = 'sm',
  showName = false,
  subtitle,
  presence, // 'online' | 'offline' | 'busy'
  className = '',
  style = {}
}) {
  const getDimensions = () => {
    switch (size) {
      case 'xs': return 18;
      case 'md': return 28;
      case 'lg': return 36;
      case 'sm':
      default: return 22;
    }
  };

  const dim = getDimensions();

  const getComputedInitials = () => {
    if (initials) return initials;
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return '—';
  };

  if (!src && !name && !initials) {
    return (
      <div
        className={`avatar-placeholder ${className}`}
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
          flexShrink: 0,
          ...style
        }}
      >
        —
      </div>
    );
  }

  return (
    <div
      className={`avatar-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        lineHeight: 1,
        ...style
      }}
    >
      <div
        style={{
          position: 'relative',
          width: `${dim}px`,
          height: `${dim}px`,
          borderRadius: '50%',
          overflow: 'visible',
          flexShrink: 0
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-surface-active)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size === 'xs' ? '9px' : size === 'lg' ? '14px' : '11px',
            fontWeight: 'var(--font-medium)',
            color: 'var(--text-primary)'
          }}
        >
          {src ? (
            <img
              src={src}
              alt={name || 'Avatar'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span>{getComputedInitials()}</span>
          )}
        </div>

        {presence && (
          <span
            style={{
              position: 'absolute',
              bottom: '-1px',
              right: '-1px',
              width: size === 'xs' ? '5px' : '7px',
              height: size === 'xs' ? '5px' : '7px',
              borderRadius: '50%',
              backgroundColor:
                presence === 'online'
                  ? 'var(--status-done)'
                  : presence === 'busy'
                  ? 'var(--priority-urgent)'
                  : 'var(--text-muted)',
              border: '1.5px solid var(--bg-surface)'
            }}
          />
        )}
      </div>

      {(showName || subtitle) && (
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {showName && (
            <span
              className="truncate"
              style={{
                fontSize: size === 'xs' ? 'var(--text-xs)' : 'var(--text-sm)',
                color: 'var(--text-primary)',
                fontWeight: 'var(--font-regular)'
              }}
            >
              {name}
            </span>
          )}
          {subtitle && (
            <span
              className="truncate"
              style={{
                fontSize: '10px',
                color: 'var(--text-muted)'
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
