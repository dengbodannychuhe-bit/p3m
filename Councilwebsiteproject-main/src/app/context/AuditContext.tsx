import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuditLog, Notification, PublicUpdate } from '../types/audit';
import { useAuth } from './AuthContext';

interface AuditContextType {
  auditLogs: AuditLog[];
  notifications: Notification[];
  publicUpdates: PublicUpdate[];
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp' | 'userId' | 'userName' | 'userRole'>) => void;
  updateAuditLog: (id: string, log: Partial<Omit<AuditLog, 'id' | 'timestamp' | 'userId' | 'userName' | 'userRole'>>) => void;
  deleteAuditLog: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  completeNotificationAction: (id: string) => void;
  deleteNotification: (id: string) => void;
  escalateNotification: (id: string) => void;
  addPublicUpdate: (update: Omit<PublicUpdate, 'id' | 'publishedAt' | 'publishedBy'>) => void;
  updatePublicUpdate: (id: string, update: Partial<Omit<PublicUpdate, 'id' | 'publishedAt' | 'publishedBy'>>) => void;
  deletePublicUpdate: (id: string) => void;
  getProjectAuditLogs: (projectId: string) => AuditLog[];
  getUnreadNotificationCount: () => number;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

// Mock initial data
const mockAuditLogs: AuditLog[] = [
  {
    id: 'al1',
    timestamp: '2026-05-01T10:30:00',
    userId: '2',
    userName: 'Sarah Johnson',
    userRole: 'Project Manager',
    action: 'Created',
    entityType: 'Milestone',
    entityId: 'gm-1',
    entityName: 'Phase 1 Completion',
    projectId: '1',
    description: 'Created new grant milestone for Community Centre Renovation',
  },
  {
    id: 'al2',
    timestamp: '2026-05-01T09:15:00',
    userId: '1',
    userName: 'Admin User',
    userRole: 'Admin',
    action: 'Updated',
    entityType: 'Project',
    entityId: '1',
    entityName: 'Community Centre Renovation',
    projectId: '1',
    changes: [
      { field: 'Status', oldValue: 'Planning', newValue: 'Active' }
    ],
    description: 'Changed project status from Planning to Active',
  },
  {
    id: 'al3',
    timestamp: '2026-04-30T16:45:00',
    userId: '2',
    userName: 'Sarah Johnson',
    userRole: 'Project Manager',
    action: 'Created',
    entityType: 'Risk',
    entityId: 'r1',
    entityName: 'Asbestos Discovery',
    projectId: '1',
    description: 'Added new risk to Community Centre Renovation',
  },
];

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    userId: '2',
    type: 'Deadline',
    title: 'Milestone Due Soon',
    message: 'Phase 1 Completion milestone is due in 3 days',
    projectId: '1',
    projectName: 'Community Centre Renovation',
    read: false,
    createdAt: '2026-05-01T08:00:00',
    actionUrl: '/projects/1',
  },
  {
    id: 'n2',
    userId: '2',
    type: 'Status Change',
    title: 'Project Status Updated',
    message: 'Community Centre Renovation status changed to Active',
    projectId: '1',
    projectName: 'Community Centre Renovation',
    read: false,
    createdAt: '2026-05-01T09:20:00',
    actionUrl: '/projects/1',
  },
  {
    id: 'n3',
    userId: '1',
    type: 'Alert',
    title: 'Critical Risk Identified',
    message: 'New critical risk added to Digital Services Platform',
    projectId: '3',
    projectName: 'Digital Services Platform',
    read: true,
    createdAt: '2026-04-30T14:30:00',
    actionUrl: '/projects/3',
  },
];

const mockPublicUpdates: PublicUpdate[] = [
  {
    id: 'pu1',
    projectId: '1',
    projectName: 'Community Centre Renovation',
    title: 'Construction Milestone Reached',
    description: 'We are pleased to announce that the demolition phase has been completed successfully. The project is now moving into the construction phase.',
    publishedBy: 'Sarah Johnson',
    publishedAt: '2026-05-01T10:00:00',
    category: 'Milestone',
    isPublic: true,
  },
  {
    id: 'pu2',
    projectId: '2',
    projectName: 'Park Improvement Program',
    title: 'Community Consultation Complete',
    description: 'Thank you to all community members who participated in our consultation sessions. Your feedback has been incorporated into the park design.',
    publishedBy: 'Admin User',
    publishedAt: '2026-04-28T15:30:00',
    category: 'Announcement',
    isPublic: true,
  },
];

export function AuditProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [publicUpdates, setPublicUpdates] = useState<PublicUpdate[]>(mockPublicUpdates);

  const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp' | 'userId' | 'userName' | 'userRole'>) => {
    if (!user) return;

    const newLog: AuditLog = {
      ...log,
      id: `al-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    };

    setAuditLogs(prev => [newLog, ...prev]);
  };

  const updateAuditLog = (id: string, log: Partial<Omit<AuditLog, 'id' | 'timestamp' | 'userId' | 'userName' | 'userRole'>>) => {
    setAuditLogs(prev =>
      prev.map(item => item.id === id ? { ...item, ...log } : item)
    );
  };

  const deleteAuditLog = (id: string) => {
    setAuditLogs(prev => prev.filter(item => item.id !== id));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `n-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const completeNotificationAction = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const escalateNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id
        ? {
            ...n,
            type: 'Alert',
            read: false,
            title: n.title.startsWith('Escalated:') ? n.title : `Escalated: ${n.title}`,
          }
        : n
      )
    );
  };

  const addPublicUpdate = (update: Omit<PublicUpdate, 'id' | 'publishedAt' | 'publishedBy'>) => {
    if (!user) return;

    const newUpdate: PublicUpdate = {
      ...update,
      id: `pu-${Date.now()}`,
      publishedAt: new Date().toISOString(),
      publishedBy: user.name,
    };

    setPublicUpdates(prev => [newUpdate, ...prev]);
  };

  const updatePublicUpdate = (id: string, update: Partial<Omit<PublicUpdate, 'id' | 'publishedAt' | 'publishedBy'>>) => {
    setPublicUpdates(prev =>
      prev.map(item => item.id === id ? { ...item, ...update } : item)
    );
  };

  const deletePublicUpdate = (id: string) => {
    setPublicUpdates(prev => prev.filter(item => item.id !== id));
  };

  const getUnreadNotificationCount = () => {
    if (!user) return 0;
    return notifications.filter(n => n.userId === user.id && !n.read).length;
  };

  const getProjectAuditLogs = (projectId: string) =>
    auditLogs.filter(log => log.projectId === projectId);

  return (
    <AuditContext.Provider
      value={{
        auditLogs,
        notifications,
        publicUpdates,
        addAuditLog,
        updateAuditLog,
        deleteAuditLog,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        completeNotificationAction,
        deleteNotification,
        escalateNotification,
        addPublicUpdate,
        updatePublicUpdate,
        deletePublicUpdate,
        getProjectAuditLogs,
        getUnreadNotificationCount,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
}
