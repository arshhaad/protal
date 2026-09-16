import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { StatCard, Card, CardHeader, PageHeader, EmptyState } from '../../components/ui/index';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

export default function StaffDashboard() {
  const { isDark } = useTheme();
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  const [stats, setStats] = useState({
    total_students: 0,
    active_courses: 0,
    attendance_rate: '0%',
    grading_queue: 0,
  });
  const [taskData, setTaskData] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    api.getStaffDashboard()
      .then(data => {
        if (!data) return;
        setStats({
          total_students: data.total_students || 0,
          active_courses: data.active_courses || 0,
          attendance_rate: data.attendance_rate != null ? `${data.attendance_rate}%` : '0%',
          grading_queue: data.grading_queue || 0,
        });
        if (data.task_data) setTaskData(data.task_data);
        if (data.sessions) setSessions(data.sessions);
        if (data.activities) setActivities(data.activities);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{
        background: isDark
          ? 'linear-gradient(135deg,rgba(168,85,247,0.12),rgba(59,130,246,0.08))'
          : 'linear-gradient(135deg,rgba(168,85,247,0.06),rgba(59,130,246,0.04))',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
      }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 6 }}>Faculty Dashboard 👋</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {stats.grading_queue > 0 ? `You have ${stats.grading_queue} submissions awaiting review.` : 'All grading queues are currently clear.'}
        </p>
      </div>

      <div className="dash-grid-4">
        <StatCard icon="👥" label="Students" value={String(stats.total_students)} color="accent" />
        <StatCard icon="📚" label="Courses" value={String(stats.active_courses)} color="info" />
        <StatCard icon="✅" label="Attendance Rate" value={stats.attendance_rate} color="success" />
        <StatCard icon="📋" label="Grading Queue" value={String(stats.grading_queue)} color="warning" />
      </div>

      <div className="dash-grid-main">
        {/* Task submissions chart */}
        <Card>
          <CardHeader title="Task Submissions" subtitle="Submitted vs Graded" />
          {taskData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={taskData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="day" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="submitted" fill="#a855f7" radius={[4,4,0,0]} maxBarSize={28} name="Submitted" />
                <Bar dataKey="graded" fill="#10b981" radius={[4,4,0,0]} maxBarSize={28} name="Graded" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No submission analytics recorded this week.
            </div>
          )}
        </Card>

        {/* Today's schedule */}
        <Card>
          <CardHeader title="Today's Schedule" />
          {sessions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sessions.map((s, i) => (
                <div key={i} style={{
                  padding: '12px 14px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{s.time}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{s.course}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>{s.class}</span><span>{s.room}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No teaching sessions scheduled for today.
            </div>
          )}
        </Card>
      </div>

      {/* Activity feed */}
      <Card>
        <CardHeader title="Recent Activity" />
        {activities.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
            {activities.map((a, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: '12px 14px',
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color || 'var(--accent)', flexShrink: 0, marginTop: 5 }} />
                <div>
                  <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>{a.text}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No recent faculty activity logged.
          </div>
        )}
      </Card>
    </div>
  );
}

