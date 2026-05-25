import { useParams, Link } from 'react-router';
import { useEffect, useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  ArrowLeft, Calendar, User, Building2, DollarSign,
  Layers, AlertTriangle, AlertCircle,
  Target, Clock, GitBranch, Loader2, ChevronRight, Settings,
} from 'lucide-react';
import type { BackendProject } from '../services/api';

export function ProjectDetailsFolders() {
  const { id } = useParams();
  const { getProject } = useProjects();
  const [project, setProject] = useState<BackendProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getProject(Number(id))
      .then(setProject)
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Loading project…</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 font-medium">Project not found</p>
        <Link to="/projects" className="mt-4 inline-block">
          <Button variant="outline" size="sm">← Back to Projects</Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':           return 'bg-green-100 text-green-700 border-green-200';
      case 'Completed':        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'On Hold':          return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Cancelled':        return 'bg-red-100 text-red-700 border-red-200';
      case 'Pending Approval': return 'bg-purple-100 text-purple-700 border-purple-200';
      default:                 return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High':     return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium':   return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low':      return 'bg-blue-100 text-blue-700 border-blue-200';
      default:         return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  const folders = [
    {
      id: 'risks',
      name: 'Risks',
      count: (project.risks ?? []).length,
      icon: AlertTriangle,
      color: 'var(--council-orange)',
      bgColor: 'var(--council-orange-light)',
      borderColor: 'rgba(244,114,30,0.3)',
      tab: 'risks',
    },
    {
      id: 'issues',
      name: 'Issues',
      count: (project.issues ?? []).length,
      icon: AlertCircle,
      color: '#DC2626',
      bgColor: '#FEF2F2',
      borderColor: 'rgba(220,38,38,0.25)',
      tab: 'issues',
    },
    {
      id: 'scope',
      name: 'Scope Changes',
      count: (project.scopeChanges ?? []).length,
      icon: GitBranch,
      color: 'var(--council-purple)',
      bgColor: 'var(--council-purple-light)',
      borderColor: 'rgba(122,41,143,0.25)',
      tab: 'scope',
    },
    {
      id: 'benefits',
      name: 'Benefits',
      count: (project.benefits ?? []).length,
      icon: Target,
      color: 'var(--council-green)',
      bgColor: 'var(--council-green-light)',
      borderColor: 'rgba(80,182,109,0.3)',
      tab: 'benefits',
    },
    {
      id: 'milestones',
      name: 'Grant Milestones',
      count: (project.grantMilestones ?? []).length,
      icon: Clock,
      color: 'var(--council-blue)',
      bgColor: 'var(--council-blue-light)',
      borderColor: 'rgba(0,111,185,0.25)',
      tab: 'milestones',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link to="/projects">
          <Button variant="ghost" size="icon" className="mt-0.5 text-gray-400 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-900 truncate">{project.title}</h2>
            <Badge className={`text-xs border ${getStatusColor(project.status)}`}>{project.status}</Badge>
            {project.priority && (
              <Badge className={`text-xs border ${getPriorityColor(project.priority)}`}>{project.priority}</Badge>
            )}
          </div>
          {project.description && (
            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
          )}
        </div>
      </div>

      {/* Stage + meta */}
      <Card className="border-gray-200 shadow-sm" style={{ borderLeftWidth: 4, borderLeftColor: 'var(--council-blue)' }}>
        <CardContent className="py-4 px-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" style={{ color: 'var(--council-blue)' }} />
              <span className="text-sm font-semibold text-gray-700">{project.stage}</span>
              <Badge variant="outline" className="text-xs">{project.approvalStatus}</Badge>
            </div>
            {(project.startDate || project.endDate) && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {formatDate(project.startDate ?? null)}
                  {project.startDate && project.endDate ? ' → ' : ''}
                  {formatDate(project.endDate ?? null)}
                </span>
              </div>
            )}
            {project.budget != null && (
              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                ${project.budget.toLocaleString()}
              </div>
            )}
            {project.manager && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <User className="w-3.5 h-3.5 text-gray-400" />
                {project.manager}
              </div>
            )}
            {project.department && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                {project.department}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Folder grid */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Project Folders</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {folders.map(folder => {
            const Icon = folder.icon;
            return (
              <Link key={folder.id} to={`/projects/${id}/details`} state={{ tab: folder.tab }}>
                <Card
                  className="hover:shadow-md transition-all duration-150 cursor-pointer h-full group"
                  style={{
                    backgroundColor: folder.bgColor,
                    border: `1px solid ${folder.borderColor}`,
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: folder.color }}
                        >
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{folder.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            <span className="font-bold" style={{ color: folder.color }}>{folder.count}</span>
                            {' '}{folder.count === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {/* Full details */}
          <Link to={`/projects/${id}/details`}>
            <Card
              className="hover:shadow-md transition-all duration-150 cursor-pointer h-full group border-gray-200 bg-white"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-700">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Full Details</p>
                      <p className="text-xs text-gray-500 mt-0.5">All tabs & management</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
