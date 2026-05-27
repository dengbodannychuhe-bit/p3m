// ============================================================
// src/app/services/api.ts
// Central API service — all backend calls go through here.
// The backend runs on http://localhost:3000
// ============================================================

const BASE_URL = `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api`;

// ------------------------------------------------------------
// Helper: wraps fetch with error handling
// ------------------------------------------------------------
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

// ------------------------------------------------------------
// Types matching the backend's Prisma schema
// ------------------------------------------------------------
export interface BackendProject {
  id: number;
  title: string;
  description: string | null;
  jobCostNo: string | null;
  manager: string | null;
  departmentHead: string | null;
  budget: number | null;
  stage: string;
  status: string;
  approvalStatus: string;
  priority: string;
  department: string | null;
  program: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  risks?: BackendRisk[];
  issues?: BackendIssue[];
  scopeChanges?: BackendScopeChange[];
  benefits?: BackendBenefit[];
  grantMilestones?: BackendGrantMilestone[];
}

export interface BackendRisk {
  id: number;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  createdAt: string;
  projectId: number;
}

export interface BackendIssue {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  createdAt: string;
  projectId: number;
}

export interface BackendScopeChange {
  id: number;
  title: string;
  description: string | null;
  reason: string | null;
  status: string;
  createdAt: string;
  projectId: number;
}

export interface BackendBenefit {
  id: number;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  projectId: number;
}

export interface BackendGrantMilestone {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: string;
  complianceStatus: string;
  createdAt: string;
  projectId: number;
}

export interface DashboardSummary {
  totalProjects: number;
  totalRisks: number;
  totalIssues: number;
  totalScopeChanges: number;
  totalBenefits: number;
  totalGrantMilestones: number;
  projectsByStage: Record<string, number>;
  projectsByStatus: Record<string, number>;
}

// ------------------------------------------------------------
// Projects
// ------------------------------------------------------------
export const projectsApi = {
  getAll: () =>
    request<BackendProject[]>("/projects"),

  getById: (id: number) =>
    request<BackendProject>(`/projects/${id}`),

  create: (data: {
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
  }) =>
    request<BackendProject>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<{
    title: string;
    description: string;
    jobCostNo: string | null;
    manager: string;
    departmentHead: string | null;
    budget: number | null;
    stage: string;
    status: string;
    approvalStatus: string;
    priority: string;
    department: string;
    program: string;
    startDate: string;
    endDate: string;
  }>) =>
    request<BackendProject>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<void>(`/projects/${id}`, {
      method: "DELETE",
    }),
};

// ------------------------------------------------------------
// Risks
// ------------------------------------------------------------
export const risksApi = {
  getByProject: (projectId: number) =>
    request<BackendRisk[]>(`/risks?projectId=${projectId}`),

  create: (data: {
    title: string;
    description?: string;
    severity?: string;
    status?: string;
    projectId: number;
  }) =>
    request<BackendRisk>("/risks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ------------------------------------------------------------
// Issues
// ------------------------------------------------------------
export const issuesApi = {
  getByProject: (projectId: number) =>
    request<BackendIssue[]>(`/issues?projectId=${projectId}`),

  create: (data: {
    title: string;
    description?: string;
    priority?: string;
    status?: string;
    projectId: number;
  }) =>
    request<BackendIssue>("/issues", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ------------------------------------------------------------
// Scope Changes
// ------------------------------------------------------------
export const scopeChangesApi = {
  getByProject: (projectId: number) =>
    request<BackendScopeChange[]>(`/scope-changes?projectId=${projectId}`),

  create: (data: {
    title: string;
    description?: string;
    reason?: string;
    status?: string;
    projectId: number;
  }) =>
    request<BackendScopeChange>("/scope-changes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ------------------------------------------------------------
// Benefits
// ------------------------------------------------------------
export const benefitsApi = {
  getByProject: (projectId: number) =>
    request<BackendBenefit[]>(`/benefits?projectId=${projectId}`),

  create: (data: {
    title: string;
    description?: string;
    status?: string;
    projectId: number;
  }) =>
    request<BackendBenefit>("/benefits", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ------------------------------------------------------------
// Grant Milestones
// ------------------------------------------------------------
export const grantMilestonesApi = {
  getByProject: (projectId: number) =>
    request<BackendGrantMilestone[]>(`/grant-milestones?projectId=${projectId}`),

  create: (data: {
    title: string;
    description?: string;
    dueDate?: string;
    status?: string;
    complianceStatus?: string;
    projectId: number;
  }) =>
    request<BackendGrantMilestone>("/grant-milestones", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<{
    title: string;
    description: string | null;
    dueDate: string | null;
    status: string;
    complianceStatus: string;
  }>) =>
    request<BackendGrantMilestone>(`/grant-milestones/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// ------------------------------------------------------------
// Dashboard
// ------------------------------------------------------------
export const dashboardApi = {
  getSummary: () =>
    request<DashboardSummary>("/dashboard/summary"),
};
