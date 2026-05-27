// ============================================================
// src/app/context/ProjectContext.tsx
// Replaces all hardcoded mock data with real backend API calls.
// ============================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  projectsApi,
  risksApi,
  issuesApi,
  scopeChangesApi,
  benefitsApi,
  grantMilestonesApi,
  BackendProject,
  BackendRisk,
  BackendIssue,
  BackendScopeChange,
  BackendBenefit,
  BackendGrantMilestone,
} from '../services/api';

// ------------------------------------------------------------
// Context type — exposes projects and all mutation functions
// ------------------------------------------------------------
interface ProjectContextType {
  projects: BackendProject[];
  loading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
  addProject: (data: {
    title: string;
    description?: string;
    jobCostNo?: string;
    manager?: string;
    departmentHead?: string;
    budget?: number;
    stage?: string;
    status?: string;
    approvalStatus?: string;
    priority?: string;
    department?: string;
    program?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<BackendProject>;
  getProject: (id: number) => Promise<BackendProject>;
  updateProject: (id: number, data: Partial<{
    title: string; description: string; jobCostNo: string | null; manager: string; departmentHead: string | null;
    budget: number | null; stage: string; status: string;
      approvalStatus: string; priority: string; department: string;
      program: string;
      startDate: string; endDate: string;
  }>) => Promise<BackendProject>;
  deleteProject: (id: number) => Promise<void>;
  addRisk: (data: {
    title: string;
    description?: string;
    severity?: string;
    status?: string;
    projectId: number;
  }) => Promise<BackendRisk>;
  addIssue: (data: {
    title: string;
    description?: string;
    priority?: string;
    status?: string;
    projectId: number;
  }) => Promise<BackendIssue>;
  addScopeChange: (data: {
    title: string;
    description?: string;
    reason?: string;
    status?: string;
    projectId: number;
  }) => Promise<BackendScopeChange>;
  addBenefit: (data: {
    title: string;
    description?: string;
    status?: string;
    projectId: number;
  }) => Promise<BackendBenefit>;
  addGrantMilestone: (data: {
    title: string;
    description?: string;
    dueDate?: string;
    status?: string;
    complianceStatus?: string;
    projectId: number;
  }) => Promise<BackendGrantMilestone>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// ------------------------------------------------------------
// Provider
// ------------------------------------------------------------
export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<BackendProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Load projects on mount
  useEffect(() => {
    refreshProjects();
  }, []);

  const addProject: ProjectContextType['addProject'] = async (data) => {
    const created = await projectsApi.create(data);
    setProjects(prev => [created, ...prev]);
    return created;
  };

  const getProject: ProjectContextType['getProject'] = async (id) => {
    return projectsApi.getById(id);
  };

  const updateProject: ProjectContextType['updateProject'] = async (id, data) => {
    const updated = await projectsApi.update(id, data);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    return updated;
  };

  const deleteProject: ProjectContextType['deleteProject'] = async (id) => {
    await projectsApi.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const addRisk: ProjectContextType['addRisk'] = async (data) => {
    return risksApi.create(data);
  };

  const addIssue: ProjectContextType['addIssue'] = async (data) => {
    return issuesApi.create(data);
  };

  const addScopeChange: ProjectContextType['addScopeChange'] = async (data) => {
    return scopeChangesApi.create(data);
  };

  const addBenefit: ProjectContextType['addBenefit'] = async (data) => {
    return benefitsApi.create(data);
  };

  const addGrantMilestone: ProjectContextType['addGrantMilestone'] = async (data) => {
    return grantMilestonesApi.create(data);
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      loading,
      error,
      refreshProjects,
      addProject,
      getProject,
      updateProject,
      deleteProject,
      addRisk,
      addIssue,
      addScopeChange,
      addBenefit,
      addGrantMilestone,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

// ------------------------------------------------------------
// Hook
// ------------------------------------------------------------
export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}

// ------------------------------------------------------------
// Re-export backend types so pages don't need to import from
// two places
// ------------------------------------------------------------
export type {
  BackendProject as Project,
  BackendRisk as Risk,
  BackendIssue as Issue,
  BackendScopeChange as ScopeChange,
  BackendBenefit as Benefit,
  BackendGrantMilestone as GrantMilestone,
};
