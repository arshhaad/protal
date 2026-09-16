import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { Button, Badge, Card } from '../components/ui/index';

export default function GatewayPage() {
  const { isDark } = useTheme();

  const portals = [
    {
      role: 'Student Portal',
      tag: 'Learner Experience',
      icon: '🎓',
      accent: '#6366f1',
      bgLight: 'rgba(99,102,241,0.06)',
      desc: 'Access personal grades, timetable, homework tasks, attendance streaks, and online fee payments.',
      portalUrl: '/student/dashboard',
      loginUrl: '/student/login',
      features: ['Exam & Marks Analytics', 'Session Recordings', 'Leave Requests', 'Instant Grievance Tickets'],
    },
    {
      role: 'Staff Portal',
      tag: 'Faculty & Educators',
      icon: '📚',
      accent: '#a855f7',
      bgLight: 'rgba(168,85,247,0.06)',
      desc: 'Class management, attendance logging, test creation, student evaluations, and grading workflow.',
      portalUrl: '/staff/dashboard',
      loginUrl: '/staff/login',
      features: ['Class & Test Creation', 'Task Review Queue', 'Study Material Uploads', 'Attendance Tracker'],
    },
    {
      role: 'Head Master Desk',
      tag: 'Executive Leadership',
      icon: '🏛️',
      accent: '#0d9488',
      bgLight: 'rgba(13,148,136,0.06)',
      desc: 'Complete campus oversight, faculty duty allocations, academic performance benchmarking, and leave authorizations.',
      portalUrl: '/hm/dashboard',
      loginUrl: '/hm/login',
      features: ['Faculty Roster Audits', 'Statutory Leave Sign-offs', 'Cohort GPA Benchmarks', 'Official Circulars Publisher'],
    },
    {
      role: 'Institution Admin',
      tag: 'Platform & Finance',
      icon: '🛡️',
      accent: '#ef4444',
      bgLight: 'rgba(239,68,68,0.06)',
      desc: 'System administration, user provisionings, school fee collections, course catalogues, and campus events.',
      portalUrl: '/admin/dashboard',
      loginUrl: '/admin/login',
      features: ['User & Staff Provisioning', 'Fee & Revenue Tracking', 'Course Administration', 'Campus Broadcasts'],
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Navigation */}
      <header style={{
        height: 68,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            color: '#fff',
          }}>
            🎓
          </div>
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
              Edu<span style={{ color: 'var(--accent)' }}>Portal</span>
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginLeft: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
              SaaS Suite
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            <span>Theme</span>
            <ThemeToggle />
          </div>
          <Link
            to="/admin/signup"
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background var(--transition)',
            }}
          >
            Register School
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, maxWidth: 1280, width: '100%', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 'var(--radius-full)', background: 'var(--accent-light)', color: 'var(--accent)', fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
            ✨ Enterprise Multi-Role Educational Operating System
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.8px', marginBottom: 16 }}>
            Modern, Premium UI/UX for Connected Academic Institutions
          </h1>
          <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Designed for high performance, intuitive navigation, and flawless dual light/dark mode operations. Select any role below to explore the live portal environment.
          </p>
        </div>

        {/* Portals Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
        }}>
          {portals.map(p => (
            <div
              key={p.role}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform var(--transition), box-shadow var(--transition)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: p.accent,
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-lg)',
                  background: isDark ? 'rgba(255,255,255,0.06)' : p.bgLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  border: `1px solid ${p.accent}33`,
                }}>
                  {p.icon}
                </div>
                <Badge label={p.tag} variant="neutral" />
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                {p.role}
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20, flex: 1 }}>
                {p.desc}
              </p>

              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 10 }}>
                  Included Capabilities
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                      <span style={{ color: p.accent, fontWeight: 700 }}>✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                <Link
                  to={p.portalUrl}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    height: 42,
                    borderRadius: 'var(--radius-md)',
                    background: p.accent,
                    color: '#fff',
                    fontSize: 13.5,
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'opacity var(--transition)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Launch Live Portal →
                </Link>
                <Link
                  to={p.loginUrl}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 38,
                    borderRadius: 'var(--radius-md)',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'all var(--transition)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--bg-subtle)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  View Sign-In Screen
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '24px 32px',
        textAlign: 'center',
        fontSize: 13,
        color: 'var(--text-muted)',
      }}>
        <p>© 2024 EduPortal — Modern SaaS Educational Enterprise Platform. WCAG 2.1 AA Compliant • Dual Light/Dark Modes.</p>
      </footer>
    </div>
  );
}
