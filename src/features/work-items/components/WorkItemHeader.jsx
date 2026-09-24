import React from 'react';
import { Copy, Maximize2, Minimize2, Bell, BellOff, X, Check } from 'lucide-react';
import { TypeBadge } from '../../../components/badges';

/**
 * WorkItemHeader Component
 * Canonical header bar for WorkItem Inspector and Full-Page views
 */
export function WorkItemHeader({
  item,
  isExpanded = false,
  onToggleExpand,
  isSubscribed = false,
  onToggleSubscribe,
  onClose,
  isReadOnly = false,
  teamName,
  projectName
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: '8px'
      }}
    >
      {/* Left: Identifier, Type, Context Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
        <span
          className="font-mono"
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--text-primary)',
            letterSpacing: '0.02em'
          }}
        >
          {item.identifier}
        </span>
        <TypeBadge typeId={item.type} />
        {(teamName || projectName) && (
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {[teamName, projectName].filter(Boolean).join(' / ')}
          </span>
        )}
        {isReadOnly && (
          <span
            style={{
              fontSize: '10px',
              padding: '1px 5px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-muted)'
            }}
          >
            Read-only
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
        {/* Watch / Subscribe toggle */}
        <button
          type="button"
          onClick={onToggleSubscribe}
          title={isSubscribed ? 'Unwatch issue' : 'Watch issue'}
          aria-label={isSubscribed ? 'Unwatch issue' : 'Watch issue'}
          style={{
            background: 'none',
            border: 'none',
            color: isSubscribed ? 'var(--primary-text)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: 'var(--radius-xs)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {isSubscribed ? <Bell size={13} fill="currentColor" /> : <BellOff size={13} />}
        </button>

        {/* Copy Reference Link */}
        <button
          type="button"
          onClick={handleCopyLink}
          title={copied ? 'Copied link!' : 'Copy reference link'}
          aria-label="Copy reference link"
          style={{
            background: 'none',
            border: 'none',
            color: copied ? 'var(--status-done)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: 'var(--radius-xs)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>

        {/* Expand / Maximize toggle */}
        {onToggleExpand && (
          <button
            type="button"
            onClick={onToggleExpand}
            title={isExpanded ? 'Collapse panel' : 'Maximize panel'}
            aria-label={isExpanded ? 'Collapse panel' : 'Maximize panel'}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        )}

        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            title="Close inspector (Esc)"
            aria-label="Close inspector"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
