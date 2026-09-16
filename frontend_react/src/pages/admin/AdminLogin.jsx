import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthPage from '../../components/AuthPage';
import { Input, PasswordInput, Button } from '../../components/ui/index';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/admin/dashboard'); }, 900);
  };

  return (
    <AuthPage accent="#ef4444" logoIcon="🛡️" logoName="AdminPanel">
      <h1 className="auth-heading">Admin Portal</h1>
      <p className="auth-subheading">Restricted access. Sign in with your admin credentials.</p>

      {error && <div className="auth-alert auth-alert--error" role="alert">⚠ {error}</div>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input id="email" type="email" label="Email Address" placeholder="admin@school.edu"
          icon="📧" value={email} onChange={e => setEmail(e.target.value)} required />
        <PasswordInput id="password" label="Password" placeholder="Enter your password"
          value={password} onChange={e => setPassword(e.target.value)} required />

        <div className="auth-row">
          <label className="auth-remember"><input type="checkbox" /> Remember me</label>
          <Link to="/admin/forgot-password" className="auth-forgot" style={{ color: '#ef4444' }}>Forgot password?</Link>
        </div>

        <Button type="submit" loading={loading} fullWidth size="lg"
          style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', height: 44, fontWeight: 600 }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
        New institution administrator?{' '}
        <Link to="/admin/signup" style={{ color: '#ef4444', fontWeight: 600 }}>
          Register Institution
        </Link>
      </div>

      <p className="auth-footer">© 2024 EduPortal — Administration</p>
    </AuthPage>
  );
}
