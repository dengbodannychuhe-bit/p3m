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
const PROJECT_CACHE_KEY = 'councilP3MProjects';

const readCachedProjects = (): BackendProject[] => {
  if (typeof window === 'undefined') return [];

  try {
    const cached = window.localStorage.getItem(PROJECT_CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
};

const writeCachedProjects = (projects: BackendProject[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PROJECT_CACHE_KEY, JSON.stringify(projects));
};

const mergeProjects = (backendProjects: BackendProject[], cachedProjects: BackendProject[]) => {
  const projectMap = new Map<number, BackendProject>();

  cachedProjects.forEach(project => projectMap.set(project.id, project));
  backendProjects.forEach(project => projectMap.set(project.id, project));

  return Array.from(projectMap.values()).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

const createLocalProject = (data: Parameters<ProjectContextType['addProject']>[0]): BackendProject => ({
  id: Date.now(),
  title: data.title,
  description: data.description ?? null,
  jobCostNo: data.jobCostNo ?? null,
  manager: data.manager ?? null,
  departmentHead: data.departmentHead ?? null,
  budget: data.budget ?? null,
  stage: data.stage || 'Proposal',
  status: data.status || 'Pending Approval',
  approvalStatus: data.approvalStatus || 'Pending',
  priority: data.priority || 'Medium',
  department: data.department ?? null,
  program: data.program ?? null,
  startDate: data.startDate ?? null,
  endDate: data.endDate ?? null,
  createdAt: new Date().toISOString(),
  risks: [],
  issues: [],
  scopeChanges: [],
  benefits: [],
  grantMilestones: [],
});

// ------------------------------------------------------------
// Provider
// ------------------------------------------------------------
export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<BackendProject[]>(() => readCachedProjects());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getAll();
      setProjects(prev => {
        const merged = mergeProjects(data, prev.length ? prev : readCachedProjects());
        writeCachedProjects(merged);
        return merged;
      });
    } catch (err) {
      const cachedProjects = readCachedProjects();
      if (cachedProjects.length > 0) {
        setProjects(cachedProjects);
      }
      setError(cachedProjects.length > 0 ? null : err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Load projects on mount
  useEffect(() => {
    refreshProjects();
  }, []);

  const addProject: ProjectContextType['addProject'] = async (data) => {
    let created: BackendProject;

    try {
      created = await projectsApi.create(data);
    } catch {
      created = createLocalProject(data);
    }

    setProjects(prev => {
      const next = mergeProjects([created], prev);
      writeCachedProjects(next);
      return next;
    });
    return created;
  };

  const getProject: ProjectContextType['getProject'] = async (id) => {
    const fallbackProject = projects.find(project => project.id === id) ||
      readCachedProjects().find(project => project.id === id);

    try {
      const project = await projectsApi.getById(id);
      setProjects(prev => {
        const next = mergeProjects([project], prev);
        writeCachedProjects(next);
        return next;
      });
      return project;
    } catch (err) {
      if (fallbackProject) return fallbackProject;
      throw err;
    }
  };

  const updateProject: ProjectContextType['updateProject'] = async (id, data) => {
    const cachedProject = projects.find(project => project.id === id) ||
      readCachedProjects().find(project => project.id === id);
    let updated: BackendProject;

    try {
      updated = await projectsApi.update(id, data);
    } catch (err) {
      if (!cachedProject) throw err;
      updated = { ...cachedProject, ...data } as BackendProject;
    }

    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updated } : p);
      writeCachedProjects(next);
      return next;
    });
    return updated;
  };

  const deleteProject: ProjectContextType['deleteProject'] = async (id) => {
    const cachedProject = projects.find(project => project.id === id) ||
      readCachedProjects().find(project => project.id === id);

    try {
      await projectsApi.delete(id);
    } catch (err) {
      if (!cachedProject) throw err;
    }

    setProjects(prev => {
      const next = prev.filter(p => p.id !== id);
      writeCachedProjects(next);
      return next;
    });
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
