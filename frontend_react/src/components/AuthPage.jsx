import ThemeToggle from './ThemeToggle';
import '../styles/auth.css';

export default function AuthPage({ children, accent = '#6366f1', logoIcon = '🎓', logoName = 'EduPortal' }) {
  return (
    <div className="auth-root">
      <div className="auth-theme-toggle"><ThemeToggle /></div>
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo__icon" style={{ background: accent }}>{logoIcon}</div>
          <span className="auth-logo__name" style={{ color: accent }}>{logoName}</span>
        </div>
        {children}
      </div>
    </div>
  );
}
