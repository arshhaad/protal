import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthPage from '../../components/AuthPage';
import { PasswordInput, Button } from '../../components/ui/index';

function calcStrength(p) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

export default function StudentResetPassword() {
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const s = calcStrength(pwd);
  const matches = pwd === confirm && pwd.length > 0;
  const canSubmit = s >= 2 && matches;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/student/login'); }, 900);
  };

  const barColor = (i) => {
    if (s === 0) return undefined;
    if (i < s) {
      if (s <= 1) return 'pwd-strength__bar--weak';
      if (s <= 2) return 'pwd-strength__bar--fair';
      return 'pwd-strength__bar--strong';
    }
    return undefined;
  };

  return (
    <AuthPage accent="#6366f1" logoIcon="🎓" logoName="EduPortal">
      <div className="auth-icon-wrap" style={{ background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)' }}>🛡️</div>
      <h1 className="auth-heading" style={{ textAlign: 'center' }}>Reset password</h1>
      <p className="auth-subheading" style={{ textAlign: 'center' }}>Choose a strong new password for your account.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div>
          <PasswordInput id="new_password" label="New Password" placeholder="Min. 8 characters"
            value={pwd} onChange={e => setPwd(e.target.value)} required />
          {pwd.length > 0 && (
            <>
              <div className="pwd-strength">
                {[0,1,2,3].map(i => <div key={i} className={`pwd-strength__bar ${barColor(i) || ''}`} />)}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                {['','Weak','Fair','Strong','Very Strong'][s]}
              </p>
            </>
          )}
        </div>

        <div>
          <PasswordInput id="confirm_password" label="Confirm Password" placeholder="Re-enter your password"
            value={confirm} onChange={e => setConfirm(e.target.value)} required />
          {confirm.length > 0 && (
            <p className={`pwd-match ${matches ? 'pwd-match--ok' : 'pwd-match--err'}`}>
              {matches ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}
        </div>

        <Button type="submit" loading={loading} disabled={!canSubmit} fullWidth size="lg"
          style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', height: 44, fontWeight: 600 }}>
          {loading ? 'Updating…' : 'Update Password'}
        </Button>
      </form>
      <Link to="/student/login" className="auth-back">← Back to Login</Link>
    </AuthPage>
  );
}
