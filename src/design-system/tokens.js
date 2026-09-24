// Design System Tokens (Pure Visual Constants)

export const SPACING = {
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px'
};

export const DENSITIES = {
  compact: {
    rowHeight: 28,
    controlHeight: 28,
    label: 'Compact (28px)'
  },
  default: {
    rowHeight: 34,
    controlHeight: 32,
    label: 'Default (34px)'
  }
};

export const RADII = {
  xs: '3px',
  sm: '4px',
  md: '6px',
  lg: '8px'
};

export const DURATIONS = {
  instant: '75ms',
  fast: '120ms',
  normal: '180ms',
  slow: '240ms'
};

// Re-export domain constants for backward compatibility
export * from '../constants/workItems';
