import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthPage from '../../components/AuthPage';
import { Input, Button } from '../../components/ui/index';

export default function StudentForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 900);
  };

  return (
    <AuthPage accent="#6366f1" logoIcon="🎓" logoName="EduPortal">
      <div className="auth-icon-wrap" style={{ background: 'var(--accent-light)', border: '2px solid var(--accent-ring)' }}>🔑</div>
      <h1 className="auth-heading" style={{ textAlign: 'center' }}>Forgot password?</h1>
      <p className="auth-subheading" style={{ textAlign: 'center' }}>
        Enter your Enrollment ID and we'll send reset instructions.
      </p>

      {sent && (
        <div className="auth-alert auth-alert--success" style={{ marginBottom: 16 }}>
          ✓ Reset instructions sent! Check your registered contact.
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <Input id="enroll_id" label="Enrollment ID" placeholder="e.g. STU-2024-001" icon="🪪" required />
        <Button type="submit" loading={loading} fullWidth size="lg" style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', height: 44, fontWeight: 600 }}>
          {loading ? 'Sending…' : 'Send Reset Instructions'}
        </Button>
      </form>
      <Link to="/student/login" className="auth-back">← Back to Login</Link>
    </AuthPage>
  );
}
