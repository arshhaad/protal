import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthPage from '../../components/AuthPage';
import { Input, PasswordInput, Button } from '../../components/ui/index';
import { api, setToken } from '../../services/api';

export default function HMLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier || !password) {
      setError('Please enter your HM Staff ID / Email and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await api.hmLogin({ username: identifier, password });
      setToken(data.token);
      localStorage.setItem('hmUser', JSON.stringify(data.user || data));
      navigate('/hm/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid HM credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPage accent="#0d9488" logoIcon="🏛️" logoName="Headmaster Portal">
      <h1 className="auth-heading">Head Master Portal</h1>
      <p className="auth-subheading">Sign in with your administrative credentials to oversee academic operations.</p>

      {error && <div className="auth-alert auth-alert--error" role="alert">⚠ {error}</div>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input
          id="identifier"
          label="HM Staff ID or Official Email"
          placeholder="e.g. HM-001 or principal@school.edu"
          icon="🏛️"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          required
        />
        <PasswordInput
          id="password"
          label="Password"
          placeholder="Enter your security password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <div className="auth-row">
          <label className="auth-remember">
            <input type="checkbox" defaultChecked /> Remember me
          </label>
          <Link to="/hm/forgot-password" className="auth-forgot" style={{ color: '#0d9488' }}>
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          loading={loading}
          fullWidth
          size="lg"
          style={{ background: '#0d9488', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', height: 44, fontWeight: 600 }}
        >
          {loading ? 'Authenticating…' : 'Access HM Desk'}
        </Button>
      </form>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
        Staff or Student? <Link to="/staff/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Staff Portal</Link> • <Link to="/student/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Student Portal</Link>
      </div>

      <p className="auth-footer">© 2024 EduPortal — School Administration</p>
    </AuthPage>
  );
}
