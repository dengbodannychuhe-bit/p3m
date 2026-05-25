export interface Risk {
  id: string;
  title: string;
  description: string;
  likelihood: 'Low' | 'Medium' | 'High' | 'Critical';
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  mitigation: string;
  status: 'Open' | 'Mitigated' | 'Closed';
  owner: string;
  dateIdentified: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo: string;
  dateRaised: string;
  dateResolved?: string;
}

export interface ScopeChange {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  dateRequested: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Implemented';
  impact: string;
  costImpact?: string;
  timelineImpact?: string;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  category: 'Financial' | 'Social' | 'Environmental' | 'Operational';
  targetValue: string;
  currentValue: string;
  status: 'Not Started' | 'In Progress' | 'Achieved';
  measurementDate?: string;
}

export interface GrantMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
  deliverables: string[];
  grantAmount: string;
  completionDate?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  phase: 'Initiation' | 'Planning' | 'Execution' | 'Monitoring' | 'Closure';
  startDate: string;
  endDate: string;
  budget: string;
  projectManager: string;
  department: string;
  risks: Risk[];
  issues: Issue[];
  scopeChanges: ScopeChange[];
  benefits: Benefit[];
  grantMilestones: GrantMilestone[];
}
