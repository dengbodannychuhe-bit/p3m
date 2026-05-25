import { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, User, Plus, Layers, Calendar, Building2, FolderOpen } from 'lucide-react';
import type { BackendProject } from '../services/api';

export function ProjectList() {
  const { projects } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [groupByProgram, setGroupByProgram] = useState(false);
  const navigate = useNavigate();

  const filteredProjects = (projects as BackendProject[]).filter(project => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.manager ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.program ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesStage = stageFilter === 'all' || project.stage === stageFilter;
    return matchesSearch && matchesStatus && matchesStage;
  });

  const groupedProjects: [string, BackendProject[]][] = groupByProgram
    ? Object.entries(filteredProjects.reduce<Record<string, BackendProject[]>>((groups, project) => {
      const program = project.program?.trim() || 'No Program';
      groups[program] = [...(groups[program] ?? []), project];
      return groups;
    }, {})).sort(([left], [right]) => left.localeCompare(right))
    : [['All Projects', filteredProjects]];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':           return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending Approval': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'On Hold':          return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Completed':        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'Cancelled':        return 'bg-red-100 text-red-700 border-red-200';
      default:                 return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Proposal':   return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Initiation': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Planning':   return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Delivery':   return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Close-out':  return 'bg-gray-100 text-gray-600 border-gray-200';
      default:           return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High':     return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium':   return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low':      return 'bg-green-100 text-green-700 border-green-200';
      default:         return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track all council projects</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setGroupByProgram(value => !value)}
            className="gap-2"
          >
            <Building2 className="w-4 h-4" />
            {groupByProgram ? 'Show All Projects' : 'Group by Program'}
          </Button>
          <Button
            onClick={() => navigate('/projects/new')}
            className="gap-2 text-white font-semibold shadow-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--council-blue)' }}
          >
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="Proposal">Proposal</SelectItem>
                <SelectItem value="Initiation">Initiation</SelectItem>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="Delivery">Delivery</SelectItem>
                <SelectItem value="Close-out">Close-out</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Count */}
      <p className="text-sm text-gray-500">
        Showing <span className="font-semibold text-gray-700">{filteredProjects.length}</span> of{' '}
        <span className="font-semibold text-gray-700">{projects.length}</span> projects
      </p>

      {/* Project cards */}
      <div className="space-y-5">
        {groupedProjects.map(([program, programProjects]) => (
          <section key={program} className="space-y-3">
            {groupByProgram && (
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span>{program}</span>
                <Badge variant="outline">{programProjects.length}</Badge>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3">
              {programProjects.map(project => (
          <Link key={project.id} to={`/projects/${project.id}`} className="block group">
            <Card className="hover:shadow-md transition-all duration-150 border-gray-200 group-hover:border-gray-300">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Icon */}
                  <div
                    className="hidden md:flex w-10 h-10 rounded-lg items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: 'var(--council-blue-light)' }}
                  >
                    <FolderOpen className="w-5 h-5" style={{ color: 'var(--council-blue)' }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title + badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-[var(--council-blue)] transition-colors">
                        {project.title}
                      </h3>
                      <Badge className={`text-xs border ${getStatusColor(project.status)}`}>{project.status}</Badge>
                      <Badge className={`text-xs border ${getStageColor(project.stage)}`}>
                        <Layers className="w-3 h-3 mr-1 inline" />
                        {project.stage}
                      </Badge>
                      <Badge className={`text-xs border ${getPriorityColor(project.priority ?? 'Medium')}`}>
                        {project.priority ?? 'Medium'}
                      </Badge>
                    </div>

                    {/* Description */}
                    {project.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{project.description}</p>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
                      {project.manager && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span>{project.manager}</span>
                        </div>
                      )}
                      {project.department && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <span>{project.department}</span>
                        </div>
                      )}
                      {project.program && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Layers className="w-3.5 h-3.5 text-gray-400" />
                          <span>{project.program}</span>
                        </div>
                      )}
                      {project.budget != null && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                          <span>${project.budget.toLocaleString()}</span>
                        </div>
                      )}
                      {(project.startDate || project.endDate) && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            {formatDate(project.startDate ?? null)}
                            {project.startDate && project.endDate ? ' – ' : ''}
                            {formatDate(project.endDate ?? null)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats strip */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                      <Stat label="Risks"      value={(project.risks ?? []).length}          color="var(--council-orange)" />
                      <Stat label="Issues"     value={(project.issues ?? []).length}         color="#DC2626" />
                      <Stat label="Benefits"   value={(project.benefits ?? []).length}       color="var(--council-green)" />
                      <Stat label="Milestones" value={(project.grantMilestones ?? []).length} color="var(--council-blue)" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
              ))}
            </div>
          </section>
        ))}

        {filteredProjects.length === 0 && (
          <Card className="border-dashed border-gray-300">
            <CardContent className="py-16 text-center">
              <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No projects found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
              <Button
                onClick={() => navigate('/projects/new')}
                className="mt-4 gap-2 text-white"
                style={{ backgroundColor: 'var(--council-blue)' }}
              >
                <Plus className="w-4 h-4" />
                Create your first project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-xs">
      <span className="text-gray-400">{label}: </span>
      <span className="font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}
