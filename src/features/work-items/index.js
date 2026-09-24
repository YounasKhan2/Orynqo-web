// Work Items Feature Public Exports (UI-01A)

export * from './components/WorkItemInspector';
export * from './components/WorkItemDetailContainer';
export * from './components/WorkItemHeader';
export * from './components/WorkItemTitle';
export * from './components/WorkItemProperties';
export * from './components/WorkItemDescription';
export * from './components/WorkItemSubItems';
export * from './components/WorkItemRelationships';
export * from './components/WorkItemLinkedDocs';
export * from './components/WorkItemDiscussion';
export * from './components/WorkItemActivity';
export * from './components/CreateItemModal';

// Re-export InspectorDrawer alias for backwards compatibility
export { WorkItemInspector as InspectorDrawer } from './components/WorkItemInspector';
