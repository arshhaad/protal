import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthPage from '../../components/AuthPage';
import { PasswordInput, Button } from '../../components/ui/index';

export default function HMResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters with numbers and symbols.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate('/hm/login'), 1800);
    }, 850);
  };

  return (
    <AuthPage accent="#0d9488" logoIcon="🏛️" logoName="Headmaster Portal">
      <h1 className="auth-heading">Set New Security Password</h1>
      <p className="auth-subheading">Choose a strong, unique password for your Head Master administrative account.</p>

      {error && <div className="auth-alert auth-alert--error" role="alert">⚠ {error}</div>}
      {success && (
        <div className="auth-alert auth-alert--success" role="alert">
          ✓ Password reset successfully! Redirecting to login…
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <PasswordInput
          id="password"
          label="New Password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <PasswordInput
          id="confirm"
          label="Confirm New Password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          loading={loading}
          disabled={success}
          fullWidth
          size="lg"
          style={{ background: '#0d9488', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', height: 44, fontWeight: 600 }}
        >
          {loading ? 'Updating Password…' : 'Update Password'}
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <Link to="/hm/login" style={{ color: 'var(--text-secondary)', fontSize: 13, textDecoration: 'none' }}>
          ← Cancel and return to Login
        </Link>
      </div>

      <p className="auth-footer">© 2024 EduPortal — School Administration</p>
    </AuthPage>
  );
}
