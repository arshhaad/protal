// All Admin portal pages — clean dynamic state
import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  StatCard, Card, CardHeader, Badge, PageHeader, Table,
  Button, Input, Select, Textarea, SearchInput, Modal,
  Tabs, Avatar, EmptyState, ProgressBar,
} from '../../components/ui/index';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

/* ── shared helpers ── */
function Section({ children }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>{children}</div>;
}

/* ════════════════════════════════════════════
   ADMIN DASHBOARD
════════════════════════════════════════════ */
export function AdminDashboard() {
  const { isDark } = useTheme();
  const gc = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const tc = isDark ? '#94a3b8' : '#64748b';

  const [metrics, setMetrics] = useState({
    total_students: 0,
    active_staff: 0,
    active_courses: 0,
    revenue_collected: '₹0',
  });
  const [enrolData, setEnrolData] = useState([]);
  const [feeData, setFeeData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.getAdminDashboard()
      .then(res => {
        if (!res) return;
        setMetrics({
          total_students: res.total_students || 0,
          active_staff: res.active_staff || 0,
          active_courses: res.active_courses || 0,
          revenue_collected: res.revenue_collected ? `₹${res.revenue_collected}` : '₹0',
        });
        if (res.enrol_trend) setEnrolData(res.enrol_trend);
        if (res.fee_trend) setFeeData(res.fee_trend);
        if (res.fee_breakdown) setPieData(res.fee_breakdown);
        if (res.recent_activity) setRecent(res.recent_activity);
      })
      .catch(() => {});
  }, []);

  const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <Section>
      <PageHeader title="Admin Dashboard" subtitle="Platform health and key metrics at a glance." />

      <div className="dash-grid-4">
        <StatCard icon="students" label="Total Students" value={String(metrics.total_students)} color="accent" />
        <StatCard icon="staff" label="Active Staff" value={String(metrics.active_staff)} color="info" />
        <StatCard icon="courses" label="Active Courses" value={String(metrics.active_courses)} color="success" />
        <StatCard icon="payment" label="Revenue Collected" value={metrics.revenue_collected} color="warning" />
      </div>

      <div className="dash-grid-2">
        <Card>
          <CardHeader title="Student Enrolment Trend" subtitle="Monthly registered students" />
          {enrolData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={enrolData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gc} />
                <XAxis dataKey="month" tick={{ fill: tc, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: tc, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="students" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} name="Students" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No enrolment trends recorded yet.
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Fee Collection" subtitle="Monthly revenue (₹)" />
          {feeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={feeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gc} />
                <XAxis dataKey="month" tick={{ fill: tc, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: tc, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={v => [`₹${(v/1000).toFixed(0)}k`, 'Collected']} />
                <Bar dataKey="collected" fill="#f97316" radius={[4,4,0,0]} maxBarSize={32} name="Collected" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No fee revenue logged yet.
            </div>
          )}
        </Card>
      </div>

      <div className="dash-grid-main">
        <Card>
          <CardHeader title="Recent Platform Activity" />
          {recent.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {recent.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 14, padding: '13px 0',
                  borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none',
                  alignItems: 'center',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                  }}>{r.icon || 'ℹ️'}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>{r.text}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.time}</p>
                  </div>
                  <Badge label={r.variant === 'success' ? 'Paid' : r.variant === 'warning' ? 'Alert' : 'Info'} variant={r.variant || 'neutral'} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No platform activity recorded yet.
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Fee Status Breakdown" />
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No fee transaction breakdown available.
            </div>
          )}
        </Card>
      </div>
    </Section>
  );
}

/* ════════════════════════════════════════════
   MANAGE COURSES
════════════════════════════════════════════ */
export function AdminManageCourses() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.getAdminCourses()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        setCourses(data);
      })
      .catch(() => {});
  }, []);

  const filtered = courses.filter(c => (c.name || '').toLowerCase().includes(search.toLowerCase()) || (c.code || '').toLowerCase().includes(search.toLowerCase()));

  const cols = [
    { key: 'code', label: 'Code', render: v => <Badge label={v} variant="active" /> },
    { key: 'name', label: 'Course Name' },
    { key: 'instructor_name', label: 'Instructor', render: (v, r) => v || r.instructor || '—' },
    { key: 'students_count', label: 'Students', render: (v, r) => v || r.students || 0 },
    { key: 'is_active', label: 'Status', render: v => <Badge label={v ? 'Active' : 'Inactive'} variant={v ? 'active' : 'inactive'} dot /> },
  ];

  return (
    <Section>
      <PageHeader title="Manage Courses" subtitle="Create, edit and deactivate courses."
        action={<Button icon="+" onClick={() => setShowModal(true)}>New Course</Button>} />
      <Card>
        <div style={{ marginBottom: 16 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search courses…" style={{ maxWidth: 300 }} />
        </div>
        <Table columns={cols} data={filtered} empty="No courses found." emptyAction={<Button onClick={() => setShowModal(true)}>Add Course</Button>} />
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Course"
        footer={<div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={() => setShowModal(false)}>Save Course</Button></div>}>
        <div className="form-grid">
          <Input label="Course Code" placeholder="e.g. BIO101" required />
          <Input label="Course Name" placeholder="e.g. Biology" required />
          <Input label="Credit Hours" type="number" placeholder="3" />
        </div>
      </Modal>
    </Section>
  );
}

/* ════════════════════════════════════════════
   MANAGE USERS (STUDENTS)
════════════════════════════════════════════ */
export function AdminManageUsers() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.getAdminStudents()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        setUsers(data);
      })
      .catch(() => {});
  }, []);

  const filtered = users.filter(u =>
    (tab === 'all' || (u.is_active ? 'active' : 'inactive') === tab) &&
    ((u.full_name || u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.enroll_id || u.enroll || '').toLowerCase().includes(search.toLowerCase()))
  );

  const cols = [
    { key: 'enroll_id', label: 'Enroll ID', render: (v, r) => v || r.enroll || '—' },
    { key: 'full_name', label: 'Name', render: (v, r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={v || r.name} size="sm" /><span>{v || r.name}</span>
      </div>
    )},
    { key: 'email', label: 'Email', render: (v, r) => <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{v || r.user?.email || '—'}</span> },
    { key: 'class_name', label: 'Class', render: (v, r) => v || r.class || '—' },
    { key: 'is_active', label: 'Status', render: v => <Badge label={v ? 'Active' : 'Inactive'} variant={v ? 'active' : 'inactive'} dot /> },
  ];

  return (
    <Section>
      <PageHeader title="Manage Students" subtitle="Create, view and manage student accounts."
        action={<Button icon="+" onClick={() => setShowModal(true)}>New Student</Button>} />
      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or ID…" style={{ maxWidth: 280 }} />
          <Tabs tabs={[{ value: 'all', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
            active={tab} onChange={setTab} />
        </div>
        <Table columns={cols} data={filtered} empty="No student records found." emptyAction={<Button onClick={() => setShowModal(true)}>Add Student</Button>} />
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Student Account"
        footer={<div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={() => setShowModal(false)}>Create Account</Button></div>}>
        <div className="form-grid">
          <Input label="Enrollment ID" placeholder="STU-001" required />
          <Input label="Full Name" placeholder="Student Name" required />
          <Input label="Email" placeholder="student@school.edu" type="email" required />
          <Input label="Class" placeholder="Class XI-A" />
          <Input label="Initial Password" type="password" required className="form-col-span" />
        </div>
      </Modal>
    </Section>
  );
}

/* ════════════════════════════════════════════
   MANAGE STAFF
════════════════════════════════════════════ */
export function AdminManageStaff() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    api.getAdminStaff()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        setStaff(data);
      })
      .catch(() => {});
  }, []);

  const filtered = staff.filter(s => (s.name || s.full_name || '').toLowerCase().includes(search.toLowerCase()));

  const cols = [
    { key: 'full_name', label: 'Name', render: (v, r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={v || r.name} size="sm" color="#a855f7" /><span>{v || r.name}</span>
      </div>
    )},
    { key: 'email', label: 'Email', render: (v, r) => <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{v || r.user?.email || '—'}</span> },
    { key: 'department', label: 'Department', render: (v, r) => v || r.dept || '—' },
    { key: 'status', label: 'Status', render: v => <Badge label={v || 'Active'} variant="active" dot /> },
  ];

  return (
    <Section>
      <PageHeader title="Manage Staff" subtitle="Create and manage faculty accounts."
        action={<Button icon="+" onClick={() => setShowModal(true)}>New Staff</Button>} />
      <Card>
        <div style={{ marginBottom: 16 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search staff…" style={{ maxWidth: 280 }} />
        </div>
        <Table columns={cols} data={filtered} empty="No faculty records found." />
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Staff Account"
        footer={<div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={() => setShowModal(false)}>Create Account</Button></div>}>
        <div className="form-grid">
          <Input label="Full Name" placeholder="Faculty Name" required />
          <Input label="Email" placeholder="staff@school.edu" type="email" required />
          <Input label="Department" placeholder="Department" required />
          <Input label="Password" type="password" required />
        </div>
      </Modal>
    </Section>
  );
}

/* ════════════════════════════════════════════
   EVENTS
════════════════════════════════════════════ */
export function AdminEvents() {
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);

  const cols = [
    { key: 'title', label: 'Event Title' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'location', label: 'Location' },
    { key: 'audience', label: 'Audience', render: v => <Badge label={v || 'All'} variant="info" /> },
  ];

  return (
    <Section>
      <PageHeader title="Events" subtitle="Create and publish campus events."
        action={<Button icon="+" onClick={() => setShowModal(true)}>New Event</Button>} />
      <Card><Table columns={cols} data={events} empty="No scheduled events." /></Card>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Event"
        footer={<div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={() => setShowModal(false)}>Publish</Button></div>}>
        <div className="form-grid">
          <Input label="Title" placeholder="Event title" required className="form-col-span" />
          <Input label="Date" type="date" required />
          <Input label="Time" type="time" />
          <Input label="Location" placeholder="e.g. Auditorium" className="form-col-span" />
          <Select label="Target Audience" className="form-col-span"><option>All</option><option>Students</option><option>Staff</option></Select>
          <Textarea label="Description" rows={3} className="form-col-span" />
        </div>
      </Modal>
    </Section>
  );
}

/* ── Communication ── */
function MessagePage({ title, subtitle, recipientOptions }) {
  const [sent, setSent] = useState(false);
  const [log, setLog] = useState([]);

  const cols = [
    { key: 'recipient', label: 'Recipient' },
    { key: 'subject', label: 'Subject' },
    { key: 'time', label: 'Sent At', render: v => <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{v}</span> },
  ];

  return (
    <Section>
      <PageHeader title={title} subtitle={subtitle} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
        <Card>
          <CardHeader title="Compose Message" />
          {sent && <div style={{ padding: '10px 14px', background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: 13, marginBottom: 16 }}>✓ Message sent!</div>}
          <form className="form-grid form-grid--1" onSubmit={e => { e.preventDefault(); setSent(true); setTimeout(() => setSent(false), 3000); }}>
            <Select label="Recipient" required>
              {recipientOptions.map(o => <option key={o}>{o}</option>)}
            </Select>
            <Input label="Subject" placeholder="Message subject" required />
            <Textarea label="Message" rows={5} required />
            <Button type="submit" icon="📨">Send Message</Button>
          </form>
        </Card>
        <Card>
          <CardHeader title="Sent Messages" />
          <Table columns={cols} data={log} empty="No messages sent yet." />
        </Card>
      </div>
    </Section>
  );
}

export function AdminMessageUsers() {
  return <MessagePage title="Message Students" subtitle="Send announcements or alerts to students." recipientOptions={['All Students']} />;
}

export function AdminMessageStaff() {
  return <MessagePage title="Message Staff" subtitle="Send announcements to faculty." recipientOptions={['All Staff']} />;
}

/* ════════════════════════════════════════════
   REPORTS
════════════════════════════════════════════ */
export function AdminStaffReports() {
  const [data, setData] = useState([]);
  const cols = [
    { key: 'name', label: 'Staff Name', render: (v) => <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={v} size="sm" color="#a855f7" /><span>{v}</span></div> },
    { key: 'att', label: 'Attendance', render: v => <ProgressBar value={v || 0} color={(v || 0) >= 90 ? 'success' : 'warning'} size="sm" /> },
    { key: 'courses', label: 'Courses' },
    { key: 'sessions', label: 'Sessions' },
  ];

  return (
    <Section>
      <PageHeader title="Staff Reports" subtitle="Attendance and performance overview for all staff." />
      <Card><Table columns={cols} data={data} empty="No faculty reports generated yet." /></Card>
    </Section>
  );
}

export function AdminStudentReports() {
  const [data, setData] = useState([]);
  const cols = [
    { key: 'name', label: 'Student', render: v => <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={v} size="sm" /><span>{v}</span></div> },
    { key: 'enroll', label: 'Enroll ID' },
    { key: 'class', label: 'Class' },
    { key: 'att', label: 'Attendance' },
    { key: 'gpa', label: 'GPA' },
  ];

  return (
    <Section>
      <PageHeader title="Student Reports" subtitle="Academic and attendance reports for all students." />
      <Card><Table columns={cols} data={data} empty="No student reports generated yet." /></Card>
    </Section>
  );
}

export function AdminCourseReports() {
  const [data, setData] = useState([]);
  const cols = [
    { key: 'code', label: 'Code', render: v => <Badge label={v} variant="info" /> },
    { key: 'name', label: 'Course' },
    { key: 'students', label: 'Students' },
    { key: 'materials', label: 'Materials' },
    { key: 'sessions', label: 'Sessions' },
  ];

  return (
    <Section>
      <PageHeader title="Course Reports" subtitle="Analytics for all active courses." />
      <Card><Table columns={cols} data={data} empty="No course analytics recorded." /></Card>
    </Section>
  );
}

/* ════════════════════════════════════════════
   PAYMENTS
════════════════════════════════════════════ */
export function AdminPayments() {
  const [showModal, setShowModal] = useState(false);
  const [txns, setTxns] = useState([]);

  const cols = [
    { key: 'student_name', label: 'Student', render: (v, r) => v || r.student || '—' },
    { key: 'enroll_id', label: 'Enroll ID', render: (v, r) => v || r.enroll || '—' },
    { key: 'amount', label: 'Amount', render: v => `₹${v}` },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status', render: v => <Badge label={v || 'Paid'} variant={v === 'Paid' ? 'paid' : 'pending'} dot /> },
  ];

  return (
    <Section>
      <PageHeader title="Payment Handling" subtitle="View, record and manage student fee payments."
        action={<Button icon="+" onClick={() => setShowModal(true)}>Record Payment</Button>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
        <StatCard icon="payment" label="Total Collected" value="₹0" color="success" />
        <StatCard icon="clock" label="Outstanding" value="₹0" color="warning" />
        <StatCard icon="alert" label="Overdue Count" value="0" color="danger" />
      </div>
      <Card>
        <Table columns={cols} data={txns} empty="No transactions found." />
      </Card>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Record Payment"
        footer={<div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={() => setShowModal(false)}>Save</Button></div>}>
        <div className="form-grid">
          <Input label="Student Enroll ID" placeholder="STU-001" required />
          <Input label="Amount (₹)" type="number" placeholder="25000" required />
          <Input label="Description" placeholder="Term Fee" className="form-col-span" />
        </div>
      </Modal>
    </Section>
  );
}
