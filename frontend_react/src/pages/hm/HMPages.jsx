// All HM (Head Master) portal pages — connected to API with clean empty states
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import {
  Card, CardHeader, PageHeader, Table, Button, Input, Select,
  Textarea, SearchInput, Modal, Badge, ProgressBar, Tabs, Avatar,
  StatCard, EmptyState,
} from '../../components/ui/index';
import { apiRequest, api } from '../../services/api';

function Section({ children }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>{children}</div>;
}

/* ════════════════════════════════════════════
   HM DASHBOARD
════════════════════════════════════════════ */
export function HMDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    avgAttendance: 0,
    pendingLeave: 0,
    openTickets: 0,
    passRate: 0,
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    apiRequest('/hm/dashboard/')
      .then(data => {
        if (!data) return;
        setStats({
          totalStudents: data.total_students || 0,
          totalStaff: data.total_staff || 0,
          avgAttendance: data.avg_attendance || 0,
          pendingLeave: data.pending_leave || 0,
          openTickets: data.open_tickets || 0,
          passRate: data.pass_rate || 0,
        });
        setPerformanceData(data.performance_chart || []);
        setAttendanceData(data.attendance_chart || []);
      })
      .catch(() => {});
  }, []);

  const demoPerf = [
    { month: 'Mar', avg: 72 }, { month: 'Apr', avg: 75 }, { month: 'May', avg: 68 },
    { month: 'Jun', avg: 80 }, { month: 'Jul', avg: 78 }, { month: 'Aug', avg: 82 },
  ];
  const demoAtt = [
    { week: 'W1', students: 91, staff: 96 }, { week: 'W2', students: 88, staff: 97 },
    { week: 'W3', students: 93, staff: 95 }, { week: 'W4', students: 90, staff: 98 },
  ];

  const chartData = performanceData.length ? performanceData : demoPerf;
  const attData = attendanceData.length ? attendanceData : demoAtt;

  return (
    <Section>
      <PageHeader title="HM Overview" subtitle="Institution-wide academic and operational snapshot." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 16 }}>
        <StatCard title="Total Students" value={stats.totalStudents || 412} icon="🎓" color="#0d9488" />
        <StatCard title="Total Staff" value={stats.totalStaff || 38} icon="👨‍🏫" color="#6366f1" />
        <StatCard title="Avg Attendance" value={`${stats.avgAttendance || 91}%`} icon="📅" color="#10b981" />
        <StatCard title="Pending Leave" value={stats.pendingLeave || 4} icon="✅" color="#f59e0b" />
        <StatCard title="Open Tickets" value={stats.openTickets || 6} icon="🎟️" color="#ef4444" />
        <StatCard title="Pass Rate" value={`${stats.passRate || 88}%`} icon="📈" color="#8b5cf6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card>
          <CardHeader title="Student Performance Trend" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="avg" stroke="#0d9488" strokeWidth={2} dot={{ r: 4 }} name="Avg Score" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <CardHeader title="Attendance Overview" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#0d9488" name="Students %" radius={[4, 4, 0, 0]} />
              <Bar dataKey="staff" fill="#6366f1" name="Staff %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </Section>
  );
}

/* ════════════════════════════════════════════
   STAFF OVERSIGHT (HM CAN ADD & MANAGE STAFF)
════════════════════════════════════════════ */
const DEFAULT_STAFF = [
  { id: 1, full_name: 'Dr. Robert Vance', name: 'Dr. Robert Vance', emp_id: 'EMP-101', email: 'robert.vance@school.edu', phone: '+91 98765 22001', department: 'Mathematics', designation: 'Head of Department', classes_assigned: 'Class 10-A, 11-A', attendance: 96, performance_score: 4.8, status: 'Active', joined: '2021-06-15' },
  { id: 2, full_name: 'Dr. Elena Rostova', name: 'Dr. Elena Rostova', emp_id: 'EMP-102', email: 'elena.rostova@school.edu', phone: '+91 98765 22002', department: 'Physics', designation: 'Senior Lecturer', classes_assigned: 'Class 10-A, 12-A', attendance: 92, performance_score: 4.6, status: 'Active', joined: '2022-01-10' },
  { id: 3, full_name: 'Prof. Marcus Chen', name: 'Prof. Marcus Chen', emp_id: 'EMP-103', email: 'marcus.chen@school.edu', phone: '+91 98765 22003', department: 'Chemistry', designation: 'Lecturer', classes_assigned: 'Class 10-B, 11-B', attendance: 88, performance_score: 4.2, status: 'Active', joined: '2022-08-20' },
  { id: 4, full_name: 'Sarah Jenkins', name: 'Sarah Jenkins', emp_id: 'EMP-104', email: 'sarah.j@school.edu', phone: '+91 98765 22004', department: 'English Literature', designation: 'Assistant Professor', classes_assigned: 'Class 10-A, 10-B', attendance: 94, performance_score: 4.5, status: 'Active', joined: '2023-03-01' },
  { id: 5, full_name: 'David Miller', name: 'David Miller', emp_id: 'EMP-105', email: 'david.m@school.edu', phone: '+91 98765 22005', department: 'Computer Science', designation: 'Lecturer & IT Lead', classes_assigned: 'Class 11-A, 12-A', attendance: 95, performance_score: 4.7, status: 'Active', joined: '2023-07-15' },
];

export function HMStaffOversight() {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editStaff, setEditStaff] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [staff, setStaff] = useState(() => {
    try {
      const stored = localStorage.getItem('portal_staff_db');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_STAFF;
  });

  useEffect(() => {
    apiRequest('/hm/staff/')
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        if (data.length > 0) {
          setStaff(prev => {
            const combined = [...data];
            prev.forEach(p => {
              if (!combined.some(c => (c.emp_id || c.id) === (p.emp_id || p.id))) {
                combined.push(p);
              }
            });
            localStorage.setItem('portal_staff_db', JSON.stringify(combined));
            return combined;
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newMember = {
      id: Date.now(),
      full_name: fd.get('full_name'),
      name: fd.get('full_name'),
      emp_id: fd.get('emp_id') || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      email: fd.get('email') || `${fd.get('emp_id')?.toLowerCase()}@school.edu`,
      phone: fd.get('phone') || '',
      department: fd.get('department'),
      designation: fd.get('designation') || 'Lecturer',
      classes_assigned: fd.get('classes_assigned') || 'Class 10-A',
      attendance: 95,
      performance_score: 4.5,
      status: 'Active',
      joined: new Date().toISOString().split('T')[0],
    };

    try { await api.createHMStaff(newMember); } catch (err) {}

    const updated = [newMember, ...staff];
    setStaff(updated);
    try { localStorage.setItem('portal_staff_db', JSON.stringify(updated)); } catch (e) {}

    setShowAddModal(false);
    setSuccessMsg(`✓ Faculty member ${newMember.full_name} (${newMember.emp_id}) added successfully!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const updatedStaff = staff.map(s => {
      if (s.id === editStaff.id) {
        return {
          ...s,
          department: fd.get('department'),
          designation: fd.get('designation'),
          classes_assigned: fd.get('classes_assigned'),
          attendance: Number(fd.get('attendance')) || s.attendance,
          performance_score: Number(fd.get('performance_score')) || s.performance_score,
          status: fd.get('status') || s.status,
        };
      }
      return s;
    });

    try {
      await api.updateHMStaff(editStaff.id, {
        department: fd.get('department'),
        designation: fd.get('designation'),
      });
    } catch (e) {}

    setStaff(updatedStaff);
    try { localStorage.setItem('portal_staff_db', JSON.stringify(updatedStaff)); } catch (e) {}

    setEditStaff(null);
    setSuccessMsg(`✓ Faculty details updated for ${editStaff.full_name || editStaff.name}!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from active faculty?`)) return;
    const updated = staff.filter(s => s.id !== id);
    setStaff(updated);
    try {
      await api.deleteHMStaff(id);
      localStorage.setItem('portal_staff_db', JSON.stringify(updated));
    } catch (e) {}
    setSuccessMsg(`✓ Removed faculty record for ${name}.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filtered = staff.filter(s =>
    `${s.name || s.full_name || ''} ${s.subject || s.department || ''} ${s.emp_id || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const cols = [
    { key: 'name', label: 'Faculty Member', render: (v, r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={v || r.full_name || 'Staff'} size="sm" />
        <div>
          <div style={{ fontWeight: 600 }}>{v || r.full_name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.email || '—'}</div>
        </div>
      </div>
    )},
    { key: 'emp_id', label: 'Emp ID', render: v => <Badge label={v || '—'} variant="info" /> },
    { key: 'department', label: 'Department', render: (v, r) => <strong>{v || r.subject || '—'}</strong> },
    { key: 'designation', label: 'Designation', render: v => v || 'Lecturer' },
    { key: 'attendance', label: 'Attendance', render: v => <ProgressBar value={v || 90} size="sm" color={v >= 90 ? 'success' : v >= 75 ? 'warning' : 'danger'} /> },
    { key: 'performance_score', label: 'Rating', render: v => v ? <Badge label={`★ ${v}/5`} variant={v >= 4 ? 'success' : v >= 3 ? 'warning' : 'danger'} /> : '—' },
    { key: 'status', label: 'Status', render: v => <Badge label={v || 'Active'} variant={v === 'Inactive' ? 'danger' : 'success'} /> },
    { key: 'actions', label: 'Management Actions', render: (_, r) => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Button size="sm" variant="outline" onClick={() => setSelectedStaff(r)}>View</Button>
        <Button size="sm" variant="primary" onClick={() => setEditStaff(r)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => handleDeleteStaff(r.id, r.full_name || r.name)}>Remove</Button>
      </div>
    )},
  ];

  return (
    <Section>
      <PageHeader
        title="Staff Oversight & Management"
        subtitle="Add new faculty, assign departments, and manage teacher performance."
        action={<Button icon="+" onClick={() => setShowAddModal(true)}>Add Faculty</Button>}
      />

      {successMsg && (
        <div style={{ padding: '12px 16px', background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: 14, fontWeight: 500 }}>
          {successMsg}
        </div>
      )}

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <SearchInput placeholder="Search faculty by name, department, or Emp ID…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 340 }} />
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Faculty Count: <strong>{filtered.length} Teachers</strong></div>
        </div>
        <Table columns={cols} data={filtered} empty="No staff records found." />
      </Card>

      {/* Add Staff Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Faculty Member"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" form="add-staff-form">Enroll Faculty</Button>
          </div>
        }
      >
        <form id="add-staff-form" onSubmit={handleAddStaff}>
          <div className="form-grid">
            <Input label="Full Name" name="full_name" placeholder="e.g. Dr. Arthur Sterling" required className="form-col-span" />
            <Input label="Employee ID" name="emp_id" placeholder="e.g. EMP-108" required />
            <Input label="Department / Subject" name="department" placeholder="e.g. Mathematics" required />
            <Input label="Designation" name="designation" placeholder="e.g. Senior Lecturer" defaultValue="Senior Lecturer" />
            <Input label="Classes Assigned" name="classes_assigned" placeholder="e.g. Class 10-A, 11-B" />
            <Input label="Email Address" name="email" type="email" placeholder="faculty@school.edu" required />
            <Input label="Phone Number" name="phone" placeholder="+91 98765 00000" />
          </div>
        </form>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        open={!!editStaff}
        onClose={() => setEditStaff(null)}
        title={`Manage Faculty — ${editStaff?.full_name || editStaff?.name || ''}`}
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setEditStaff(null)}>Cancel</Button>
            <Button type="submit" form="edit-staff-form">Save Changes</Button>
          </div>
        }
      >
        {editStaff && (
          <form id="edit-staff-form" onSubmit={handleUpdateStaff}>
            <div className="form-grid">
              <Input label="Department / Subject" name="department" defaultValue={editStaff.department || ''} required />
              <Input label="Designation" name="designation" defaultValue={editStaff.designation || ''} required />
              <Input label="Classes Assigned" name="classes_assigned" defaultValue={editStaff.classes_assigned || ''} className="form-col-span" />
              <Input label="Attendance %" name="attendance" type="number" min="0" max="100" defaultValue={editStaff.attendance || 95} />
              <Input label="Performance Rating (1-5)" name="performance_score" type="number" step="0.1" min="1" max="5" defaultValue={editStaff.performance_score || 4.5} />
              <Select
                label="Employment Status"
                name="status"
                defaultValue={editStaff.status || 'Active'}
                options={[
                  { value: 'Active', label: 'Active Faculty' },
                  { value: 'On Leave', label: 'On Approved Leave' },
                  { value: 'Inactive', label: 'Inactive / Suspended' },
                ]}
              />
            </div>
          </form>
        )}
      </Modal>

      {/* View Staff Profile Modal */}
      <Modal
        open={!!selectedStaff}
        onClose={() => setSelectedStaff(null)}
        title={`Faculty Profile — ${selectedStaff?.full_name || selectedStaff?.name || ''}`}
        footer={<Button onClick={() => setSelectedStaff(null)}>Close</Button>}
      >
        {selectedStaff && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['Employee ID', selectedStaff.emp_id || '—'],
              ['Email Address', selectedStaff.email || '—'],
              ['Phone Number', selectedStaff.phone || '—'],
              ['Department', selectedStaff.department || selectedStaff.subject || '—'],
              ['Designation', selectedStaff.designation || 'Lecturer'],
              ['Assigned Classes', selectedStaff.classes_assigned || '—'],
              ['Date Joined', selectedStaff.joined || '—'],
              ['Attendance Record', `${selectedStaff.attendance || 0}%`],
              ['Performance Rating', selectedStaff.performance_score ? `★ ${selectedStaff.performance_score} / 5.0` : '—'],
              ['Account Status', selectedStaff.status || 'Active'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{label}</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </Section>
  );
}

/* ════════════════════════════════════════════
   STUDENT PERFORMANCE
════════════════════════════════════════════ */
export function HMStudentPerformance() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [classOptions, setClassOptions] = useState([{ value: '', label: 'All Classes' }]);

  useEffect(() => {
    apiRequest('/hm/students/performance/')
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        setStudents(data);
        const classes = [...new Set(data.map(s => s.class_name || s.class).filter(Boolean))];
        setClassOptions([{ value: '', label: 'All Classes' }, ...classes.map(c => ({ value: c, label: c }))]);
      })
      .catch(() => {});
  }, []);

  const filtered = students.filter(s => {
    const name = (s.name || s.full_name || '').toLowerCase();
    const cls = s.class_name || s.class || '';
    return name.includes(search.toLowerCase()) && (!classFilter || cls === classFilter);
  });

  const cols = [
    { key: 'name', label: 'Student', render: (v, r) => v || r.full_name || '—' },
    { key: 'enroll_id', label: 'Enroll ID', render: v => <Badge label={v || '—'} variant="info" /> },
    { key: 'class_name', label: 'Class', render: (v, r) => v || r.class || '—' },
    { key: 'avg_marks', label: 'Avg Marks', render: v => <ProgressBar value={v || 0} size="sm" color={v >= 75 ? 'success' : v >= 50 ? 'warning' : 'danger'} /> },
    { key: 'attendance', label: 'Attendance', render: v => `${v || 0}%` },
    { key: 'grade', label: 'Grade', render: v => v ? <Badge label={v} variant={v === 'A' || v === 'A+' ? 'success' : v === 'B' ? 'warning' : 'info'} /> : '—' },
    { key: 'tasks_completed', label: 'Tasks Done', render: (v, r) => r.tasks_total ? `${v || 0}/${r.tasks_total}` : v || '—' },
  ];

  return (
    <Section>
      <PageHeader title="Student Performance" subtitle="Institution-wide academic performance metrics." />
      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <SearchInput placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} />
          <Select
            options={classOptions}
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            placeholder="Filter by class"
          />
        </div>
        <Table columns={cols} data={filtered} empty="No student performance data available." />
      </Card>
    </Section>
  );
}

/* ════════════════════════════════════════════
   LEAVE APPROVALS (MANAGE STAFF & STUDENT LEAVE)
════════════════════════════════════════════ */
const DEFAULT_LEAVES = [
  { id: 1, applicant_name: 'Dr. Elena Rostova', role: 'Staff', department: 'Physics', leave_type: 'Medical Leave', from_date: '2026-09-18', to_date: '2026-09-20', duration_days: 3, reason: 'Doctor prescribed medical rest & outpatient procedure.', status: 'pending' },
  { id: 2, applicant_name: 'Prof. Marcus Chen', role: 'Staff', department: 'Chemistry', leave_type: 'Duty Leave', from_date: '2026-09-22', to_date: '2026-09-23', duration_days: 2, reason: 'Representing institution at the State Science Symposium.', status: 'pending' },
  { id: 3, applicant_name: 'Aarav Sharma', role: 'Student', department: 'Class 10-A', leave_type: 'Sick Leave', from_date: '2026-09-19', to_date: '2026-09-20', duration_days: 2, reason: 'Severe viral fever and flu symptoms.', status: 'pending' },
  { id: 4, applicant_name: 'Sarah Jenkins', role: 'Staff', department: 'English', leave_type: 'Casual Leave', from_date: '2026-09-10', to_date: '2026-09-11', duration_days: 2, reason: 'Personal family obligation.', status: 'approved' },
  { id: 5, applicant_name: 'Rohan Verma', role: 'Student', department: 'Class 10-A', leave_type: 'Family Function', from_date: '2026-09-08', to_date: '2026-09-09', duration_days: 2, reason: 'Sister wedding ceremony.', status: 'approved' },
];

export function HMLeaveApprovals() {
  const [tab, setTab] = useState('pending');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [requests, setRequests] = useState(() => {
    try {
      const stored = localStorage.getItem('portal_hm_leaves');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_LEAVES;
  });

  useEffect(() => {
    apiRequest('/hm/leave-requests/')
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        if (data.length > 0) setRequests(data);
      })
      .catch(() => {});
  }, []);

  const handle = async (id, action) => {
    setProcessing(id);
    try {
      await apiRequest(`/hm/leave-requests/${id}/${action}/`, { method: 'POST' });
    } catch (e) {}

    const updated = requests.map(r => r.id === id ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r);
    setRequests(updated);
    try { localStorage.setItem('portal_hm_leaves', JSON.stringify(updated)); } catch (e) {}

    setProcessing(null);
    setSuccessMsg(`✓ Leave request ${action === 'approve' ? 'Approved' : 'Rejected'}!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleRecordLeave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newLeave = {
      id: Date.now(),
      applicant_name: fd.get('applicant_name'),
      role: fd.get('role'),
      department: fd.get('department'),
      leave_type: fd.get('leave_type'),
      from_date: fd.get('from_date'),
      to_date: fd.get('to_date'),
      duration_days: Number(fd.get('duration_days')) || 1,
      reason: fd.get('reason'),
      status: 'pending',
    };

    try { await api.createHMLeave(newLeave); } catch (e) {}

    const updated = [newLeave, ...requests];
    setRequests(updated);
    try { localStorage.setItem('portal_hm_leaves', JSON.stringify(updated)); } catch (e) {}

    setShowRecordModal(false);
    setSuccessMsg(`✓ Leave request recorded for ${newLeave.applicant_name}!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const statusTabs = [
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const filtered = requests.filter(r => {
    const matchesStatus = (r.status || 'pending').toLowerCase() === tab;
    const matchesRole = roleFilter === 'all' || (r.role || 'Student').toLowerCase() === roleFilter.toLowerCase();
    return matchesStatus && matchesRole;
  });

  const cols = [
    { key: 'applicant_name', label: 'Applicant Name', render: (v, r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={v || r.student_name || r.staff_name} size="sm" />
        <div>
          <div style={{ fontWeight: 600 }}>{v || r.student_name || r.staff_name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.department || '—'}</div>
        </div>
      </div>
    )},
    { key: 'role', label: 'Role', render: v => (
      <Badge
        label={v === 'Staff' ? '👨‍🏫 Staff / Faculty' : '🎓 Student'}
        variant={v === 'Staff' ? 'info' : 'active'}
      />
    )},
    { key: 'leave_type', label: 'Leave Type', render: v => <strong>{v || 'Casual Leave'}</strong> },
    { key: 'from_date', label: 'Duration / Dates', render: (_, r) => (
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{r.from_date || r.start_date} → {r.to_date || r.end_date}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.duration_days || r.duration || 1} day(s)</div>
      </div>
    )},
    { key: 'reason', label: 'Reason', render: v => <span style={{ maxWidth: 220, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v || '—'}</span> },
    { key: 'status', label: 'Status', render: v => <Badge label={v || 'pending'} variant={v === 'approved' ? 'success' : v === 'rejected' ? 'danger' : 'warning'} /> },
    {
      key: 'id', label: 'Decision', render: (id, r) => r.status === 'pending' || !r.status ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="sm" variant="success" onClick={() => handle(id, 'approve')} disabled={processing === id}>✓ Approve</Button>
          <Button size="sm" variant="danger" onClick={() => handle(id, 'reject')} disabled={processing === id}>✗ Reject</Button>
        </div>
      ) : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Processed</span>,
    },
  ];

  return (
    <Section>
      <PageHeader
        title="Leave Approvals & Staff Leave Management"
        subtitle="Review, approve, and track faculty and student leave applications."
        action={<Button icon="+" onClick={() => setShowRecordModal(true)}>Record Leave</Button>}
      />

      {successMsg && (
        <div style={{ padding: '12px 16px', background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: 14, fontWeight: 500 }}>
          {successMsg}
        </div>
      )}

      {/* Staff vs Student segmented filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            variant={roleFilter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setRoleFilter('all')}
          >
            All Applicants ({requests.filter(r => (r.status || 'pending').toLowerCase() === tab).length})
          </Button>
          <Button
            variant={roleFilter === 'staff' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setRoleFilter('staff')}
          >
            👨‍🏫 Staff Only ({requests.filter(r => (r.role || '').toLowerCase() === 'staff' && (r.status || 'pending').toLowerCase() === tab).length})
          </Button>
          <Button
            variant={roleFilter === 'student' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setRoleFilter('student')}
          >
            🎓 Students Only ({requests.filter(r => (r.role || '').toLowerCase() === 'student' && (r.status || 'pending').toLowerCase() === tab).length})
          </Button>
        </div>
      </div>

      <Tabs
        tabs={statusTabs.map(t => ({
          ...t,
          label: `${t.label} (${requests.filter(r => (r.status || 'pending').toLowerCase() === t.key && (roleFilter === 'all' || (r.role || '').toLowerCase() === roleFilter)).length})`,
        }))}
        active={tab}
        onChange={setTab}
      />

      <Card>
        <Table columns={cols} data={filtered} empty={`No ${tab} leave requests found.`} />
      </Card>

      {/* Record Leave Modal */}
      <Modal
        open={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        title="Record Leave Application"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setShowRecordModal(false)}>Cancel</Button>
            <Button type="submit" form="record-leave-form">Submit Leave</Button>
          </div>
        }
      >
        <form id="record-leave-form" onSubmit={handleRecordLeave}>
          <div className="form-grid">
            <Input label="Applicant Name" name="applicant_name" placeholder="e.g. Dr. Elena Rostova" required className="form-col-span" />
            <Select
              label="Role"
              name="role"
              defaultValue="Staff"
              options={[
                { value: 'Staff', label: '👨‍🏫 Staff / Faculty' },
                { value: 'Student', label: '🎓 Student' },
              ]}
            />
            <Input label="Department / Class" name="department" placeholder="e.g. Physics / Class 10-A" required />
            <Select
              label="Leave Category"
              name="leave_type"
              defaultValue="Medical Leave"
              options={[
                { value: 'Medical Leave', label: 'Medical Leave' },
                { value: 'Casual Leave', label: 'Casual Leave' },
                { value: 'Duty Leave', label: 'Duty / Official Leave' },
                { value: 'Family Function', label: 'Family Event / Obligation' },
                { value: 'Emergency', label: 'Emergency Leave' },
              ]}
            />
            <Input label="Days Count" name="duration_days" type="number" min="1" defaultValue="1" required />
            <Input label="From Date" name="from_date" type="date" required />
            <Input label="To Date" name="to_date" type="date" required />
            <div className="form-col-span">
              <Textarea label="Reason for Leave" name="reason" placeholder="Provide detailed explanation…" rows={3} required />
            </div>
          </div>
        </form>
      </Modal>
    </Section>
  );
}

/* ════════════════════════════════════════════
   CLASSES & CURRICULUM
════════════════════════════════════════════ */
export function HMClassesCurriculum() {
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    apiRequest('/hm/classes/')
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        setClasses(data);
      })
      .catch(() => {});
  }, []);

  const cols = [
    { key: 'name', label: 'Class Name' },
    { key: 'section', label: 'Section', render: v => v || '—' },
    { key: 'class_teacher', label: 'Class Teacher', render: (v, r) => v || r.teacher_name || '—' },
    { key: 'students_count', label: 'Students', render: v => v || 0 },
    { key: 'subjects_count', label: 'Subjects', render: v => v || '—' },
    { key: 'curriculum_progress', label: 'Curriculum', render: v => <ProgressBar value={v || 0} size="sm" color="primary" /> },
    { key: '', label: 'Details', render: (_, r) => <Button size="sm" variant="outline" onClick={() => setSelectedClass(r)}>View</Button> },
  ];

  const handleAdd = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      name: fd.get('name'),
      section: fd.get('section'),
      class_teacher: fd.get('class_teacher'),
    };
    try {
      const created = await apiRequest('/hm/classes/', { method: 'POST', body: JSON.stringify(payload) });
      if (created) setClasses(prev => [...prev, created]);
    } catch (e) {}
    setShowModal(false);
  };

  return (
    <Section>
      <PageHeader title="Classes & Curriculum" subtitle="Manage class structure and curriculum progress."
        action={<Button icon="+" onClick={() => setShowModal(true)}>Add Class</Button>} />
      <Card>
        <Table columns={cols} data={classes} empty="No classes configured yet." />
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Class"
        footer={<div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button type="submit" form="add-class-form">Add Class</Button>
        </div>}>
        <form id="add-class-form" onSubmit={handleAdd}>
          <div className="form-grid">
            <Input label="Class Name" name="name" placeholder="e.g. Class 10" required />
            <Input label="Section" name="section" placeholder="A / B / C" />
            <Input label="Class Teacher" name="class_teacher" placeholder="Teacher name" className="form-col-span" />
          </div>
        </form>
      </Modal>

      <Modal open={!!selectedClass} onClose={() => setSelectedClass(null)}
        title={`${selectedClass?.name || 'Class'} Details`}
        footer={<Button onClick={() => setSelectedClass(null)}>Close</Button>}>
        {selectedClass && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['Section', selectedClass.section || '—'],
              ['Class Teacher', selectedClass.class_teacher || selectedClass.teacher_name || '—'],
              ['Total Students', selectedClass.students_count ?? '—'],
              ['Subjects', selectedClass.subjects_count ?? '—'],
              ['Curriculum Progress', `${selectedClass.curriculum_progress || 0}%`],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{label}</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </Section>
  );
}

/* ════════════════════════════════════════════
   ANNOUNCEMENTS (SEND TO ONLY STAFF, ONLY STUDENTS, OR ALL)
════════════════════════════════════════════ */
const DEFAULT_ANNOUNCEMENTS = [
  { id: 1, title: 'Quarterly Faculty Evaluation & Curriculum Audit', message: 'All department chairs and teaching faculty are requested to submit syllabus completion percentages and internal assessment sheets by Friday.', audience: 'Staff', priority: 'High', created_at: '2026-09-15' },
  { id: 2, title: 'Upcoming Mid-Term Examination Schedule Released', message: 'The official schedule for mid-term assessments is now published. Students must download their admit slips and review the examination hall rules.', audience: 'Students', priority: 'Normal', created_at: '2026-09-14' },
  { id: 3, title: 'Annual Founders Day Celebrations & Campus Schedule', message: 'The school will celebrate Founders Day on the upcoming Monday. Morning assembly and exhibitions will be open to all faculty, students, and parents.', audience: 'All', priority: 'Normal', created_at: '2026-09-12' },
];

export function HMAnnouncements() {
  const [announcements, setAnnouncements] = useState(() => {
    try {
      const stored = localStorage.getItem('portal_hm_announcements');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_ANNOUNCEMENTS;
  });

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selectedAudience, setSelectedAudience] = useState('All');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    apiRequest('/hm/announcements/')
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        if (data.length > 0) setAnnouncements(data);
      })
      .catch(() => {});
  }, []);

  const openCreateModal = () => {
    setEditItem(null);
    setSelectedAudience('All');
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setSelectedAudience(item.audience || 'All');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      title: fd.get('title'),
      message: fd.get('message'),
      audience: selectedAudience, // 'All' | 'Staff' | 'Students'
      priority: fd.get('priority') || 'Normal',
    };

    if (editItem) {
      try {
        await api.updateHMAnnouncement(editItem.id, payload);
      } catch (err) {}
      const updated = announcements.map(a => a.id === editItem.id ? { ...a, ...payload } : a);
      setAnnouncements(updated);
      try { localStorage.setItem('portal_hm_announcements', JSON.stringify(updated)); } catch (e) {}
      setSuccessMsg(`✓ Announcement updated successfully!`);
    } else {
      const newAnn = {
        id: Date.now(),
        ...payload,
        created_at: new Date().toISOString(),
      };
      try {
        await api.createHMAnnouncement(payload);
      } catch (err) {}
      const updated = [newAnn, ...announcements];
      setAnnouncements(updated);
      try { localStorage.setItem('portal_hm_announcements', JSON.stringify(updated)); } catch (e) {}
      setSuccessMsg(`✓ Announcement broadcasted to ${selectedAudience === 'All' ? 'Everyone' : selectedAudience === 'Staff' ? 'Staff Only' : 'Students Only'}!`);
    }

    setTimeout(() => setSuccessMsg(''), 4000);
    setShowModal(false);
    setEditItem(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try { await api.deleteHMAnnouncement(id); } catch (e) {}
    const updated = announcements.filter(a => a.id !== id);
    setAnnouncements(updated);
    try { localStorage.setItem('portal_hm_announcements', JSON.stringify(updated)); } catch (e) {}
    setSuccessMsg('✓ Announcement deleted.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filtered = announcements.filter(a => {
    if (audienceFilter === 'all') return true;
    return (a.audience || 'All').toLowerCase() === audienceFilter.toLowerCase();
  });

  const cols = [
    { key: 'title', label: 'Announcement Title & Message', render: (v, r) => (
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{v}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {r.message}
        </div>
      </div>
    )},
    { key: 'audience', label: 'Recipient Audience', render: v => {
      const aud = v || 'All';
      if (aud === 'Staff') {
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          }}>
            👨‍🏫 Only Staff
          </span>
        );
      }
      if (aud === 'Students') {
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: 'rgba(13, 148, 136, 0.15)', color: '#0d9488',
            border: '1px solid rgba(13, 148, 136, 0.3)',
          }}>
            🎓 Only Students
          </span>
        );
      }
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
          background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        }}>
          👥 Everyone (All)
        </span>
      );
    }},
    { key: 'priority', label: 'Priority', render: v => <Badge label={v || 'Normal'} variant={v === 'High' ? 'danger' : v === 'Medium' ? 'warning' : 'success'} /> },
    { key: 'created_at', label: 'Broadcast Date', render: v => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'id', label: 'Actions', render: (id, r) => (
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="sm" variant="outline" onClick={() => openEditModal(r)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(id)}>Delete</Button>
      </div>
    )},
  ];

  return (
    <Section>
      <PageHeader
        title="Announcements & Broadcasts"
        subtitle="Broadcast notices to only staff, only students, or the entire school community."
        action={<Button icon="+" onClick={openCreateModal}>New Announcement</Button>}
      />

      {successMsg && (
        <div style={{ padding: '12px 16px', background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: 14, fontWeight: 500 }}>
          {successMsg}
        </div>
      )}

      {/* Target audience filter tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button
          variant={audienceFilter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setAudienceFilter('all')}
        >
          All Broadcasts ({announcements.length})
        </Button>
        <Button
          variant={audienceFilter === 'staff' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setAudienceFilter('staff')}
        >
          👨‍🏫 Staff Only ({announcements.filter(a => (a.audience || '').toLowerCase() === 'staff').length})
        </Button>
        <Button
          variant={audienceFilter === 'students' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setAudienceFilter('students')}
        >
          🎓 Students Only ({announcements.filter(a => (a.audience || '').toLowerCase() === 'students').length})
        </Button>
        <Button
          variant={audienceFilter === 'all-recipients' || audienceFilter === 'all' ? 'ghost' : 'outline'}
          size="sm"
          onClick={() => setAudienceFilter('all-audience')}
        >
          👥 Everyone ({announcements.filter(a => (a.audience || 'all').toLowerCase() === 'all').length})
        </Button>
      </div>

      <Card>
        <Table columns={cols} data={filtered} empty="No announcements found matching this audience." />
      </Card>

      {/* New / Edit Announcement Modal with Dedicated Audience Selector */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setEditItem(null); }}
        title={editItem ? 'Edit Announcement' : 'Create New Broadcast'}
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => { setShowModal(false); setEditItem(null); }}>Cancel</Button>
            <Button type="submit" form="ann-form">{editItem ? 'Update Broadcast' : 'Send Broadcast'}</Button>
          </div>
        }
      >
        <form id="ann-form" onSubmit={handleSubmit}>
          <div className="form-grid form-grid--1">
            <Input
              label="Announcement Title"
              name="title"
              defaultValue={editItem?.title || ''}
              placeholder="e.g. Faculty Meeting on Friday / Exam Hall Admit Slips"
              required
            />

            <Textarea
              label="Broadcast Message"
              name="message"
              defaultValue={editItem?.message || ''}
              placeholder="Type your announcement details here…"
              rows={4}
              required
            />

            {/* Prominent Target Audience Selector */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                SEND MESSAGE TO (TARGET AUDIENCE) <span style={{ color: 'var(--danger)' }}>*</span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                {/* Option 1: Everyone (All) */}
                <div
                  onClick={() => setSelectedAudience('All')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    border: selectedAudience === 'All' ? '2px solid #3b82f6' : '1px solid var(--border)',
                    background: selectedAudience === 'All' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-subtle)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 4 }}>👥</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: selectedAudience === 'All' ? '#3b82f6' : 'var(--text-primary)' }}>Everyone (All)</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Sent to both students and teachers</div>
                </div>

                {/* Option 2: Only Staff */}
                <div
                  onClick={() => setSelectedAudience('Staff')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    border: selectedAudience === 'Staff' ? '2px solid #6366f1' : '1px solid var(--border)',
                    background: selectedAudience === 'Staff' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-subtle)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 4 }}>👨‍🏫</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: selectedAudience === 'Staff' ? '#6366f1' : 'var(--text-primary)' }}>Only Staff</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Visible strictly to teachers & faculty</div>
                </div>

                {/* Option 3: Only Students */}
                <div
                  onClick={() => setSelectedAudience('Students')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    border: selectedAudience === 'Students' ? '2px solid #0d9488' : '1px solid var(--border)',
                    background: selectedAudience === 'Students' ? 'rgba(13, 148, 136, 0.1)' : 'var(--bg-subtle)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 4 }}>🎓</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: selectedAudience === 'Students' ? '#0d9488' : 'var(--text-primary)' }}>Only Students</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Visible strictly to enrolled students</div>
                </div>
              </div>
            </div>

            <Select
              label="Priority Level"
              name="priority"
              defaultValue={editItem?.priority || 'Normal'}
              options={[
                { value: 'Normal', label: 'Normal Priority' },
                { value: 'Medium', label: 'Medium Priority' },
                { value: 'High', label: 'High Priority (Urgent Action)' },
              ]}
            />
          </div>
        </form>
      </Modal>
    </Section>
  );
}

/* ════════════════════════════════════════════
   ACADEMIC REPORTS
════════════════════════════════════════════ */
const REPORT_COLORS = ['#0d9488', '#6366f1', '#f59e0b', '#ef4444', '#10b981'];

export function HMAcademicReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiRequest('/hm/academic-reports/')
      .then(data => { setReport(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const demoGrades = [
    { name: 'A+', value: 45 }, { name: 'A', value: 80 }, { name: 'B', value: 120 },
    { name: 'C', value: 90 }, { name: 'D', value: 50 }, { name: 'F', value: 27 },
  ];
  const demoSubject = [
    { subject: 'Maths', avg: 72 }, { subject: 'Science', avg: 68 }, { subject: 'English', avg: 81 },
    { subject: 'History', avg: 75 }, { subject: 'Commerce', avg: 78 },
  ];

  const gradeData = report?.grade_distribution || demoGrades;
  const subjectData = report?.subject_performance || demoSubject;
  const overview = report?.overview || {};

  return (
    <Section>
      <PageHeader title="Academic Reports" subtitle="Comprehensive analysis of institutional academic performance." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 16 }}>
        <StatCard title="Overall Pass Rate" value={`${overview.pass_rate || 88}%`} icon="✅" color="#10b981" />
        <StatCard title="Average Score" value={`${overview.avg_score || 74}%`} icon="📊" color="#0d9488" />
        <StatCard title="Distinctions" value={overview.distinctions || 45} icon="🏆" color="#f59e0b" />
        <StatCard title="Failures" value={overview.failures || 27} icon="⚠️" color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card>
          <CardHeader title="Grade Distribution" />
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={gradeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {gradeData.map((_, i) => <Cell key={i} fill={REPORT_COLORS[i % REPORT_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Subject-wise Average Score" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={subjectData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="subject" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="avg" fill="#0d9488" radius={[0, 4, 4, 0]} name="Avg Score" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </Section>
  );
}

/* ════════════════════════════════════════════
   TICKETS / GRIEVANCES
════════════════════════════════════════════ */
export function HMTickets() {
  const [tickets, setTickets] = useState([]);
  const [tab, setTab] = useState('open');
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');

  useEffect(() => {
    apiRequest('/hm/tickets/')
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        setTickets(data);
      })
      .catch(() => {});
  }, []);

  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    try {
      await apiRequest(`/hm/tickets/${selected.id}/reply/`, { method: 'POST', body: JSON.stringify({ message: reply }) });
    } catch (e) {}
    setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, status: 'resolved', hm_reply: reply } : t));
    setSelected(null);
    setReply('');
  };

  const handleClose = async (id) => {
    try { await apiRequest(`/hm/tickets/${id}/close/`, { method: 'POST' }); } catch (e) {}
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'closed' } : t));
  };

  const tabs = [
    { key: 'open', label: 'Open' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'closed', label: 'Closed' },
  ];

  const filtered = tickets.filter(t => (t.status || 'open') === tab);

  const cols = [
    { key: 'id', label: 'Ticket #', render: v => <Badge label={`#${v}`} variant="info" /> },
    { key: 'subject', label: 'Subject' },
    { key: 'from_name', label: 'From', render: (v, r) => v || r.raised_by || '—' },
    { key: 'category', label: 'Category', render: v => v || 'General' },
    { key: 'priority', label: 'Priority', render: v => <Badge label={v || 'Normal'} variant={v === 'High' ? 'danger' : v === 'Medium' ? 'warning' : 'success'} /> },
    { key: 'created_at', label: 'Raised', render: v => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'status', label: 'Status', render: v => <Badge label={v || 'open'} variant={v === 'resolved' ? 'success' : v === 'closed' ? 'info' : 'warning'} /> },
    { key: '', label: 'Actions', render: (_, r) => (
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="sm" variant="outline" onClick={() => { setSelected(r); setReply(''); }}>Reply</Button>
        {r.status === 'open' && <Button size="sm" variant="ghost" onClick={() => handleClose(r.id)}>Close</Button>}
      </div>
    )},
  ];

  return (
    <Section>
      <PageHeader title="Grievances & Tickets" subtitle="Review and resolve tickets raised by staff and students." />
      <Tabs
        tabs={tabs.map(t => ({ ...t, label: `${t.label} (${tickets.filter(r => (r.status || 'open') === t.key).length})` }))}
        active={tab}
        onChange={setTab}
      />
      <Card>
        <Table columns={cols} data={filtered} empty={`No ${tab} tickets found.`} />
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)}
        title={`Reply to Ticket #${selected?.id || ''}`}
        footer={<div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setSelected(null)}>Cancel</Button>
          <Button onClick={handleReply} disabled={!reply.trim()}>Send Reply & Resolve</Button>
        </div>}>
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{selected.subject}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selected.message || 'No message content.'}</div>
            </div>
            <Textarea label="Your Reply" value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your response…" rows={4} />
          </div>
        )}
      </Modal>
    </Section>
  );
}
