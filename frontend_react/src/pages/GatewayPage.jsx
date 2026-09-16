import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { Card, Button } from '../components/ui/index';

export default function GatewayPage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: 24,
      background: 'var(--bg)',
    }}>
      <div style={{ width: 'min(100%, 420px)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <ThemeToggle />
        </div>
        <Card style={{ textAlign: 'center', padding: '42px 32px' }}>
          <div style={{
            width: 64, height: 64, margin: '0 auto 20px', borderRadius: 18,
            display: 'grid', placeItems: 'center', fontSize: 30,
            background: 'var(--accent-light)',
          }} aria-hidden="true">🎓</div>
          <p style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            EduPortal
          </p>
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>Student Portal</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28 }}>
            Sign in to view your classes, attendance, assignments, and academic progress.
          </p>
          <Link to="/student/login" style={{ textDecoration: 'none' }}>
            <Button fullWidth size="lg">Student Login</Button>
          </Link>
        </Card>
      </div>
    </main>
  );
}
