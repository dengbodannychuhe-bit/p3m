import { Link } from 'react-router';
import { useProjects } from '../context/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Layers, Loader2 } from 'lucide-react';

export function Programs() {
  const { projects, loading, error } = useProjects();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading programs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-red-800">
        <strong className="font-semibold">Could not load programs.</strong>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const groupedProjects = projects.reduce<Record<string, typeof projects>>((acc, project) => {
    const program = project.program || 'No Program Assigned';
    acc[program] = acc[program] || [];
    acc[program].push(project);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Programs</h2>
        <p className="text-sm text-gray-500 mt-0.5">Projects grouped by program for portfolio review</p>
      </div>

      {Object.entries(groupedProjects).map(([program, programProjects]) => (
        <Card key={program} className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--council-blue)]" />
                {program}
              </span>
              <Badge variant="outline">{programProjects.length} projects</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programProjects.map(project => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Link to={`/projects/${project.id}`} className="font-semibold text-gray-900 hover:text-[var(--council-blue)]">
                        {project.title}
                      </Link>
                    </TableCell>
                    <TableCell>{project.status}</TableCell>
                    <TableCell>{project.priority}</TableCell>
                    <TableCell>{project.manager || '-'}</TableCell>
                    <TableCell>{project.department || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {projects.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500 py-12">No projects yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
