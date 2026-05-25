import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './Layout';
import { Dashboard } from './pages/Dashboard';
import { ProjectList } from './pages/ProjectList';
import { CreateProject } from './pages/CreateProject';
import { ProjectDetails } from './pages/ProjectDetails';
import { ProjectDetailsFolders } from './pages/ProjectDetailsFolders';
import { Login } from './pages/Login';
import { PortfolioDashboard } from './pages/PortfolioDashboard';
import { Notifications } from './pages/Notifications';
import { PublicUpdates } from './pages/PublicUpdates';
import { AuditLogs } from './pages/AuditLogs';
import { Toolkit } from './pages/Toolkit';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Dashboard },
      { path: 'portfolio', Component: PortfolioDashboard },
      { path: 'projects', Component: ProjectList },
      { path: 'projects/new', Component: CreateProject },
      { path: 'projects/:id', Component: ProjectDetailsFolders },
      { path: 'projects/:id/details', Component: ProjectDetails },
      { path: 'notifications', Component: Notifications },
      { path: 'project-updates', Component: PublicUpdates },
      { path: 'public-updates', element: <Navigate to="/project-updates" replace /> },
      { path: 'audit-logs', Component: AuditLogs },
      { path: 'toolkit', Component: Toolkit },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
