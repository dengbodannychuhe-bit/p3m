import { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Search, FileText, Clock, User, Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { AuditLog } from '../types/audit';

type AuditEntityType = AuditLog['entityType'];

const emptyForm = {
  action: 'Created',
  entityType: 'Activity' as AuditEntityType,
  entityName: '',
  projectId: '',
  description: '',
  changeField: '',
  oldValue: '',
  newValue: '',
};

export function AuditLogs() {
  const { auditLogs, addAuditLog, updateAuditLog, deleteAuditLog } = useAudit();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const canManageLogs = user?.role === 'Administrator' || user?.role === 'Manager';

  const filteredLogs = auditLogs.filter(log => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      log.userName.toLowerCase().includes(query) ||
      log.entityName.toLowerCase().includes(query) ||
      log.description.toLowerCase().includes(query);
    const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesEntity && matchesAction;
  });

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingLogId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (log: AuditLog) => {
    const firstChange = log.changes?.[0];
    setEditingLogId(log.id);
    setFormData({
      action: log.action,
      entityType: log.entityType,
      entityName: log.entityName,
      projectId: log.projectId ?? '',
      description: log.description,
      changeField: firstChange?.field ?? '',
      oldValue: firstChange?.oldValue ?? '',
      newValue: firstChange?.newValue ?? '',
    });
    setDialogOpen(true);
  };

  const handleInputChange = (field: keyof typeof emptyForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.entityName.trim() || !formData.description.trim()) {
      toast.error('Please enter an item name and activity description');
      return;
    }

    if ((formData.oldValue || formData.newValue) && !formData.changeField.trim()) {
      toast.error('Please enter the changed field name');
      return;
    }

    const changes = formData.changeField.trim()
      ? [{
          field: formData.changeField.trim(),
          oldValue: formData.oldValue || '-',
          newValue: formData.newValue || '-',
        }]
      : undefined;

    const existingLog = auditLogs.find(log => log.id === editingLogId);
    const payload = {
      action: formData.action,
      entityType: formData.entityType,
      entityId: existingLog?.entityId ?? `manual-${Date.now()}`,
      entityName: formData.entityName.trim(),
      projectId: formData.projectId.trim() || undefined,
      description: formData.description.trim(),
      changes,
    };

    if (editingLogId) {
      updateAuditLog(editingLogId, payload);
      toast.success('Activity log updated');
    } else {
      addAuditLog(payload);
      toast.success('Activity log created');
    }

    resetForm();
    setDialogOpen(false);
  };

  const handleDelete = (log: AuditLog) => {
    const confirmed = window.confirm(`Delete this activity log?\n\n${log.description}`);
    if (!confirmed) return;

    deleteAuditLog(log.id);
    toast.success('Activity log deleted');
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Created':
        return 'bg-green-100 text-green-800';
      case 'Updated':
        return 'bg-blue-100 text-blue-800';
      case 'Deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
      case 'Administrator':
        return 'bg-purple-100 text-purple-800';
      case 'Project Manager':
      case 'Manager':
        return 'bg-blue-100 text-blue-800';
      case 'Staff Member':
      case 'Staff':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Audit & Activity Logs</h2>
          <p className="text-gray-600 mt-2">Track, create, update, and remove activity records across the system</p>
        </div>
        {canManageLogs && (
          <Button
            onClick={handleOpenCreate}
            className="gap-2 text-white hover:opacity-90"
            style={{ backgroundColor: 'var(--council-blue)' }}
          >
            <Plus className="w-4 h-4" />
            New Activity Log
          </Button>
        )}
      </div>

      <Card style={{ backgroundColor: 'var(--council-purple-light)' }} className="border-[var(--council-purple)]">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search activity logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entity Types</SelectItem>
                <SelectItem value="Activity">Activity</SelectItem>
                <SelectItem value="Project">Project</SelectItem>
                <SelectItem value="Program">Program</SelectItem>
                <SelectItem value="Risk">Risk</SelectItem>
                <SelectItem value="Issue">Issue</SelectItem>
                <SelectItem value="Benefit">Benefit</SelectItem>
                <SelectItem value="Milestone">Milestone</SelectItem>
                <SelectItem value="Scope Change">Scope Change</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="Created">Created</SelectItem>
                <SelectItem value="Updated">Updated</SelectItem>
                <SelectItem value="Deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-gray-600">
        Showing {filteredLogs.length} of {auditLogs.length} activity logs
      </p>

      <div className="space-y-3">
        {filteredLogs.map(log => (
          <Card key={log.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--council-blue-light)' }}>
                  <FileText className="w-5 h-5" style={{ color: 'var(--council-blue)' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                        <Badge variant="outline">{log.entityType}</Badge>
                        <Badge className={getRoleColor(log.userRole)}>{log.userRole}</Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900">{log.description}</h4>
                    </div>
                    {canManageLogs && (
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleOpenEdit(log)}>
                          <Pencil className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-red-700 border-red-200 hover:bg-red-50"
                          onClick={() => handleDelete(log)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{log.userName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{log.entityName}</span>
                    </div>
                  </div>

                  {log.changes && log.changes.length > 0 && (
                    <div className="mt-3 p-3 rounded" style={{ backgroundColor: 'var(--council-green-light)' }}>
                      <p className="text-sm font-medium mb-2">Changes:</p>
                      <div className="space-y-1">
                        {log.changes.map((change, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{change.field}:</span>{' '}
                            <span className="text-red-600">{change.oldValue}</span>
                            {' -> '}
                            <span className="text-green-600">{change.newValue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredLogs.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 py-12">
                No activity logs found matching your criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editingLogId ? 'Edit Activity Log' : 'New Activity Log'}</DialogTitle>
            <DialogDescription>
              Record manual audit or activity notes when a system action needs extra context.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="audit-action">Action</Label>
                <Select value={formData.action} onValueChange={(value) => handleInputChange('action', value)}>
                  <SelectTrigger id="audit-action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Created">Created</SelectItem>
                    <SelectItem value="Updated">Updated</SelectItem>
                    <SelectItem value="Deleted">Deleted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="audit-entity-type">Entity Type</Label>
                <Select
                  value={formData.entityType}
                  onValueChange={(value) => handleInputChange('entityType', value as AuditEntityType)}
                >
                  <SelectTrigger id="audit-entity-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activity">Activity</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                    <SelectItem value="Program">Program</SelectItem>
                    <SelectItem value="Risk">Risk</SelectItem>
                    <SelectItem value="Issue">Issue</SelectItem>
                    <SelectItem value="Benefit">Benefit</SelectItem>
                    <SelectItem value="Milestone">Milestone</SelectItem>
                    <SelectItem value="Scope Change">Scope Change</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="audit-entity-name">Item Name *</Label>
                <Input
                  id="audit-entity-name"
                  value={formData.entityName}
                  onChange={(event) => handleInputChange('entityName', event.target.value)}
                  placeholder="Solar Panel Project"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audit-project-id">Project ID</Label>
                <Input
                  id="audit-project-id"
                  value={formData.projectId}
                  onChange={(event) => handleInputChange('projectId', event.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audit-description">Activity Description *</Label>
              <Textarea
                id="audit-description"
                value={formData.description}
                onChange={(event) => handleInputChange('description', event.target.value)}
                placeholder="Describe what changed or what activity was completed"
                rows={3}
              />
            </div>

            <div className="rounded-lg border border-gray-200 p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">Optional Change Detail</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="audit-change-field">Field</Label>
                  <Input
                    id="audit-change-field"
                    value={formData.changeField}
                    onChange={(event) => handleInputChange('changeField', event.target.value)}
                    placeholder="Budget"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audit-old-value">Old Value</Label>
                  <Input
                    id="audit-old-value"
                    value={formData.oldValue}
                    onChange={(event) => handleInputChange('oldValue', event.target.value)}
                    placeholder="$120,000.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audit-new-value">New Value</Label>
                  <Input
                    id="audit-new-value"
                    value={formData.newValue}
                    onChange={(event) => handleInputChange('newValue', event.target.value)}
                    placeholder="$150,000.00"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="text-white" style={{ backgroundColor: 'var(--council-blue)' }}>
                {editingLogId ? 'Save Changes' : 'Create Log'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
