import { useParams, Link, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useAudit } from '../context/AuditContext';
import { grantMilestonesApi } from '../services/api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import {
  ArrowLeft, DollarSign, User, AlertTriangle, AlertCircle,
  FileText, Target, Milestone, Plus, X, Loader2, XCircle, CheckCircle,
} from 'lucide-react';
import type { BackendGrantMilestone, BackendProject } from '../services/api';

export function ProjectDetails() {
  const { id } = useParams();
  const location = useLocation();
  const initialTab = (location.state as any)?.tab ?? 'overview';
  const { getProject, updateProject, addRisk, addIssue, addScopeChange } = useProjects();
  const { user } = useAuth();
  const { addAuditLog, getProjectAuditLogs } = useAudit();
  const [project, setProject] = useState<BackendProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [entryDialog, setEntryDialog] = useState<'risk' | 'issue' | 'scope' | null>(null);
  const [isSavingEntry, setIsSavingEntry] = useState(false);
  const [entryForm, setEntryForm] = useState({
    title: '',
    description: '',
    severity: 'Medium',
    priority: 'Medium',
    status: 'Open',
    reason: '',
  });

  const canManageStatus = user?.role === 'Administrator' || user?.role === 'Manager';
  const [reviewingMilestoneId, setReviewingMilestoneId] = useState<number | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'Pending',
    complianceStatus: 'Pending',
    deliverable: '',
  });
  const [deliverables, setDeliverables] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProject(Number(id))
      .then(setProject)
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  const reloadProject = () => {
    if (!id) return;
    getProject(Number(id)).then(setProject).catch(() => {});
  };

  const handleCancelProject = async () => {
    if (!id || !project) return;
    setIsCancelling(true);
    try {
      const updated = await updateProject(Number(id), { status: 'Cancelled' });
      setProject(prev => prev ? { ...prev, status: updated.status } : prev);
      toast.success('Project has been cancelled');
      setCancelDialogOpen(false);
    } catch {
      toast.error('Failed to cancel project');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEntryChange = (field: string, value: string) => {
    setEntryForm(prev => ({ ...prev, [field]: value }));
  };

  const resetEntryForm = () => {
    setEntryForm({
      title: '',
      description: '',
      severity: 'Medium',
      priority: 'Medium',
      status: 'Open',
      reason: '',
    });
  };

  const openEntryDialog = (type: 'risk' | 'issue' | 'scope') => {
    resetEntryForm();
    setEntryForm(prev => ({ ...prev, status: type === 'scope' ? 'Pending' : 'Open' }));
    setEntryDialog(type);
  };

  const addDeliverable = () => {
    if (formData.deliverable.trim()) {
      setDeliverables(prev => [...prev, formData.deliverable.trim()]);
      setFormData(prev => ({ ...prev, deliverable: '' }));
    }
  };

  const removeDeliverable = (index: number) => {
    setDeliverables(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !id) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const milestone = await grantMilestonesApi.create({
        title: formData.title,
        description: formData.description || undefined,
        dueDate: formData.dueDate || undefined,
        status: formData.status,
        complianceStatus: formData.complianceStatus,
        projectId: Number(id),
      });
      addAuditLog({
        action: 'Created',
        entityType: 'Milestone',
        entityId: String(milestone.id),
        entityName: milestone.title,
        projectId: String(id),
        description: `Added grant milestone to ${project?.title ?? 'project'}`,
      });
      toast.success('Milestone added successfully!');
      reloadProject();
      setFormData({ title: '', description: '', dueDate: '', status: 'Pending', complianceStatus: 'Pending', deliverable: '' });
      setDeliverables([]);
      setIsDialogOpen(false);
    } catch {
      toast.error('Failed to add milestone');
    }
  };

  const handleMilestoneDecision = async (
    milestone: BackendGrantMilestone,
    decision: 'Approved' | 'Rejected'
  ) => {
    if (!id || !project) return;

    setReviewingMilestoneId(milestone.id);
    try {
      const updated = await grantMilestonesApi.update(milestone.id, {
        status: decision,
        complianceStatus: decision === 'Approved' ? 'Compliant' : 'Non-Compliant',
      });

      addAuditLog({
        action: decision,
        entityType: 'Milestone',
        entityId: String(updated.id),
        entityName: updated.title,
        projectId: String(id),
        description: `${user?.name ?? 'Manager'} ${decision.toLowerCase()} milestone for ${project.title}`,
      });

      toast.success(`Milestone ${decision.toLowerCase()} successfully`);
      reloadProject();
    } catch {
      toast.error(`Failed to ${decision.toLowerCase()} milestone`);
    } finally {
      setReviewingMilestoneId(null);
    }
  };

  const handleEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryDialog || !id || !project || !entryForm.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsSavingEntry(true);
    try {
      if (entryDialog === 'risk') {
        const risk = await addRisk({
          projectId: Number(id),
          title: entryForm.title,
          description: entryForm.description || undefined,
          severity: entryForm.severity,
          status: entryForm.status,
        });
        addAuditLog({
          action: 'Created',
          entityType: 'Risk',
          entityId: String(risk.id),
          entityName: risk.title,
          projectId: String(id),
          description: `Added risk to ${project.title}`,
        });
        toast.success('Risk added successfully');
      }

      if (entryDialog === 'issue') {
        const issue = await addIssue({
          projectId: Number(id),
          title: entryForm.title,
          description: entryForm.description || undefined,
          priority: entryForm.priority,
          status: entryForm.status,
        });
        addAuditLog({
          action: 'Created',
          entityType: 'Issue',
          entityId: String(issue.id),
          entityName: issue.title,
          projectId: String(id),
          description: `Added issue to ${project.title}`,
        });
        toast.success('Issue added successfully');
      }

      if (entryDialog === 'scope') {
        const scopeChange = await addScopeChange({
          projectId: Number(id),
          title: entryForm.title,
          description: entryForm.description || undefined,
          reason: entryForm.reason || undefined,
          status: entryForm.status,
        });
        addAuditLog({
          action: 'Created',
          entityType: 'Scope Change',
          entityId: String(scopeChange.id),
          entityName: scopeChange.title,
          projectId: String(id),
          description: `Added scope change to ${project.title}`,
        });
        toast.success('Scope change added successfully');
      }

      reloadProject();
      setEntryDialog(null);
      resetEntryForm();
    } catch {
      toast.error(`Failed to add ${entryDialog === 'scope' ? 'scope change' : entryDialog}`);
    } finally {
      setIsSavingEntry(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading project...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500 py-12">Project not found</p>
            <div className="flex justify-center">
              <Link to="/projects"><Button>Back to Projects</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const risks = project.risks ?? [];
  const issues = project.issues ?? [];
  const scopeChanges = project.scopeChanges ?? [];
  const benefits = project.benefits ?? [];
  const grantMilestones = project.grantMilestones ?? [];
  const projectAuditLogs = getProjectAuditLogs(String(project.id));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': case 'Completed': case 'Achieved': case 'Resolved': case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Planning': case 'In Progress': case 'Not Started': case 'Pending':
        return 'bg-blue-100 text-blue-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      case 'Open': return 'bg-orange-100 text-orange-800';
      case 'Cancelled': case 'Rejected': case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'Closed': case 'Mitigated': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to={`/projects/${id}`}>
          <Button variant="ghost" size="icon" className="mt-1 text-gray-400 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
            <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
            <Badge variant="outline">{project.stage}</Badge>
          </div>
          {project.description && (
            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
          )}
        </div>
        {/* Manager / Admin actions */}
        {canManageStatus && project.status !== 'Cancelled' && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 flex-shrink-0"
            onClick={() => setCancelDialogOpen(true)}
          >
            <XCircle className="w-4 h-4" />
            Cancel Project
          </Button>
        )}
        {project.status === 'Cancelled' && (
          <Badge className="bg-red-100 text-red-700 border border-red-200 flex-shrink-0">
            Project Cancelled
          </Badge>
        )}
      </div>

      {/* Overview */}
      <Card>
        <CardHeader><CardTitle>Project Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.budget != null && (
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-semibold text-gray-900">${project.budget.toLocaleString()}</p>
                </div>
              </div>
            )}
            {project.manager && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Project Manager</p>
                  <p className="font-semibold text-gray-900">{project.manager}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Active Risks</p>
                <p className="font-semibold text-orange-600">
                  {risks.filter(r => r.status === 'Open').length} / {risks.length}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Open Issues</p>
                <p className="font-semibold text-red-600">
                  {issues.filter(i => i.status === 'Open').length} / {issues.length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue={initialTab === 'overview' ? 'risks' : initialTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="risks">Risks ({risks.length})</TabsTrigger>
          <TabsTrigger value="issues">Issues ({issues.length})</TabsTrigger>
          <TabsTrigger value="scope">Scope Changes ({scopeChanges.length})</TabsTrigger>
          <TabsTrigger value="benefits">Benefits ({benefits.length})</TabsTrigger>
          <TabsTrigger value="milestones">Milestones ({grantMilestones.length})</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        {/* Risks */}
        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Project Risks
              </CardTitle>
              <Button size="sm" onClick={() => openEntryDialog('risk')} className="gap-1.5">
                <Plus className="w-4 h-4" />
                Add Risk
              </Button>
            </CardHeader>
            <CardContent>
              {risks.length > 0 ? (
                <div className="space-y-4">
                  {risks.map(risk => (
                    <div key={risk.id} className={`p-4 border rounded-lg ${getSeverityColor(risk.severity)}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">{risk.title}</h4>
                        <Badge className={getStatusColor(risk.status)}>{risk.status}</Badge>
                        <Badge variant="outline" className={getSeverityColor(risk.severity)}>
                          {risk.severity}
                        </Badge>
                      </div>
                      {risk.description && <p className="text-sm mt-2">{risk.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No risks identified for this project</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues */}
        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Project Issues
              </CardTitle>
              <Button size="sm" onClick={() => openEntryDialog('issue')} className="gap-1.5">
                <Plus className="w-4 h-4" />
                Add Issue
              </Button>
            </CardHeader>
            <CardContent>
              {issues.length > 0 ? (
                <div className="space-y-4">
                  {issues.map(issue => (
                    <div key={issue.id} className={`p-4 border rounded-lg ${getSeverityColor(issue.priority)}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">{issue.title}</h4>
                        <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                        <Badge variant="outline" className={getSeverityColor(issue.priority)}>
                          {issue.priority}
                        </Badge>
                      </div>
                      {issue.description && <p className="text-sm mt-2">{issue.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No issues logged for this project</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scope Changes */}
        <TabsContent value="scope" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Scope Changes
              </CardTitle>
              <Button size="sm" onClick={() => openEntryDialog('scope')} className="gap-1.5">
                <Plus className="w-4 h-4" />
                Add Scope Change
              </Button>
            </CardHeader>
            <CardContent>
              {scopeChanges.length > 0 ? (
                <div className="space-y-4">
                  {scopeChanges.map(change => (
                    <div key={change.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">{change.title}</h4>
                        <Badge className={getStatusColor(change.status)}>{change.status}</Badge>
                      </div>
                      {change.description && <p className="text-sm mt-2">{change.description}</p>}
                      {change.reason && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                          <span className="font-medium">Reason: </span>{change.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No scope changes requested for this project</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benefits */}
        <TabsContent value="benefits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Project Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              {benefits.length > 0 ? (
                <div className="space-y-4">
                  {benefits.map(benefit => (
                    <div key={benefit.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">{benefit.title}</h4>
                        <Badge className={getStatusColor(benefit.status)}>{benefit.status}</Badge>
                      </div>
                      {benefit.description && <p className="text-sm mt-2">{benefit.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No benefits defined for this project</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Milestones */}
        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Milestone className="w-5 h-5" />
                Grant Milestones
              </CardTitle>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-blue-500 text-white hover:bg-blue-600"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
            </CardHeader>
            <CardContent>
              {grantMilestones.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Milestone</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Compliance</TableHead>
                      {canManageStatus && <TableHead>Manager Approval</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grantMilestones.map(milestone => (
                      <TableRow key={milestone.id}>
                        <TableCell className="font-semibold">{milestone.title}</TableCell>
                        <TableCell>{milestone.description || '-'}</TableCell>
                        <TableCell>
                          {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell><Badge className={getStatusColor(milestone.status)}>{milestone.status}</Badge></TableCell>
                        <TableCell><Badge variant="outline">{milestone.complianceStatus}</Badge></TableCell>
                        {canManageStatus && (
                          <TableCell>
                            {milestone.status === 'Approved' || milestone.status === 'Rejected' ? (
                              <span className="text-sm text-gray-500">Reviewed</span>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  className="gap-1.5 bg-green-600 hover:bg-green-700"
                                  disabled={reviewingMilestoneId === milestone.id}
                                  onClick={() => handleMilestoneDecision(milestone, 'Approved')}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                                  disabled={reviewingMilestoneId === milestone.id}
                                  onClick={() => handleMilestoneDecision(milestone, 'Rejected')}
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 text-center py-8">No grant milestones defined for this project</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Audit Logs */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {projectAuditLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectAuditLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                        <TableCell>{log.entityType}: {log.entityName}</TableCell>
                        <TableCell>{log.description}</TableCell>
                        <TableCell>{log.userName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 text-center py-8">No audit logs recorded for this project yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Project Item Dialog */}
      <Dialog open={entryDialog !== null} onOpenChange={(open) => !open && setEntryDialog(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {entryDialog === 'risk' && 'Add Risk'}
              {entryDialog === 'issue' && 'Add Issue'}
              {entryDialog === 'scope' && 'Add Scope Change'}
            </DialogTitle>
            <DialogDescription>
              Add a title and description so the project record stays useful.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEntrySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="entry-title">Title *</Label>
              <Input
                id="entry-title"
                value={entryForm.title}
                onChange={(e) => handleEntryChange('title', e.target.value)}
                placeholder="Enter a short title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry-description">Description *</Label>
              <Textarea
                id="entry-description"
                value={entryForm.description}
                onChange={(e) => handleEntryChange('description', e.target.value)}
                placeholder="Describe the item"
                rows={3}
                required
              />
            </div>
            {entryDialog === 'scope' && (
              <div className="space-y-2">
                <Label htmlFor="entry-reason">Reason</Label>
                <Textarea
                  id="entry-reason"
                  value={entryForm.reason}
                  onChange={(e) => handleEntryChange('reason', e.target.value)}
                  placeholder="Why is this change needed?"
                  rows={2}
                />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {entryDialog === 'risk' && (
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={entryForm.severity} onValueChange={(value) => handleEntryChange('severity', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {entryDialog === 'issue' && (
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={entryForm.priority} onValueChange={(value) => handleEntryChange('priority', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={entryForm.status} onValueChange={(value) => handleEntryChange('status', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {entryDialog === 'scope' ? (
                      <>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEntryDialog(null)}>Cancel</Button>
              <Button type="submit" disabled={isSavingEntry}>
                {isSavingEntry ? 'Saving...' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel Project Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Cancel Project
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel <strong>{project.title}</strong>? This will set the project status to
              <strong> Cancelled</strong>. You can reactivate it later if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={isCancelling}>
              Keep Project
            </Button>
            <Button
              onClick={handleCancelProject}
              disabled={isCancelling}
              className="gap-2 text-white bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling…</> : 'Yes, Cancel Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Milestone Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[980px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Grant Milestone</DialogTitle>
            <DialogDescription>
              Add a new milestone to track project deliverables and grant funding.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="py-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title *</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Compliance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Input
                        placeholder="Phase 1 Completion"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        placeholder="Describe the milestone"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={2}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select value={formData.complianceStatus} onValueChange={(value) => handleInputChange('complianceStatus', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Compliant">Compliant</SelectItem>
                          <SelectItem value="At Risk">At Risk</SelectItem>
                          <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="hidden">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Phase 1 Completion"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the milestone objectives"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => handleInputChange('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Deliverables (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a deliverable"
                    value={formData.deliverable}
                    onChange={(e) => handleInputChange('deliverable', e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDeliverable(); } }}
                  />
                  <Button type="button" onClick={addDeliverable} variant="outline" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {deliverables.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <span>{d}</span>
                    <Button type="button" onClick={() => removeDeliverable(i)} variant="ghost" size="sm">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">Add Milestone</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
