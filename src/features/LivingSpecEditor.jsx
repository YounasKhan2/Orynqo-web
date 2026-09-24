import React from 'react';
import { LIVING_DOCUMENTS, USERS, PROJECTS } from '../data/mockData';
import { StatusBadge, PriorityBadge } from '../design-system/primitives/Badge';
import { Avatar } from '../design-system/primitives/Avatar';
import { STATUS_DEFINITIONS, PRIORITY_DEFINITIONS } from '../design-system/tokens';
import { FileText, Sparkles, CheckCircle2, Plus, Clock, ExternalLink } from 'lucide-react';

/**
 * LivingSpecEditor Feature
 * The Zero-Drift Specification-to-Execution Engine
 * Documents and Work Items live in the exact same database.
 */
export function LivingSpecEditor({
  items = [],
  onUpdateItem,
  onOpenInspector
}) {
  const doc = LIVING_DOCUMENTS[0];
  const author = USERS.find((u) => u.id === doc.authorId);
  const project = PROJECTS.find((p) => p.id === doc.projectId);

  // Filter the live work items linked to this PRD
  const linkedItems = items.filter((it) => doc.content.sections[2].linkedItemIds.includes(it.id));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        backgroundColor: 'var(--bg-canvas)',
        padding: 'var(--space-6) var(--space-8)'
      }}
    >
      <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Document Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: 'var(--primary-text)',
                backgroundColor: 'var(--primary-subtle)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)',
                fontWeight: 'var(--font-medium)'
              }}
            >
              <Sparkles size={11} />
              Living Product Requirement Document
            </span>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              v{doc.version}
            </span>
          </div>

          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {doc.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Avatar user={author} size="xs" />
              <span>Authored by <strong style={{ color: 'var(--text-secondary)' }}>{author.name}</strong></span>
            </div>
            <span>•</span>
            <span>Target Project: <strong style={{ color: 'var(--text-secondary)' }}>{project.name}</strong></span>
            <span>•</span>
            <span>Last synchronized: <strong>Just now</strong></span>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
            {doc.content.sections[0].heading}
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--line-height-relaxed)', color: 'var(--text-secondary)' }}>
            {doc.content.sections[0].body}
          </p>
        </div>

        {/* Section 2: Target Performance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
            {doc.content.sections[1].heading}
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--line-height-relaxed)', color: 'var(--text-secondary)' }}>
            {doc.content.sections[1].body}
          </p>
        </div>

        {/* Section 3: LIVE EMBEDDED DELIVERABLES TABLE (Zero-Drift Engine) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
                {doc.content.sections[2].heading}
              </h2>
              <span
                style={{
                  fontSize: '10px',
                  backgroundColor: 'var(--status-done-bg)',
                  color: 'var(--status-done)',
                  border: '1px solid var(--status-done)',
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-xs)',
                  fontWeight: 'var(--font-semibold)'
                }}
              >
                LIVE SYNC ACTIVE
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Updates reflect immediately across Engineering Backlog
            </span>
          </div>

          {/* Embedded Work Items Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', overflow: 'hidden' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 110px 90px 120px 40px',
                alignItems: 'center',
                height: '28px',
                backgroundColor: 'var(--bg-surface-subtle)',
                fontSize: '11px',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--text-muted)',
                padding: '0 8px'
              }}
            >
              <div>ID</div>
              <div>Title</div>
              <div>Status</div>
              <div>Priority</div>
              <div>Assignee</div>
              <div>Action</div>
            </div>

            {linkedItems.map((item) => {
              const itemAssignee = USERS.find((u) => u.id === item.assigneeId);

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 110px 90px 120px 40px',
                    alignItems: 'center',
                    height: '32px',
                    padding: '0 8px',
                    fontSize: 'var(--text-xs)',
                    borderTop: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)'
                  }}
                >
                  <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                    {item.identifier}
                  </span>
                  <span className="truncate" style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-medium)' }}>
                    {item.title}
                  </span>
                  <div>
                    <StatusBadge
                      statusId={item.status}
                      interactive
                      onClick={() => {
                        const statusKeys = Object.keys(STATUS_DEFINITIONS);
                        const nextIdx = (statusKeys.indexOf(item.status) + 1) % statusKeys.length;
                        onUpdateItem(item.id, { status: statusKeys[nextIdx] });
                      }}
                    />
                  </div>
                  <div>
                    <PriorityBadge
                      priorityId={item.priority}
                      interactive
                      onClick={() => {
                        const priorityKeys = ['none', 'low', 'medium', 'high', 'urgent'];
                        const nextIdx = (priorityKeys.indexOf(item.priority) + 1) % priorityKeys.length;
                        onUpdateItem(item.id, { priority: priorityKeys[nextIdx] });
                      }}
                    />
                  </div>
                  <Avatar user={itemAssignee} size="xs" showName />
                  <button
                    type="button"
                    onClick={() => onOpenInspector(item)}
                    title="Open in Inspector Drawer"
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <ExternalLink size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Edge Cases */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
            {doc.content.sections[3].heading}
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--line-height-relaxed)', color: 'var(--text-secondary)' }}>
            {doc.content.sections[3].body}
          </p>
        </div>
      </div>
    </div>
  );
}
