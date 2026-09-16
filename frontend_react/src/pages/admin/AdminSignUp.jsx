import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthPage from '../../components/AuthPage';
import { Input, PasswordInput, Button, useToast } from '../../components/ui/index';
import { api } from '../../services/api';

export default function AdminSignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    api.adminSignup({ username, email, password1: password, password2: confirmPassword })
      .then(() => {
        toast('Signup successful. Please login to continue.', 'success');
        navigate('/admin/login');
      })
      .catch(err => setError(err.message || 'Unable to create account.'))
      .finally(() => {
      setLoading(false);
      });
  };

  return (
    <AuthPage accent="#ef4444" logoIcon="🛡️" logoName="AdminPanel">
      <h1 className="auth-heading">Create your account</h1>
      <p className="auth-subheading">Register with a username, email, and password.</p>

      {error && <div className="auth-alert auth-alert--error" role="alert">⚠ {error}</div>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input id="username" label="Username" placeholder="admin" icon="👤"
          value={username} onChange={e => setUsername(e.target.value)} required />
        <Input id="email" type="email" label="Email" placeholder="admin@school.edu" icon="📧"
          value={email} onChange={e => setEmail(e.target.value)} required />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <PasswordInput
            id="password"
            label="Password"
            placeholder="Min. 6 chars"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <PasswordInput
            id="confirm"
            label="Confirm Password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          loading={loading}
          fullWidth
          size="lg"
          style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', height: 44, fontWeight: 600, marginTop: 8 }}
        >
          {loading ? 'Creating account…' : 'Sign Up'}
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
        Already have an administrator account?{' '}
        <Link to="/admin/login" style={{ color: '#ef4444', fontWeight: 600 }}>
          Sign in
        </Link>
      </div>

      <p className="auth-footer">© 2024 EduPortal — School Administration SaaS</p>
    </AuthPage>
  );
}
