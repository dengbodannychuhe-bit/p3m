import { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, FileText, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

export function AuditLogs() {
  const { auditLogs } = useAudit();
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesEntity && matchesAction;
  });

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
        return 'bg-purple-100 text-purple-800';
      case 'Project Manager':
        return 'bg-blue-100 text-blue-800';
      case 'Staff Member':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Audit & Activity Logs</h2>
        <p className="text-gray-600 mt-2">Track all changes and activities across the system</p>
      </div>

      {/* Filters */}
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
                <SelectItem value="Project">Project</SelectItem>
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

      {/* Results Summary */}
      <p className="text-sm text-gray-600">
        Showing {filteredLogs.length} of {auditLogs.length} activity logs
      </p>

      {/* Activity Log List */}
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
                            {' → '}
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
    </div>
  );
}
