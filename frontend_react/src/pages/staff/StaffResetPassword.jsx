import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthPage from '../../components/AuthPage';
import { PasswordInput, Button } from '../../components/ui/index';

export default function StaffResetPassword() {
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const matches = pwd === confirm && pwd.length >= 8;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!matches) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/staff/login'); }, 900);
  };

  return (
    <AuthPage accent="#a855f7" logoIcon="📚" logoName="StaffHub">
      <div className="auth-icon-wrap" style={{ background: 'rgba(168,85,247,0.1)', border: '2px solid rgba(168,85,247,0.3)' }}>🛡️</div>
      <h1 className="auth-heading" style={{ textAlign: 'center' }}>Reset password</h1>
      <p className="auth-subheading" style={{ textAlign: 'center' }}>Set a new secure password for your staff account.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <PasswordInput id="new_password" label="New Password" placeholder="Min. 8 characters" value={pwd} onChange={e => setPwd(e.target.value)} required />
        <div>
          <PasswordInput id="confirm" label="Confirm Password" placeholder="Re-enter password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          {confirm.length > 0 && <p className={`pwd-match ${matches ? 'pwd-match--ok' : 'pwd-match--err'}`}>{matches ? '✓ Passwords match' : '✗ Do not match'}</p>}
        </div>
        <Button type="submit" loading={loading} disabled={!matches} fullWidth size="lg" style={{ background: '#a855f7', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', height: 44, fontWeight: 600 }}>
          {loading ? 'Updating…' : 'Update Password'}
        </Button>
      </form>
      <Link to="/staff/login" className="auth-back">← Back to Login</Link>
    </AuthPage>
  );
}
