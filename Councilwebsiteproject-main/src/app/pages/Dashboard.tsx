import { useEffect, useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { dashboardApi, DashboardSummary } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import {
  FolderOpen, AlertTriangle, AlertCircle, Target,
  TrendingUp, Clock, Loader2, ArrowRight, FileDown,
} from 'lucide-react';
import { Link } from 'react-router';

export function Dashboard() {
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi.getSummary()
      .then(setSummary)
      .catch(err => setSummaryError(err.message))
      .finally(() => setSummaryLoading(false));
  }, []);

  if (projectsLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm font-medium">Loading dashboard…</span>
      </div>
    );
  }

  if (projectsError || summaryError) {
    return (
      <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-red-800">
        <strong className="font-semibold">Could not connect to backend.</strong>
        <p className="mt-1 text-sm">Make sure the backend is running on <code className="font-mono bg-red-100 px-1 rounded">http://localhost:3000</code></p>
        <p className="text-sm text-red-600 mt-1">{projectsError || summaryError}</p>
      </div>
    );
  }

  const activeProjects    = projects.filter(p => p.status === 'Active');
  const completedProjects = projects.filter(p => p.status === 'Completed');
  const openRisks         = projects.reduce((a, p) => a + (p.risks ?? []).filter(r => r.status === 'Open').length, 0);
  const openIssues        = projects.reduce((a, p) => a + (p.issues ?? []).filter(i => i.status === 'Open').length, 0);
  const totalBenefits     = summary?.totalBenefits ?? 0;
  const achievedBenefits  = projects.reduce((a, p) => a + (p.benefits ?? []).filter(b => b.status === 'Achieved').length, 0);
  const totalMilestones   = summary?.totalGrantMilestones ?? 0;
  const completedMilestones = projects.reduce((a, p) => a + (p.grantMilestones ?? []).filter(m => m.status === 'Completed').length, 0);
  const projectsByStatus  = summary?.projectsByStatus ?? {};

  const stats = [
    {
      title: 'Total Projects',
      value: summary?.totalProjects ?? 0,
      subtitle: `${activeProjects.length} active · ${completedProjects.length} completed`,
      icon: FolderOpen,
      color: 'var(--council-blue)',
      bgColor: 'var(--council-blue-light)',
    },
    {
      title: 'Open Risks',
      value: openRisks,
      subtitle: `${summary?.totalRisks ?? 0} total tracked`,
      icon: AlertTriangle,
      color: 'var(--council-orange)',
      bgColor: 'var(--council-orange-light)',
    },
    {
      title: 'Open Issues',
      value: openIssues,
      subtitle: `${summary?.totalIssues ?? 0} total logged`,
      icon: AlertCircle,
      color: '#DC2626',
      bgColor: '#FEF2F2',
    },
    {
      title: 'Benefits',
      value: `${achievedBenefits}/${totalBenefits}`,
      subtitle: 'Achieved vs tracked',
      icon: Target,
      color: 'var(--council-green)',
      bgColor: 'var(--council-green-light)',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':           return 'bg-green-100 text-green-700 border-green-200';
      case 'Planning':
      case 'Proposal':         return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'On Hold':          return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Completed':        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'Cancelled':        return 'bg-red-100 text-red-700 border-red-200';
      case 'Pending Approval': return 'bg-purple-100 text-purple-700 border-purple-200';
      default:                 return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700';
      case 'High':     return 'bg-orange-100 text-orange-700';
      case 'Medium':   return 'bg-yellow-100 text-yellow-700';
      case 'Low':      return 'bg-green-100 text-green-700';
      default:         return 'bg-gray-100 text-gray-600';
    }
  };

  const milestonePct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const exportDashboardReport = () => {
    const headers = [
      'Project',
      'Job Cost No',
      'Program',
      'Stage',
      'Status',
      'Priority',
      'Project Manager',
      'Department Head',
      'Department',
      'Budget',
      'Risks',
      'Issues',
    ];
    const rows = projects.map(project => [
      project.title,
      project.jobCostNo || '',
      project.program || '',
      project.stage || '',
      project.status || '',
      project.priority || '',
      project.manager || '',
      project.departmentHead || '',
      project.department || '',
      project.budget ?? '',
      (project.risks ?? []).length,
      (project.issues ?? []).length,
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `p3m-dashboard-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">Overview of all council projects and activities</p>
        </div>
        <Button variant="outline" className="gap-2 w-fit" onClick={exportDashboardReport}>
          <FileDown className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2 leading-none">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-2">{stat.subtitle}</p>
                  </div>
                  <div className="p-2.5 rounded-lg" style={{ backgroundColor: stat.bgColor }}>
                    <Icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Milestones + Status breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Grant milestones progress */}
        <Card className="border-gray-200 shadow-sm" style={{ borderLeftWidth: 4, borderLeftColor: 'var(--council-blue)' }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4" style={{ color: 'var(--council-blue)' }} />
              Grant Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-3">
              <div>
                <span className="text-3xl font-bold text-gray-900">{completedMilestones}</span>
                <span className="text-gray-400 text-sm ml-1">/ {totalMilestones} completed</span>
              </div>
              <span className="text-2xl font-bold" style={{ color: 'var(--council-blue)' }}>{milestonePct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${milestonePct}%`, backgroundColor: 'var(--council-blue)' }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">{totalMilestones - completedMilestones} remaining</p>
          </CardContent>
        </Card>

        {/* Status breakdown */}
        <Card className="border-gray-200 shadow-sm" style={{ borderLeftWidth: 4, borderLeftColor: 'var(--council-green)' }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--council-green)' }} />
              Project Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(projectsByStatus).length > 0 ? (
                Object.entries(projectsByStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{status}</span>
                    <Badge className={`text-xs border ${getStatusColor(status)}`}>{count as number}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">No projects yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All projects */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              All Projects
              <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200 border">{projects.length}</Badge>
            </div>
            <Link to="/projects" className="flex items-center gap-1 text-xs font-medium hover:opacity-80 transition-opacity" style={{ color: 'var(--council-blue)' }}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {projects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Job Cost No</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Department Head</TableHead>
                  <TableHead className="text-right">Risks / Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map(project => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Link to={`/projects/${project.id}`} className="font-semibold text-gray-900 hover:text-[var(--council-blue)]">
                        {project.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        {project.priority && <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>{project.priority}</Badge>}
                        {project.description && <span className="text-xs text-gray-400 line-clamp-1">{project.description}</span>}
                      </div>
                    </TableCell>
                    <TableCell>{project.program || 'No Program'}</TableCell>
                    <TableCell>{project.jobCostNo || '-'}</TableCell>
                    <TableCell>{project.stage}</TableCell>
                    <TableCell><Badge className={`text-xs border ${getStatusColor(project.status)}`}>{project.status}</Badge></TableCell>
                    <TableCell>{project.priority ? <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>{project.priority}</Badge> : '-'}</TableCell>
                    <TableCell>{project.manager || '-'}</TableCell>
                    <TableCell>{project.departmentHead || '-'}</TableCell>
                    <TableCell className="text-right">
                      {(project.risks ?? []).length} / {(project.issues ?? []).length}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <FolderOpen className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No projects yet</p>
            </div>
          )}
          <div className="hidden">
            {activeProjects.map(project => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="flex items-start justify-between p-3.5 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-gray-50 hover:bg-white group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[var(--council-blue)] transition-colors">
                      {project.title}
                    </h3>
                    {project.priority && (
                      <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>{project.priority}</Badge>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{project.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    {project.manager && <span>PM: {project.manager}</span>}
                    {project.department && <><span>·</span><span>{project.department}</span></>}
                    {project.budget && <><span>·</span><span>${project.budget.toLocaleString()}</span></>}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 mt-0.5 flex-shrink-0 ml-3 transition-colors" />
              </Link>
            ))}
            {activeProjects.length === 0 && (
              <div className="text-center py-10">
                <FolderOpen className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No active projects</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
