import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthPage from '../../components/AuthPage';
import { Input, PasswordInput, Button } from '../../components/ui/index';

export default function StaffLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/staff/dashboard'); }, 900);
  };

  return (
    <AuthPage accent="#a855f7" logoIcon="📚" logoName="StaffHub">
      <h1 className="auth-heading">Staff Portal</h1>
      <p className="auth-subheading">Sign in to manage your classes, sessions and students.</p>

      {error && <div className="auth-alert auth-alert--error" role="alert">⚠ {error}</div>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input id="username" label="Username or Email" placeholder="Enter your username"
          icon="👤" value={username} onChange={e => setUsername(e.target.value)} required />
        <PasswordInput id="password" label="Password" placeholder="Enter your password"
          value={password} onChange={e => setPassword(e.target.value)} required />

        <div className="auth-row">
          <label className="auth-remember"><input type="checkbox" /> Remember me</label>
          <Link to="/staff/forgot-password" className="auth-forgot" style={{ color: '#a855f7' }}>Forgot password?</Link>
        </div>

        <Button type="submit" loading={loading} fullWidth size="lg"
          style={{ background: '#a855f7', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', height: 44, fontWeight: 600 }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
      <p className="auth-footer">© 2024 EduPortal — Staff Portal</p>
    </AuthPage>
  );
}
