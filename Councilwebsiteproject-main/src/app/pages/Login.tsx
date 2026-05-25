import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import logoImage from '../../imports/Outlook-wehy2530_(2).jfif';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Successfully logged in!');
        navigate('/');
      } else {
        toast.error('Invalid email or password');
      }
    } catch {
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const quickFill = (e: string, p: string) => { setEmail(e); setPassword(p); };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, var(--council-blue-light) 0%, #ffffff 50%, var(--council-purple-light) 100%)' }}
    >
      {/* Top accent bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1"
        style={{ background: 'linear-gradient(to right, var(--council-blue), var(--council-purple))' }}
      />

      <div className="w-full max-w-sm">
        {/* Logo card */}
        <div className="text-center mb-6">
          <a
            href="https://www.warren.nsw.gov.au/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center p-4 rounded-2xl shadow-md mb-4 bg-white hover:shadow-lg transition-shadow"
            style={{ border: '1px solid rgba(0,111,185,0.15)' }}
            title="Visit Warren Shire Council website"
          >
            <img src={logoImage} alt="Warren Shire Council" className="h-20 object-contain" />
          </a>
          <h1 className="text-2xl font-bold text-gray-900">Warren Shire Council</h1>
          <p className="text-sm text-gray-500 mt-1">Project Management Portal</p>
        </div>

        {/* Login card */}
        <Card className="shadow-lg border-gray-200">
          <CardContent className="pt-6 pb-6 px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@council.gov"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-9 text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-9 text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gap-2 text-white font-semibold shadow-sm hover:opacity-90 transition-opacity mt-2"
                style={{ backgroundColor: 'var(--council-blue)' }}
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
              </Button>
            </form>

            {/* Demo credentials */}
            <div
              className="mt-5 p-3.5 rounded-lg"
              style={{ backgroundColor: 'var(--council-blue-light)', border: '1px solid rgba(0,111,185,0.2)' }}
            >
              <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--council-blue)' }}>
                Demo Accounts
              </p>
              <div className="space-y-1.5">
                {[
                  { label: 'Administrator', email: 'admin@council.gov',   pw: 'admin123' },
                  { label: 'Manager',       email: 'manager@council.gov', pw: 'manager123' },
                  { label: 'Staff',         email: 'staff@council.gov',   pw: 'staff123' },
                ].map(u => (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => quickFill(u.email, u.pw)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-white/60 transition-colors text-left"
                    style={{ color: 'var(--council-blue)' }}
                  >
                    <span className="text-xs font-medium">{u.label}</span>
                    <span className="text-xs opacity-70">{u.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-5">
          © {new Date().getFullYear()} Warren Shire Council · Project Management System
        </p>
      </div>
    </div>
  );
}
