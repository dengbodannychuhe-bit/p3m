export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: 'Admin' | 'Project Manager' | 'Staff Member';
  action: string;
  entityType: 'Project' | 'Program' | 'Risk' | 'Issue' | 'Benefit' | 'Milestone' | 'Scope Change' | 'Activity';
  entityId: string;
  entityName: string;
  projectId?: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  description: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'Deadline' | 'Status Change' | 'Assignment' | 'Alert';
  title: string;
  message: string;
  projectId?: string;
  projectName?: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface PublicUpdate {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  publishedBy: string;
  publishedAt: string;
  category: 'Progress' | 'Milestone' | 'Announcement' | 'Completion';
  isPublic: boolean;
}
