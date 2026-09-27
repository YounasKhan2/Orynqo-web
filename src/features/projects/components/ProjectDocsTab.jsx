import React from 'react';
import { FileText, Plus, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';

/**
 * ProjectDocsTab Component (PRJ-003)
 *
 * Curated catalogue of canonical workspace documents associated with this Project:
 * - Queries canonical documents where doc.projectId === project.id.
 * - Does NOT create parallel ProjectDocument or ProjectDocStore models.
 * - Clicking a document delegates to canonical DOC-002 Document Canvas.
 * - Quick create associates newly created document with current project.
 */
export function ProjectDocsTab({
  project,
  documents = [],
  onNavigateToDoc,
  onCreateDocument,
  canCreate = true
}) {
  // Filter canonical documents associated with this project exclusively via canonical associations
  const projectDocs = (documents || []).filter((doc) => {
    if (doc.lifecycle === 'archived') return false;
    const docProjectIds = doc.projectIds || [];
    return docProjectIds.includes(project?.id);
  });

  return (
    <div
      role="region"
      aria-label="Project Documents"
      data-testid="project-docs-tab"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        padding: 'var(--space-6, 24px)',
        backgroundColor: 'var(--bg-canvas, #0f172a)',
        gap: 'var(--space-4, 16px)'
      }}
    >
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="var(--primary-base, #3b82f6)" />
          <h2 style={{ fontSize: 'var(--text-md, 16px)', fontWeight: 700, color: 'var(--text-primary, #f8fafc)', margin: 0 }}>
            Project Documents ({projectDocs.length})
          </h2>
        </div>

        {canCreate && (
          <button
            type="button"
            data-testid="create-project-doc-btn"
            onClick={() =>
              onCreateDocument?.({
                projectIds: [project?.id],
                title: `${project?.name || 'Project'} Document`
              })
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '30px',
              padding: '0 12px',
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'var(--primary-base, #3b82f6)',
              color: '#ffffff',
              border: 'none',
              fontSize: 'var(--text-xs, 12px)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={14} />
            <span>New Document</span>
          </button>
        )}
      </div>

      {/* Docs Grid */}
      {projectDocs.length === 0 ? (
        <div
          data-testid="project-docs-empty"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-12, 48px) var(--space-4, 16px)',
            gap: 'var(--space-3, 12px)',
            backgroundColor: 'var(--bg-surface, #1e293b)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border-default, #334155)',
            color: 'var(--text-muted, #94a3b8)'
          }}
        >
          <BookOpen size={32} />
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: 'var(--text-md, 16px)', fontWeight: 600, color: 'var(--text-primary, #f8fafc)', margin: '0 0 4px' }}>
              No documents associated
            </h3>
            <p style={{ fontSize: 'var(--text-xs, 12px)', margin: 0 }}>
              Create architectural specs, charters, and decision records for this project.
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-3, 12px)'
          }}
        >
          {projectDocs.map((doc) => (
            <div
              key={doc.id}
              data-testid={`project-doc-item-${doc.id}`}
              onClick={() => onNavigateToDoc?.(doc.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: 'var(--space-4, 16px)',
                backgroundColor: 'var(--bg-surface, #1e293b)',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border-default, #334155)',
                cursor: 'pointer',
                gap: 'var(--space-2, 8px)',
                transition: 'border-color 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{doc.icon || '📄'}</span>
                  <span style={{ fontSize: 'var(--text-sm, 14px)', fontWeight: 600, color: 'var(--text-primary, #f8fafc)' }}>
                    {doc.title}
                  </span>
                </div>
                <ArrowRight size={14} color="var(--text-muted, #94a3b8)" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 'var(--space-2, 8px)', fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
                <span>Updated {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}</span>
                {doc.parentDocId && <span>Child doc</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
