// All remaining Student portal pages — connected to API with clean empty states
import { useState, useEffect, useRef } from 'react';
import {
  Card, CardHeader, PageHeader, Table, Button, Input, Select,
  Textarea, Badge, ProgressBar, Tabs, Avatar, EmptyState, Modal,
  StatCard, showToast,
} from '../../components/ui/index';
import { api } from '../../services/api';

/* ════════════════════════════════════════════
   PROFILE
════════════════════════════════════════════ */
export function StudentProfile() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('studentUser');
      if (stored) {
        const u = JSON.parse(stored);
        return {
          fullName: u.full_name || '',
          enrollId: u.enroll_id || '',
          class: u.class_name || '',
          semester: u.semester || 1,
          section: '',
          dob: '',
          gender: '',
          email: '',
          phone: '',
          address: '',
          rollNo: '',
          guardian: '',
          guardianPhone: '',
        };
      }
    } catch (e) {}
    return {
      fullName: '', enrollId: '', class: '', semester: 1, section: '',
      dob: '', gender: '', email: '', phone: '', address: '', rollNo: '',
      guardian: '', guardianPhone: '',
    };
  });

  useEffect(() => {
    api.getStudentProfile()
      .then(data => {
        if (!data) return;
        setProfile({
          fullName: data.full_name || data.user?.full_name || '',
          enrollId: data.enroll_id || '',
          dob: data.dob_iso || data.dob || '',
          gender: data.gender === 'M' ? 'Male' : data.gender === 'F' ? 'Female' : (data.gender || ''),
          email: data.user?.email || '',
          phone: data.phone || '',
          address: data.address || '',
          class: data.class_name || '',
          rollNo: data.roll_no || '',
          guardian: data.guardian || '',
          guardianPhone: data.guardian_phone || '',
          semester: data.semester || 1,
          section: data.section || '',
        });
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const updated = {
      phone: fd.get('phone'),
      address: fd.get('address'),
      guardian: fd.get('guardian'),
      guardian_phone: fd.get('guardian_phone'),
      dob: fd.get('dob'),
      gender: fd.get('gender') === 'Male' ? 'M' : fd.get('gender') === 'Female' ? 'F' : 'O',
    };
    try {
      await api.updateStudentProfile(updated);
    } catch (err) {
      return;
    }
    setProfile(p => ({
      ...p,
      phone: updated.phone || p.phone,
      address: updated.address || p.address,
      guardian: updated.guardian || p.guardian,
      guardianPhone: updated.guardian_phone || p.guardianPhone,
      dob: updated.dob || p.dob,
      gender: fd.get('gender') || p.gender,
    }));
    setEditing(false);
    showToast('Profile updated successfully.');
  };

  const Field = ({ label, value, name, type = 'text', children }) => (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 5 }}>{label}</label>
      {editing && !children
        ? <input type={type} name={name} defaultValue={value} className="field-input" />
        : editing && children ? children
        : <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '9px 13px' }}>{value || '—'}</div>
      }
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title="My Profile" subtitle="View and manage your personal information." />
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Left card */}
        <Card style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 16 }}>
            <Avatar name={profile.fullName || 'Student'} size="xl" style={{ margin: '0 auto 14px' }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{profile.fullName || 'Student'}</h2>
            <p style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{profile.enrollId || '—'}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>{profile.class ? `Class ${profile.class}` : 'Student Portal'}</p>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
              <Badge label="Active" variant="active" />
              {profile.semester && <Badge label={`Sem ${profile.semester}`} variant="info" />}
              {profile.section && <Badge label={`Sec ${profile.section}`} variant="pending" />}
            </div>
          </div>
          <Button fullWidth variant={editing ? 'secondary' : 'primary'} onClick={() => setEditing(e => !e)}>
            {editing ? '✕ Cancel' : '✏️ Edit Profile'}
          </Button>
        </Card>

        {/* Info panel */}
        <Card>
          <CardHeader title="Personal Information" />
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <Field label="Full Name" value={profile.fullName} name="full_name" />
              <Field label="Enrollment ID" value={profile.enrollId} />
              <Field label="Date of Birth" value={profile.dob} name="dob" type="date" />
              <Field label="Gender" value={profile.gender} name="gender">
                <select name="gender" defaultValue={profile.gender || 'Other'} className="field-input field-select">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </Field>
              <div style={{ gridColumn: '1/-1', borderTop: '1px solid var(--border)', margin: '4px 0' }} />
              <Field label="Email" value={profile.email} name="email" type="email" />
              <Field label="Phone" value={profile.phone} name="phone" type="tel" />
              <div style={{ gridColumn: '1/-1' }}>
                <Field label="Address" value={profile.address} name="address" />
              </div>
              <div style={{ gridColumn: '1/-1', borderTop: '1px solid var(--border)', margin: '4px 0' }} />
              <Field label="Class" value={profile.class} />
              <Field label="Roll Number" value={profile.rollNo} />
              <Field label="Guardian" value={profile.guardian} name="guardian" />
              <Field label="Guardian Phone" value={profile.guardianPhone} name="guardian_phone" type="tel" />
            </div>
            {editing && (
              <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <Button type="submit">💾 Save Changes</Button>
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   EXAM DETAILS
════════════════════════════════════════════ */
export function StudentExamDetails() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStudentExams()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        setExams(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cols = [
    { key: 'exam_name', label: 'Exam Name', render: (v, r) => v || r.name },
    { key: 'subject', label: 'Subject', render: v => <Badge label={v} variant="info" /> },
    { key: 'exam_date', label: 'Date', render: (v, r) => v || r.date },
    { key: 'exam_time', label: 'Time', render: (v, r) => v || r.time },
    { key: 'venue', label: 'Venue' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title="Exam Details" subtitle="Upcoming exams scheduled for your class." />
      <Card>
        <Table columns={cols} data={exams} empty="No exams scheduled." />
      </Card>
    </div>
  );
}

/* ════════════════════════════════════════════
   MARKS
════════════════════════════════════════════ */
export function StudentMarks() {
  const [marks, setMarks] = useState([]);

  useEffect(() => {
    api.getStudentMarks()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        setMarks(data.map((m, idx) => ({
          id: m.id || idx,
          subject: m.subject,
          max: m.max_marks || 100,
          scored: m.scored,
          pct: m.percentage ? Math.round(m.percentage) : Math.round((m.scored / (m.max_marks || 100)) * 100),
          grade: m.grade || '—',
        })));
      })
      .catch(() => {});
  }, []);

  const avgPct = marks.length > 0 ? Math.round(marks.reduce((acc, m) => acc + (m.pct || 0), 0) / marks.length) : 0;
  const best = marks.length > 0 ? [...marks].sort((a, b) => (b.pct || 0) - (a.pct || 0))[0]?.subject : '—';

  const cols = [
    { key: 'subject', label: 'Subject' },
    { key: 'max',     label: 'Max' },
    { key: 'scored',  label: 'Scored' },
    { key: 'pct',     label: 'Percentage', render: v => `${v}%` },
    { key: 'grade',   label: 'Grade', render: v => <Badge label={v} variant={v.startsWith('A') ? 'approved' : v.startsWith('B') ? 'active' : 'pending'} /> },
    { key: 'pct',     label: 'Bar', render: v => <ProgressBar value={v} color={v >= 80 ? 'success' : v >= 60 ? 'accent' : 'danger'} size="sm" /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title="My Marks" subtitle="Academic performance across all subjects." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
        <StatCard icon="🏆" label="Overall Average" value={`${avgPct}%`} color="success" />
        <StatCard icon="📈" label="Class Rank" value="—" color="accent" />
        <StatCard icon="⭐" label="Best Subject" value={best} color="warning" />
        <StatCard icon="📋" label="Exams Appeared" value={String(marks.length)} color="info" />
      </div>
      <Card><Table columns={cols} data={marks} empty="No marks recorded yet." /></Card>
    </div>
  );
}

/* ════════════════════════════════════════════
   ATTENDANCE
════════════════════════════════════════════ */
export function StudentAttendance() {
  const ringRef = useRef(null);
  const [log, setLog] = useState([]);
  const [stats, setStats] = useState({ pct: 0, present: 0, absent: 0, late: 0, leave: 0 });

  useEffect(() => {
    api.getStudentAttendance()
      .then(res => {
        if (!res) return;
        const records = res.records || (Array.isArray(res) ? res : res.results) || [];
        setLog(records);
        const total = records.length;
        const p = records.filter(r => r.status === 'P' || r.status === 'Present').length;
        const a = records.filter(r => r.status === 'A' || r.status === 'Absent').length;
        const l = records.filter(r => r.status === 'L' || r.status === 'Late').length;
        const e = records.filter(r => r.status === 'E' || r.status === 'Leave').length;
        const pct = res.percentage != null ? res.percentage : total > 0 ? Math.round((p / total) * 100) : 0;
        setStats({ pct, present: p, absent: a, late: l, leave: e });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (ringRef.current) {
      const c = 2 * Math.PI * 45;
      ringRef.current.style.strokeDasharray = c;
      ringRef.current.style.strokeDashoffset = c * (1 - stats.pct / 100);
    }
  }, [stats.pct]);

  const vMap = { P: 'present', Present: 'present', A: 'absent', Absent: 'absent', L: 'late', Late: 'late', E: 'leave', Leave: 'leave' };
  const labelMap = { P: 'Present', A: 'Absent', L: 'Late', E: 'On Leave' };

  const cols = [
    { key: 'date', label: 'Date' },
    { key: 'subject', label: 'Subject', render: v => v || '—' },
    { key: 'status', label: 'Status', render: v => <Badge label={labelMap[v] || v} variant={vMap[v] || 'pending'} dot /> },
    { key: 'remarks', label: 'Remarks', render: v => <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{v || '—'}</span> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title="Attendance" subtitle="Your attendance record for the current academic year." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14 }}>
        <Card style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle fill="none" stroke="var(--bg-muted)" strokeWidth="10" cx="50" cy="50" r="45" />
              <circle ref={ringRef} fill="none" stroke="var(--success)" strokeWidth="10" strokeLinecap="round" cx="50" cy="50" r="45" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)', lineHeight: 1 }}>{stats.pct}%</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Overall</p>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Attendance Rate</p>
        </Card>
        <StatCard icon="✅" label="Days Present" value={String(stats.present)} color="success" />
        <StatCard icon="❌" label="Days Absent" value={String(stats.absent)} color="danger" />
        <StatCard icon="⏱️" label="Days Late" value={String(stats.late)} color="warning" />
        <StatCard icon="🏖️" label="On Leave" value={String(stats.leave)} color="info" />
      </div>
      <Card><CardHeader title="Attendance Log" /><Table columns={cols} data={log} empty="No attendance records found." /></Card>
    </div>
  );
}

/* ════════════════════════════════════════════
   SESSIONS
════════════════════════════════════════════ */
export function StudentSessions() {
  const [tab, setTab] = useState('upcoming');
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.getStudentSessions()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        setSessions(data);
      })
      .catch(() => {});
  }, []);

  const filtered = sessions.filter(s => (s.status || 'upcoming').toLowerCase() === tab);

  const cols = [
    { key: 'title', label: 'Session' },
    { key: 'course_name', label: 'Course', render: (v, r) => v || r.course || '—' },
    { key: 'scheduled_date', label: 'Date / Time', render: (v, r) => `${v || ''} ${r.scheduled_time || ''}`.trim() || '—' },
    { key: 'platform', label: 'Platform', render: v => v || 'Online' },
    { key: 'link', label: 'Action', render: (v, r) => r.link
      ? <Button size="xs" variant={r.status === 'live' ? 'primary' : 'outline'} onClick={() => window.open(r.link, '_blank')}>{r.status === 'live' ? '▶ Join Now' : '▶ Watch'}</Button>
      : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title="Sessions" subtitle="Scheduled, live, and recorded teaching sessions." />
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Tabs tabs={[{ value: 'upcoming', label: '📅 Upcoming' }, { value: 'live', label: '🔴 Live Now' }, { value: 'past', label: '🎬 Past' }]}
            active={tab} onChange={setTab} />
        </div>
        <Table columns={cols} data={filtered} empty={`No ${tab} sessions found.`} />
      </Card>
    </div>
  );
}

/* ════════════════════════════════════════════
   MY COURSES
════════════════════════════════════════════ */
export function StudentMyCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.getStudentCourses()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        setCourses(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title="My Courses" subtitle="Enrolled courses and study materials." />
      {courses.length === 0 ? (
        <Card><EmptyState icon="📚" title="No courses enrolled" subtitle="You are not enrolled in any active courses yet." /></Card>
      ) : (
        courses.map(c => (
          <Card key={c.code || c.id} hover>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: c.materials?.length ? 16 : 0 }}>
              <Badge label={c.code} variant="info" />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{c.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.instructor_name || c.instructor || 'Instructor'}</p>
              </div>
              <Badge label={`${c.materials?.length || 0} files`} variant="neutral" />
            </div>
            {c.materials && c.materials.length > 0 ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {c.materials.map((m, idx) => (
                  <a key={idx} href={m.file || '#'} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    📄 {m.title || m}
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>No study materials uploaded yet.</p>
            )}
          </Card>
        ))
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   STUDENT PROGRESS
════════════════════════════════════════════ */
export function StudentProgress() {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    api.getStudentMarks()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        setSubjects(data.map(m => {
          const score = m.percentage ? Math.round(m.percentage) : Math.round((m.scored / (m.max_marks || 100)) * 100);
          return {
            subject: m.subject,
            score,
            cat: score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Average' : 'At Risk',
          };
        }));
      })
      .catch(() => {});
  }, []);

  const catV = { Excellent: 'approved', Good: 'active', Average: 'pending', 'At Risk': 'rejected' };
  const catColor = { Excellent: 'success', Good: 'accent', Average: 'warning', 'At Risk': 'danger' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title="Student Progress" subtitle="Visual summary of your academic competency." />
      <Card>
        <CardHeader title="Subject-wise Competency" />
        {subjects.length === 0 ? (
          <EmptyState icon="📈" title="No performance data" subtitle="Subject scores will appear here once exams are graded." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {subjects.map(d => (
              <div key={d.subject}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{d.subject}</span>
                  <Badge label={d.cat} variant={catV[d.cat]} />
                </div>
                <ProgressBar value={d.score} label={`${d.score}%`} color={catColor[d.cat]} size="md" />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ════════════════════════════════════════════
   TASKS
════════════════════════════════════════════ */
export function StudentTasks() {
  const [tab, setTab] = useState('todo');
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchTasks = () => {
    api.getStudentTasks()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        setTasks(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const cols = { todo: 'To Do', inprogress: 'In Progress', done: 'Completed' };
  const filtered = tasks.filter(t => (t.status || 'todo') === tab);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newTask = {
      title: fd.get('title'),
      description: fd.get('description'),
      due_date: fd.get('due_date') || null,
      status: 'todo',
    };
    try {
      await api.submitStudentTask(newTask);
      fetchTasks();
      setShowModal(false);
      showToast('Task submitted successfully.');
    } catch (err) {
      // The API client displays the backend validation message. Keep the modal
      // open so the student can correct the entered data.
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        title="Tasks & Assignments"
        subtitle="Manage your homework and study goals."
        action={<Button icon="+" onClick={() => setShowModal(true)}>New Task</Button>}
      />
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Tabs tabs={Object.entries(cols).map(([v, l]) => ({ value: v, label: l, count: tasks.filter(t => (t.status || 'todo') === v).length }))}
            active={tab} onChange={setTab} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.length === 0 ? <EmptyState icon="✅" title={`No tasks in ${cols[tab]}`} /> : filtered.map(t => (
            <div key={t.id} style={{
              padding: '14px 16px',
              background: 'var(--bg-subtle)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              opacity: t.status === 'done' ? 0.65 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <Badge label={t.subject || 'Task'} variant="accent" />
                {t.urgent && <Badge label="Urgent" variant="rejected" />}
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</p>
              {t.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{t.description}</p>}
              {t.due_date && <p style={{ fontSize: 12, marginTop: 6, color: 'var(--text-muted)' }}>⏱ Due: {t.due_date}</p>}
            </div>
          ))}
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Task"
        footer={<div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" form="task-form">Create</Button></div>}>
        <form id="task-form" className="form-grid form-grid--1" onSubmit={handleCreateTask}>
          <Input label="Title" name="title" placeholder="Assignment or task title" required />
          <Input label="Due Date" name="due_date" type="date" />
          <Textarea label="Description" name="description" rows={3} placeholder="Task instructions..." />
        </form>
      </Modal>
    </div>
  );
}

/* ════════════════════════════════════════════
   NOTIFICATIONS
════════════════════════════════════════════ */
export function StudentNotifications() {
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.getStudentNotifications()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        setItems(data);
      })
      .catch(() => {});
  }, []);

  const markAll = () => setItems(p => p.map(n => ({ ...n, is_read: true })));
  const visible = items.filter(n => filter === 'all' ? true : filter === 'unread' ? !n.is_read : true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <PageHeader title="Notifications" subtitle="Stay informed about your academics and school events." />
        {items.length > 0 && <Button variant="ghost" size="sm" onClick={markAll}>Mark all as read</Button>}
      </div>
      <Tabs tabs={[{ value: 'all', label: 'All', count: items.length }, { value: 'unread', label: 'Unread', count: items.filter(n => !n.is_read).length }]}
        active={filter} onChange={setFilter} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visible.length === 0 ? <EmptyState icon="🔔" title="No notifications found" /> : visible.map(n => (
          <div key={n.id} style={{
            display: 'flex', gap: 14, padding: '16px 18px',
            background: !n.is_read ? 'var(--accent-light)' : 'var(--bg-elevated)',
            border: `1px solid ${!n.is_read ? 'rgba(99,102,241,0.25)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🔔</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{n.title}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}</p>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message || n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   LEAVE REQUEST
════════════════════════════════════════════ */
export function StudentLeaveRequest() {
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchLeave = () => {
    api.getStudentLeave()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        setHistory(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchLeave();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const leaveData = {
      leave_type: fd.get('leave_type'),
      from_date: fd.get('from_date'),
      to_date: fd.get('to_date'),
      reason: fd.get('reason'),
    };
    try {
      await api.applyStudentLeave(leaveData);
      setSaved(true);
      fetchLeave();
      e.target.reset();
      showToast('Leave request submitted successfully.');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {}
  };

  const cols = [
    { key: 'applied_on', label: 'Applied On', render: (v, r) => v || (r.created_at ? new Date(r.created_at).toLocaleDateString() : '—') },
    { key: 'leave_type', label: 'Leave Type' },
    { key: 'from_date',  label: 'Dates', render: (v, r) => `${v} to ${r.to_date}` },
    { key: 'status',     label: 'Status', render: v => <Badge label={v || 'Pending'} variant={v === 'Approved' ? 'approved' : v === 'Rejected' ? 'rejected' : 'pending'} dot /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title="Leave Request" subtitle="Submit and track your leave applications." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
        <Card>
          <CardHeader title="Submit New Request" />
          {saved && <div style={{ padding: '10px 14px', background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: 13, marginBottom: 16 }}>✓ Leave request submitted!</div>}
          <form className="form-grid form-grid--1" onSubmit={handleSubmit}>
            <Select label="Leave Type" name="leave_type" required>
              {['Medical Leave','Sick Leave','Family Event','Personal'].map(o => <option key={o} value={o}>{o}</option>)}
            </Select>
            <Input label="From Date" name="from_date" type="date" required />
            <Input label="To Date" name="to_date" type="date" required />
            <Textarea label="Reason" name="reason" rows={4} placeholder="Reason for leave..." required />
            <Button type="submit">Submit Request</Button>
          </form>
        </Card>
        <Card>
          <CardHeader title="Leave History" />
          <Table columns={cols} data={history} empty="No leave requests submitted yet." />
        </Card>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   PAYMENT
════════════════════════════════════════════ */
export function StudentPayment() {
  const [txns, setTxns] = useState([]);
  const [totalDue, setTotalDue] = useState(0);

  useEffect(() => {
    api.getStudentPayments()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        setTxns(data);
        const due = data.filter(t => t.status === 'P' || t.status === 'Pending').reduce((acc, t) => acc + Number(t.amount || 0), 0);
        setTotalDue(due);
      })
      .catch(() => {});
  }, []);

  const cols = [
    { key: 'invoice_id', label: 'Invoice', render: (v, r) => v || (r.id ? `#INV-${r.id}` : '—') },
    { key: 'created_at', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'description', label: 'Description', render: (v, r) => v || r.desc || 'Tuition Fee' },
    { key: 'amount', label: 'Amount', render: v => <span style={{ fontWeight: 600 }}>₹{v}</span> },
    { key: 'status', label: 'Status', render: v => <Badge label={v === 'P' ? 'Pending' : v === 'F' ? 'Failed' : 'Paid'} variant={v === 'Paid' || v === 'S' ? 'paid' : 'pending'} dot /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title="Payment" subtitle="Your fee obligations and payment history." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
        <StatCard icon="💰" label="Total Fees Recorded" value={`₹${txns.reduce((a, t) => a + Number(t.amount || 0), 0)}`} color="info" />
        <StatCard icon="✅" label="Amount Paid" value={`₹${txns.filter(t => t.status === 'Paid' || t.status === 'S').reduce((a, t) => a + Number(t.amount || 0), 0)}`} color="success" />
        <StatCard icon="⏳" label="Outstanding Due" value={`₹${totalDue}`} color="warning" />
      </div>
      <Card><CardHeader title="Transaction History" /><Table columns={cols} data={txns} empty="No transaction history found." /></Card>
    </div>
  );
}

/* ════════════════════════════════════════════
   TICKETS
════════════════════════════════════════════ */
export function StudentTickets() {
  const [showModal, setShowModal] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [msg, setMsg] = useState('');

  const fetchTickets = () => {
    api.getStudentTickets()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        setTickets(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.createStudentTicket({
        category: fd.get('category'),
        subject: fd.get('subject'),
        description: fd.get('description'),
      });
      setShowModal(false);
      setMsg('Ticket submitted successfully!');
      fetchTickets();
      showToast('Ticket submitted successfully.');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {}
  };

  const cols = [
    { key: 'ticket_id', label: 'Ticket ID', render: (v, r) => v || (r.id ? `#TKT-${r.id}` : '—') },
    { key: 'subject', label: 'Subject' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status', render: v => <Badge label={v || 'Open'} variant={v === 'Closed' ? 'inactive' : 'open'} dot /> },
    { key: 'created_at', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '—' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title="Support Tickets" subtitle="Raise and track support requests."
        action={<Button icon="+" onClick={() => setShowModal(true)}>New Ticket</Button>} />
      <Card><Table columns={cols} data={tickets} empty="No tickets raised." /></Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Raise Support Ticket"
        footer={<div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" form="tkt-form">Submit</Button></div>}>
        <form id="tkt-form" className="form-grid form-grid--1" onSubmit={handleCreate}>
          <Select label="Category" name="category" required>
            {['Academic','Finance','Library','IT Support','Other'].map(o => <option key={o} value={o}>{o}</option>)}
          </Select>
          <Input label="Subject" name="subject" placeholder="Brief summary" required />
          <Textarea label="Description" name="description" rows={4} placeholder="Details of your issue..." required />
        </form>
      </Modal>
      {msg && <div style={{ padding: '10px 14px', background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: 13 }}>✓ {msg}</div>}
    </div>
  );
}

/* ════════════════════════════════════════════
   CONTACT US
════════════════════════════════════════════ */
export function StudentContactUs() {
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.sendStudentContact({
        department: fd.get('department'),
        subject: fd.get('subject'),
        message: fd.get('message'),
      });
      setSent(true);
      e.target.reset();
      showToast('Message sent successfully.');
      setTimeout(() => setSent(false), 3000);
    } catch (err) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title="Contact Us" subtitle="Send a message to a school department." />
      <Card style={{ maxWidth: 600 }}>
        <CardHeader title="Send a Message" />
        {sent && <div style={{ padding: '10px 14px', background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: 13, marginBottom: 16 }}>✓ Message sent!</div>}
        <form className="form-grid form-grid--1" onSubmit={handleSubmit}>
          <Select label="Department" name="department" required>
            {['Academic Office','Finance Department','Library','IT Support',"Principal's Office"].map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Input label="Subject" name="subject" placeholder="Subject" required />
          <Textarea label="Message" name="message" rows={5} placeholder="Type your message here..." required />
          <Button type="submit" icon="📨">Send Message</Button>
        </form>
      </Card>
    </div>
  );
}

