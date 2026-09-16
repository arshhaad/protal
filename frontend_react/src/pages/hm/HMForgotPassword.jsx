import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthPage from '../../components/AuthPage';
import { Input, Button } from '../../components/ui/index';

export default function HMForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  };

  return (
    <AuthPage accent="#0d9488" logoIcon="🏛️" logoName="Headmaster Portal">
      <h1 className="auth-heading">Reset HM Credentials</h1>
      <p className="auth-subheading">Enter your official registered email address to receive password recovery instructions.</p>

      {sent ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center' }}>
          <div className="auth-alert auth-alert--success">
            ✓ Password reset link has been dispatched to <strong>{email}</strong>.
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Follow the instructions in the email to securely reset your credentials.
          </p>
          <Link
            to="/hm/login"
            style={{
              display: 'inline-block',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              background: '#0d9488',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
              marginTop: 8,
            }}
          >
            Return to HM Login
          </Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Input
            id="email"
            type="email"
            label="Official Registered Email"
            placeholder="hm@school.edu"
            icon="📧"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <Button
            type="submit"
            loading={loading}
            fullWidth
            size="lg"
            style={{ background: '#0d9488', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', height: 44, fontWeight: 600 }}
          >
            {loading ? 'Transmitting…' : 'Send Recovery Link'}
          </Button>

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Link to="/hm/login" style={{ color: 'var(--text-secondary)', fontSize: 13, textDecoration: 'none' }}>
              ← Return to HM Login
            </Link>
          </div>
        </form>
      )}

      <p className="auth-footer">© 2024 EduPortal — School Administration</p>
    </AuthPage>
  );
}
