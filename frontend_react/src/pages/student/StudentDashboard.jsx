import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { StatCard, Card, CardHeader, Badge, PageHeader, ProgressBar } from '../../components/ui/index';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

const quickLinks = [
  { to: '/student/exam-details',  icon: '📝', label: 'Exams' },
  { to: '/student/marks',         icon: '📊', label: 'Marks' },
  { to: '/student/attendance',    icon: '📅', label: 'Attendance' },
  { to: '/student/tasks',         icon: '✅', label: 'Tasks' },
  { to: '/student/my-courses',    icon: '📚', label: 'Courses' },
  { to: '/student/payment',       icon: '💳', label: 'Payment' },
  { to: '/student/leave-request', icon: '🗓️', label: 'Leave' },
  { to: '/student/contact-us',    icon: '📞', label: 'Help' },
];

export default function StudentDashboard() {
  const { isDark } = useTheme();
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  const [stats, setStats] = useState({
    attendance_pct: 0,
    avg_marks: 0,
    tasks_pending: 0,
    due_payment: 0,
  });
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [activities, setActivities] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    let isMounted = true;
    api.getStudentDashboard()
      .then(data => {
        if (!isMounted || !data) return;
        setStats({
          attendance_pct: data.attendance_pct || 0,
          avg_marks: data.avg_marks || 0,
          tasks_pending: data.tasks_pending || 0,
          due_payment: data.due_payment || 0,
        });
        if (data.attendance_trend) setAttendanceTrend(data.attendance_trend);
        if (data.activities) setActivities(data.activities);
        if (data.subjects) setSubjects(data.subjects);
      })
      .catch(() => {
        // Graceful empty state if unauthenticated or not yet configured
      });
    return () => { isMounted = false; };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's an overview of your academic activity."
      />

      {/* Stat cards */}
      <div className="dash-grid-4">
        <StatCard icon="📅" label="Attendance" value={`${stats.attendance_pct}%`} color="accent" />
        <StatCard icon="🏆" label="Avg Marks" value={`${stats.avg_marks}%`} color="success" />
        <StatCard icon="✅" label="Tasks Pending" value={String(stats.tasks_pending)} color="warning" />
        <StatCard icon="💳" label="Due Payment" value={`₹${stats.due_payment}`} color="info" />
      </div>

      {/* Charts + quick links row */}
      <div className="dash-grid-main">
        {/* Attendance trend */}
        <Card>
          <CardHeader title="Attendance Trend" subtitle="Monthly attendance rate this year" />
          {attendanceTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={attendanceTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                  formatter={(v) => [`${v}%`, 'Attendance']}
                />
                <Area type="monotone" dataKey="pct" stroke="#6366f1" strokeWidth={2} fill="url(#attGrad)" dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No attendance trend data available yet.
            </div>
          )}
        </Card>

        {/* Quick access */}
        <Card>
          <CardHeader title="Quick Access" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {quickLinks.map(q => (
              <Link key={q.to} to={q.to} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '12px 6px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500,
                textDecoration: 'none', transition: 'all var(--transition)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <span style={{ fontSize: 20 }}>{q.icon}</span>
                {q.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Subject performance + activity */}
      <div className="dash-grid-2">
        <Card>
          <CardHeader title="Subject Performance" />
          {subjects.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {subjects.map(s => (
                <ProgressBar key={s.name} label={s.name} value={s.score}
                  color={s.score >= 85 ? 'success' : s.score >= 70 ? 'accent' : 'warning'} />
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No subject grades recorded yet.
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent Activity"
            action={<Link to="/student/notifications" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>}
          />
          {activities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activities.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color || 'var(--accent)', flexShrink: 0, marginTop: 5 }} />
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>{a.text}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No recent notifications or activity.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

