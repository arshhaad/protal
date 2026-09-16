import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthPage from '../../components/AuthPage';
import { Input, PasswordInput, Button, useToast } from '../../components/ui/index';

export default function AdminSignUp() {
  const [adminName, setAdminName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [instCode, setInstCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!adminName || !schoolName || !email || !instCode || !password || !confirmPassword) {
      setError('Please fill in all required registration fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreed) {
      setError('You must agree to the Institution SaaS Terms of Service.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast('Institution Admin account registered successfully! Logging you in…', 'success');
      navigate('/admin/dashboard');
    }, 950);
  };

  return (
    <AuthPage accent="#ef4444" logoIcon="🛡️" logoName="AdminPanel">
      <h1 className="auth-heading">Institution Registration</h1>
      <p className="auth-subheading">Create your administrator account to set up your school on EduPortal SaaS.</p>

      {error && <div className="auth-alert auth-alert--error" role="alert">⚠ {error}</div>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input
            id="adminName"
            label="Administrator Name"
            placeholder="Dr. Samantha Vance"
            icon="👤"
            value={adminName}
            onChange={e => setAdminName(e.target.value)}
            required
          />
          <Input
            id="schoolName"
            label="School / Institution Name"
            placeholder="Oakridge International"
            icon="🏫"
            value={schoolName}
            onChange={e => setSchoolName(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
          <Input
            id="email"
            type="email"
            label="Official Work Email"
            placeholder="admin@oakridge.edu"
            icon="📧"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            id="instCode"
            label="Institution ID / Code"
            placeholder="e.g. OAK-2024"
            icon="🏷️"
            value={instCode}
            onChange={e => setInstCode(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <PasswordInput
            id="password"
            label="Password"
            placeholder="Min. 8 chars"
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

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)', cursor: 'pointer', marginTop: 4 }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            style={{ marginTop: 2 }}
          />
          <span>
            I agree to the <strong style={{ color: 'var(--text-primary)' }}>Institution Master Services Agreement</strong> and Privacy Policy.
          </span>
        </label>

        <Button
          type="submit"
          loading={loading}
          fullWidth
          size="lg"
          style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', height: 44, fontWeight: 600, marginTop: 8 }}
        >
          {loading ? 'Creating Institution Account…' : 'Register Institution'}
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
