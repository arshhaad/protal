import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthPage from '../../components/AuthPage';
import { Input, Button } from '../../components/ui/index';

export default function AdminForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = (e) => { e.preventDefault(); setLoading(true); setTimeout(() => { setLoading(false); setSent(true); }, 900); };
  return (
    <AuthPage accent="#ef4444" logoIcon="🛡️" logoName="AdminPanel">
      <div className="auth-icon-wrap" style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)' }}>🔑</div>
      <h1 className="auth-heading" style={{ textAlign: 'center' }}>Forgot password?</h1>
      <p className="auth-subheading" style={{ textAlign: 'center' }}>Enter your admin email to receive a secure reset link.</p>
      {sent && <div className="auth-alert auth-alert--success" style={{ marginBottom: 16 }}>✓ Reset link sent to your email!</div>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <Input id="email" type="email" label="Email Address" placeholder="admin@school.edu" icon="📧" required />
        <Button type="submit" loading={loading} fullWidth size="lg" style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', height: 44, fontWeight: 600 }}>
          {loading ? 'Sending…' : 'Send Reset Link'}
        </Button>
      </form>
      <Link to="/admin/login" className="auth-back">← Back to Login</Link>
    </AuthPage>
  );
}
