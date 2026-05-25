import { useProjects } from '../context/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Target,
  PieChart,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router';
import type { BackendProject } from '../services/api';

export function PortfolioDashboard() {
  const { projects: rawProjects } = useProjects();
  const projects = rawProjects as BackendProject[];

  const totalProjects = projects.length;
  const activeProjects    = projects.filter(p => p.status === 'Active').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const onHoldProjects    = projects.filter(p => p.status === 'On Hold').length;
  const pendingProjects   = projects.filter(p => p.status === 'Pending Approval').length;
  const cancelledProjects = projects.filter(p => p.status === 'Cancelled').length;

  // Portfolio value = only projects still running (not cancelled, not completed)
  const runningProjects = projects.filter(p => p.status !== 'Cancelled' && p.status !== 'Completed');
  const runningBudget   = runningProjects.reduce((acc, p) => acc + (p.budget ?? 0), 0);
  const cancelledBudget = projects.filter(p => p.status === 'Cancelled').reduce((acc, p) => acc + (p.budget ?? 0), 0);
  const totalBudget     = projects.reduce((acc, p) => acc + (p.budget ?? 0), 0);

  const allRisks = projects.flatMap(p => p.risks ?? []);
  const totalRisks = allRisks.length;
  const criticalRisks = allRisks.filter(r => r.severity === 'Critical' && r.status === 'Open').length;
  const openRisks = allRisks.filter(r => r.status === 'Open').length;

  const allIssues = projects.flatMap(p => p.issues ?? []);
  const criticalIssues = allIssues.filter(i => i.priority === 'Critical' && i.status === 'Open').length;

  const allBenefits = projects.flatMap(p => p.benefits ?? []);
  const totalBenefits = allBenefits.length;
  const achievedBenefits = allBenefits.filter(b => b.status === 'Achieved').length;

  const allMilestones = projects.flatMap(p => p.grantMilestones ?? []);
  const totalMilestones = allMilestones.length;
  const completedMilestones = allMilestones.filter(m => m.status === 'Completed').length;
  const overdueMilestones = allMilestones.filter(m => m.status === 'Overdue').length;

  const stageCounts = projects.reduce((acc, p) => {
    acc[p.stage] = (acc[p.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const departmentCounts = projects.reduce((acc, p) => {
    const dept = p.department ?? 'Unassigned';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityCounts = projects.reduce((acc, p) => {
    const pri = p.priority ?? 'Medium';
    acc[pri] = (acc[pri] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const portfolioStats = [
    {
      title: 'Active Portfolio Value',
      value: runningBudget > 0 ? `$${(runningBudget / 1_000_000).toFixed(2)}M` : 'N/A',
      subtitle: cancelledBudget > 0
        ? `–$${(cancelledBudget / 1_000_000).toFixed(2)}M cancelled`
        : `Across ${runningProjects.length} running projects`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Projects',
      value: activeProjects,
      subtitle: `${completedProjects} completed · ${cancelledProjects} cancelled`,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Critical Risks',
      value: criticalRisks,
      subtitle: `${totalRisks} total risks`,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Benefits Achieved',
      value: `${achievedBenefits}/${totalBenefits}`,
      subtitle: `${totalBenefits > 0 ? Math.round((achievedBenefits / totalBenefits) * 100) : 0}% complete`,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':           return 'bg-green-100 text-green-800';
      case 'Pending Approval': return 'bg-blue-100 text-blue-800';
      case 'On Hold':          return 'bg-yellow-100 text-yellow-800';
      case 'Completed':        return 'bg-gray-100 text-gray-800';
      case 'Cancelled':        return 'bg-red-100 text-red-700';
      default:                 return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Portfolio Dashboard</h2>
        <p className="text-gray-600 mt-2">Executive overview of all council projects and initiatives</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {portfolioStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Portfolio Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Project Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalProjects > 0 ? (
              <div className="space-y-3">
                {[
                  { label: 'Active',           count: activeProjects },
                  { label: 'Pending Approval', count: pendingProjects },
                  { label: 'Completed',        count: completedProjects },
                  { label: 'On Hold',          count: onHoldProjects },
                  { label: 'Cancelled',        count: cancelledProjects },
                ].map(({ label, count }) => count > 0 ? (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-sm text-gray-600">{count} projects</span>
                    </div>
                    <Progress value={(count / totalProjects) * 100} className="h-2" />
                  </div>
                ) : null)}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No projects yet</p>
            )}
          </CardContent>
        </Card>

        {/* Milestone Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Grant Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{completedMilestones}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">In Progress</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {totalMilestones - completedMilestones - overdueMilestones}
                </span>
              </div>
              {overdueMilestones > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium">Overdue</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{overdueMilestones}</span>
                </div>
              )}
              <div className="pt-4 border-t">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0}% complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Budget Breakdown */}
      {totalBudget > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" style={{ color: 'var(--council-green)' }} />
              Portfolio Budget Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--council-green-light)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Active Portfolio</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--council-green)' }}>
                  {runningBudget > 0 ? `$${(runningBudget / 1_000_000).toFixed(2)}M` : '$0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">{runningProjects.length} running projects</p>
              </div>
              {cancelledBudget > 0 && (
                <div className="p-4 rounded-lg bg-red-50">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Cancelled Budget</p>
                  <p className="text-2xl font-bold text-red-600">
                    –${(cancelledBudget / 1_000_000).toFixed(2)}M
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{cancelledProjects} cancelled project{cancelledProjects !== 1 ? 's' : ''}</p>
                </div>
              )}
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Total (All Projects)</p>
                <p className="text-2xl font-bold text-gray-700">
                  ${(totalBudget / 1_000_000).toFixed(2)}M
                </p>
                <p className="text-xs text-gray-500 mt-1">{totalProjects} projects total</p>
              </div>
            </div>
            {/* Running budget bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Running vs Total</span>
                <span>{totalBudget > 0 ? Math.round((runningBudget / totalBudget) * 100) : 0}% active</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden flex">
                <div
                  className="h-2.5 transition-all duration-500"
                  style={{
                    width: `${totalBudget > 0 ? (runningBudget / totalBudget) * 100 : 0}%`,
                    backgroundColor: 'var(--council-green)',
                  }}
                />
                {cancelledBudget > 0 && (
                  <div
                    className="h-2.5 bg-red-400 transition-all duration-500"
                    style={{ width: `${(cancelledBudget / totalBudget) * 100}%` }}
                  />
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: 'var(--council-green)' }} />
                  Active
                </span>
                {cancelledBudget > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full inline-block bg-red-400" />
                    Cancelled
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block bg-gray-200" />
                  Remaining
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stage & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projects by Lifecycle Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.keys(stageCounts).length > 0 ? (
                Object.entries(stageCounts).map(([stage, count]) => (
                  <div key={stage} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{stage}</span>
                    <Badge variant="outline">{count} {count === 1 ? 'project' : 'projects'}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No projects yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.keys(departmentCounts).length > 0 ? (
                Object.entries(departmentCounts).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{dept}</span>
                    <Badge variant="outline">{count} {count === 1 ? 'project' : 'projects'}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No projects yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority & Risk Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projects by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(['Critical', 'High', 'Medium', 'Low'] as const).map(priority => {
                const count = priorityCounts[priority] || 0;
                if (count === 0) return null;
                const colorMap = { Critical: 'bg-red-500', High: 'bg-orange-500', Medium: 'bg-yellow-500', Low: 'bg-blue-500' };
                return (
                  <div key={priority} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${colorMap[priority]}`} />
                      <span className="font-medium text-gray-900">{priority}</span>
                    </div>
                    <Badge variant="outline">{count} {count === 1 ? 'project' : 'projects'}</Badge>
                  </div>
                );
              })}
              {Object.keys(priorityCounts).length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No projects yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Risk Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(['Critical', 'High', 'Medium', 'Low'] as const).map(severity => {
                const count = allRisks.filter(r => r.severity === severity && r.status === 'Open').length;
                if (count === 0) return null;
                const colorMap = { Critical: 'bg-red-500', High: 'bg-orange-500', Medium: 'bg-yellow-500', Low: 'bg-blue-500' };
                return (
                  <div key={severity} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${colorMap[severity]}`} />
                      <span className="font-medium text-gray-900">{severity} Open Risks</span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                );
              })}
              {openRisks === 0 && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">No open risks</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attention Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Items Requiring Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criticalRisks > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-red-900">Critical Risks Open</p>
                    <p className="text-sm text-red-700 mt-1">
                      {criticalRisks} critical {criticalRisks === 1 ? 'risk requires' : 'risks require'} immediate attention
                    </p>
                  </div>
                  <Badge className="bg-red-600 text-white">{criticalRisks}</Badge>
                </div>
              </div>
            )}
            {criticalIssues > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-orange-900">Critical Issues Open</p>
                    <p className="text-sm text-orange-700 mt-1">
                      {criticalIssues} critical {criticalIssues === 1 ? 'issue needs' : 'issues need'} resolution
                    </p>
                  </div>
                  <Badge className="bg-orange-600 text-white">{criticalIssues}</Badge>
                </div>
              </div>
            )}
            {onHoldProjects > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-yellow-900">Projects On Hold</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      {onHoldProjects} {onHoldProjects === 1 ? 'project is' : 'projects are'} currently on hold
                    </p>
                  </div>
                  <Badge className="bg-yellow-600 text-white">{onHoldProjects}</Badge>
                </div>
              </div>
            )}
            {criticalRisks === 0 && criticalIssues === 0 && onHoldProjects === 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-green-900 font-medium">No critical items requiring immediate attention</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              All Projects
            </span>
            <Link to="/projects">
              <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">View All</Badge>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {projects.slice(0, 8).map(project => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{project.title}</h4>
                      <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{project.stage}</p>
                  </div>
                  {project.manager && (
                    <span className="text-sm text-gray-500">{project.manager}</span>
                  )}
                </div>
              </Link>
            ))}
            {projects.length === 0 && (
              <p className="text-gray-500 text-center py-4">No projects yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
