import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';

/**
 * TeamDocs Component (TEM-005)
 *
 * Contextual document collection filtering canonical knowledge artifacts owned by this squad.
 */
export function TeamDocs({
  documents = [],
  onNavigateToDoc
}) {
  return (
    <div
      role="region"
      aria-label="Team Documents"
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
        <FileText size={16} color="var(--primary-base)" />
        <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', margin: 0 }}>
          Team Knowledge Base & Runbooks ({documents.length})
        </h2>
      </div>

      {documents.length === 0 ? (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>No team documents found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-3)' }}>
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onNavigateToDoc?.(doc.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
                gap: 'var(--space-2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
                  {doc.title}
                </span>
                <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
                  v{doc.version || '1.0'}
                </span>
              </div>

              {doc.summary && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)', margin: 0 }}>
                  {doc.summary}
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Updated {new Date(doc.updatedAt || Date.now()).toLocaleDateString()}</span>
                <span style={{ color: 'var(--primary-base)', fontWeight: 'var(--font-medium)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  Read <ArrowRight size={10} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
