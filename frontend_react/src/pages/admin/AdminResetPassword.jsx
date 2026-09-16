import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthPage from '../../components/AuthPage';
import { PasswordInput, Button } from '../../components/ui/index';

export default function AdminResetPassword() {
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const matches = pwd === confirm && pwd.length >= 8;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!matches) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/admin/login'); }, 900);
  };

  return (
    <AuthPage accent="#ef4444" logoIcon="🛡️" logoName="AdminPanel">
      <div className="auth-icon-wrap" style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)' }}>🛡️</div>
      <h1 className="auth-heading" style={{ textAlign: 'center' }}>Reset password</h1>
      <p className="auth-subheading" style={{ textAlign: 'center' }}>Set a new secure password for your admin account.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <PasswordInput id="new_password" label="New Password" placeholder="Min. 8 characters" value={pwd} onChange={e => setPwd(e.target.value)} required />
        <div>
          <PasswordInput id="confirm" label="Confirm Password" placeholder="Re-enter password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          {confirm.length > 0 && <p className={`pwd-match ${matches ? 'pwd-match--ok' : 'pwd-match--err'}`}>{matches ? '✓ Passwords match' : '✗ Do not match'}</p>}
        </div>
        <Button type="submit" loading={loading} disabled={!matches} fullWidth size="lg" style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', height: 44, fontWeight: 600 }}>
          {loading ? 'Updating…' : 'Update Password'}
        </Button>
      </form>
      <Link to="/admin/login" className="auth-back">← Back to Login</Link>
    </AuthPage>
  );
}
