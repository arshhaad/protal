import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthPage from '../../components/AuthPage';
import { Input, PasswordInput, Button } from '../../components/ui/index';
import { api, setToken } from '../../services/api';

export default function StudentLogin() {
  const [enrollId, setEnrollId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!enrollId || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const data = await api.studentLogin({ enroll_id: enrollId, password });
      if (data && data.token) {
        setToken(data.token);
        localStorage.setItem('studentUser', JSON.stringify(data));
      }
      navigate('/student/dashboard');
    } catch (err) {
      // If API error or offline, show error
      setError(err.message || 'Invalid credentials. Please check your Enrollment ID and password.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <AuthPage accent="#6366f1" logoIcon="🎓" logoName="EduPortal">
      <h1 className="auth-heading">Welcome back</h1>
      <p className="auth-subheading">Sign in with your Enrollment ID to access your portal.</p>

      {error && <div className="auth-alert auth-alert--error" role="alert">⚠ {error}</div>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input
          id="enroll_id"
          label="Enrollment ID"
          placeholder="e.g. STU-2024-001"
          icon="🪪"
          value={enrollId}
          onChange={e => setEnrollId(e.target.value)}
          autoComplete="username"
          required
        />
        <PasswordInput
          id="password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <div className="auth-row">
          <label className="auth-remember">
            <input type="checkbox" /> Remember me
          </label>
          <Link to="/student/forgot-password" className="auth-forgot">Forgot password?</Link>
        </div>

        <Button
          type="submit"
          loading={loading}
          fullWidth
          size="lg"
          className="auth-submit"
          style={{ background: '#6366f1' }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>

      <p className="auth-footer">© 2024 EduPortal — Student Management System</p>
    </AuthPage>
  );
}
