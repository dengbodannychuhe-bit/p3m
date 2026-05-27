// ============================================================
// src/app/pages/CreateProject.tsx
// Updated to submit to the real backend via ProjectContext.
// Field names now match the backend schema:
//   title (not name), manager (not projectManager)
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useProjects } from '../context/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';

export function CreateProject() {
  const navigate = useNavigate();
  const { addProject } = useProjects();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    jobCostNo: '',
    stage: 'Proposal',
    status: 'Pending Approval',
    approvalStatus: 'Pending',
    priority: 'Medium',
    budget: '',
    manager: '',
    departmentHead: '',
    department: '',
    program: '',
    startDate: '',
    endDate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.manager) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.jobCostNo && !/^\d{4} - \d{4} - \d{4}$/.test(formData.jobCostNo)) {
      toast.error('Job Cost No must use the format 1234 - 5678 - 9012');
      return;
    }

    setIsSubmitting(true);
    try {
      await addProject({
        title: formData.title,
        description: formData.description,
        jobCostNo: formData.jobCostNo || undefined,
        manager: formData.manager,
        departmentHead: formData.departmentHead || undefined,
        budget: formData.budget ? Number(formData.budget.replace(/[^0-9]/g, '')) : undefined,
        stage: formData.stage,
        status: formData.status,
        approvalStatus: formData.approvalStatus,
        priority: formData.priority,
        department: formData.department || undefined,
        program: formData.program || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      });

      toast.success('Project created successfully!');
      navigate('/projects');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleJobCostChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    const parts = [digits.slice(0, 4), digits.slice(4, 8), digits.slice(8, 12)].filter(Boolean);
    handleChange('jobCostNo', parts.join(' - '));
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link to="/projects">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
          <p className="text-sm text-gray-500 mt-0.5">Enter the details for the new council project</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                placeholder="Enter project title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Enter project description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Stage and Approval Status */}
            <div className="space-y-2">
              <Label htmlFor="jobCostNo">Job Cost No</Label>
              <Input
                id="jobCostNo"
                inputMode="numeric"
                placeholder="1234 - 5678 - 9012"
                value={formData.jobCostNo}
                onChange={(e) => handleJobCostChange(e.target.value)}
                maxLength={18}
              />
            </div>

            {/* Stage and Approval Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stage">Lifecycle Stage *</Label>
                <Select value={formData.stage} onValueChange={(value) => handleChange('stage', value)}>
                  <SelectTrigger id="stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Proposal">Proposal</SelectItem>
                    <SelectItem value="Initiation">Initiation</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Delivery">Delivery</SelectItem>
                    <SelectItem value="Close-out">Close-out</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="approvalStatus">Approval Status *</Label>
                <Select value={formData.approvalStatus} onValueChange={(value) => handleChange('approvalStatus', value)}>
                  <SelectTrigger id="approvalStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Project Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Budget and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (e.g. 1500000)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="e.g. 1500000"
                  value={formData.budget}
                  onChange={(e) => handleChange('budget', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="e.g. Infrastructure"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                />
              </div>
            </div>

            {/* Project Manager */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manager">Project Manager *</Label>
                <Input
                  id="manager"
                  placeholder="Enter project manager name"
                  value={formData.manager}
                  onChange={(e) => handleChange('manager', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentHead">Department Head</Label>
                <Input
                  id="departmentHead"
                  placeholder="Enter department head name"
                  value={formData.departmentHead}
                  onChange={(e) => handleChange('departmentHead', e.target.value)}
                />
              </div>
            </div>

            {/* Program */}
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Input
                id="program"
                placeholder="e.g. Roads Renewal Program"
                value={formData.program}
                onChange={(e) => handleChange('program', e.target.value)}
              />
            </div>

            {/* Start and End Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="gap-2 text-white font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--council-blue)' }}
              >
                {isSubmitting ? 'Creating…' : 'Create Project'}
              </Button>
              <Link to="/projects">
                <Button type="button" variant="outline" size="lg" className="text-gray-600">
                  Cancel
                </Button>
              </Link>
            </div>

          </CardContent>
        </Card>
      </form>
    </div>
  );
}
