import { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Globe, Plus, Calendar, User, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function PublicUpdates() {
  const { publicUpdates, addPublicUpdate, updatePublicUpdate, deletePublicUpdate } = useAudit();
  const { user } = useAuth();
  const { projects } = useProjects();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    description: '',
    category: 'Announcement' as 'Progress' | 'Milestone' | 'Announcement' | 'Completion',
  });

  const canCreateUpdate = user?.role === 'Administrator' || user?.role === 'Manager';

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      projectId: '',
      title: '',
      description: '',
      category: 'Announcement',
    });
    setEditingUpdateId(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (update: typeof publicUpdates[0]) => {
    setEditingUpdateId(update.id);
    setFormData({
      projectId: update.projectId,
      title: update.title,
      description: update.description,
      category: update.category,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.projectId || !formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedProject = projects.find(p => String(p.id) === formData.projectId);
    if (!selectedProject) {
      toast.error('Project not found');
      return;
    }

    const updatePayload = {
      projectId: formData.projectId,
      projectName: (selectedProject as any).title ?? (selectedProject as any).name ?? 'Unknown',
      title: formData.title,
      description: formData.description,
      category: formData.category,
      isPublic: true,
    };

    if (editingUpdateId) {
      updatePublicUpdate(editingUpdateId, updatePayload);
      toast.success('Project update saved successfully!');
    } else {
      addPublicUpdate(updatePayload);
      toast.success('Project update published successfully!');
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Progress':
        return { bg: 'var(--council-blue-light)', color: 'var(--council-blue)' };
      case 'Milestone':
        return { bg: 'var(--council-green-light)', color: 'var(--council-green)' };
      case 'Announcement':
        return { bg: 'var(--council-purple-light)', color: 'var(--council-purple)' };
      case 'Completion':
        return { bg: 'var(--council-orange-light)', color: 'var(--council-orange)' };
      default:
        return { bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Project Updates</h2>
          <p className="text-gray-600 mt-2">Project progress updates and council announcements</p>
        </div>
        {canCreateUpdate && (
          <Button
            onClick={openCreateDialog}
            className="text-white hover:opacity-90 gap-2"
            style={{ backgroundColor: 'var(--council-blue)' }}
          >
            <Plus className="w-4 h-4" />
            New Update
          </Button>
        )}
      </div>

      {/* Project Updates List */}
      <div className="grid grid-cols-1 gap-4">
        {publicUpdates.map(update => {
          const colors = getCategoryColor(update.category);

          return (
            <Card
              key={update.id}
              className="hover:shadow-md transition-shadow"
              style={{ backgroundColor: colors.bg }}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="text-white" style={{ backgroundColor: colors.color }}>
                        {update.category}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Globe className="w-3 h-3" />
                        Public
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{update.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{update.projectName}</p>
                  </div>
                  {canCreateUpdate && (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="gap-1.5 bg-white" onClick={() => openEditDialog(update)}>
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 bg-white text-red-700 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          deletePublicUpdate(update.id);
                          toast.success('Project update deleted');
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{update.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{update.publishedBy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(update.publishedAt), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {publicUpdates.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No public updates yet</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingUpdateId ? 'Edit Project Update' : 'Publish Project Update'}</DialogTitle>
            <DialogDescription>
              Enter or update project progress and announcements.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">Project *</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => handleInputChange('projectId', value)}
                >
                  <SelectTrigger id="projectId">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={String(project.id)}>
                        {(project as any).title ?? (project as any).name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Progress">Progress Update</SelectItem>
                    <SelectItem value="Milestone">Milestone Reached</SelectItem>
                    <SelectItem value="Announcement">Announcement</SelectItem>
                    <SelectItem value="Completion">Project Completion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Construction Phase Complete"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about this update..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="text-white hover:opacity-90" style={{ backgroundColor: 'var(--council-blue)' }}>
                {editingUpdateId ? 'Save Update' : 'Publish Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
