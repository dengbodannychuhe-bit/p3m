import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ProjectProvider } from './context/ProjectContext';
import { AuthProvider } from './context/AuthContext';
import { AuditProvider } from './context/AuditContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <AuditProvider>
        <ProjectProvider>
          <RouterProvider router={router} />
          <Toaster />
        </ProjectProvider>
      </AuditProvider>
    </AuthProvider>
  );
}