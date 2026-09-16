// All Staff portal pages — connected to state with clean empty states
import { useState, useEffect } from 'react';
import {
  Card, CardHeader, PageHeader, Table, Button, Input, Select,
  Textarea, SearchInput, Modal, Badge, ProgressBar, Tabs, Avatar,
  EmptyState,
} from '../../components/ui/index';
import { api } from '../../services/api';

function Section({ children }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>{children}</div>;
}

/* ── VIEW COURSES ── */
export function StaffViewCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.getStaffCourses()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        setCourses(data);
      })
      .catch(() => {});
  }, []);

  const cols = [
    { key: 'code', label: 'Code', render: v => <Badge label={v} variant="info" /> },
    { key: 'name', label: 'Course Name' },
    { key: 'students_count', label: 'Students', render: (v, r) => v || r.students || 0 },
    { key: 'credit_hours', label: 'Credits', render: (v, r) => v || r.credits || 3 },
    { key: 'progress', label: 'Progress', render: v => <ProgressBar value={v || 0} color={(v || 0) >= 75 ? 'success' : 'warning'} size="sm" /> },
  ];

  return (
    <Section>
      <PageHeader title="My Courses" subtitle="All courses assigned to you this term." />
      <Card><Table columns={cols} data={courses} empty="No assigned courses found." /></Card>
    </Section>
  );
}

/* ── STUDY MATERIALS ── */
export function StaffStudyMaterials() {
  const [showModal, setShowModal] = useState(false);
  const [materials, setMaterials] = useState([]);

  const cols = [
    { key: 'title', label: 'Title' },
    { key: 'course_name', label: 'Course', render: (v, r) => v || r.course || '—' },
    { key: 'uploaded_at', label: 'Uploaded', render: v => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'file_size', label: 'Size', render: v => v || '—' },
    { key: 'download_count', label: 'Downloads', render: v => v || 0 },
  ];

  return (
    <Section>
      <PageHeader title="Study Materials" subtitle="Upload and manage course learning resources."
        action={<Button icon="+" onClick={() => setShowModal(true)}>Upload Material</Button>} />
      <Card><Table columns={cols} data={materials} empty="No study materials uploaded yet." /></Card>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Upload Study Material"
        footer={<div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={() => setShowModal(false)}>Upload</Button></div>}>
        <div className="form-grid form-grid--1">
          <Input label="Title" placeholder="e.g. Chapter 6 Notes" required />
          <Input label="Course Code" placeholder="e.g. PHY101" required />
          <div>
            <label className="field-label">File <span className="field-required">*</span></label>
            <input type="file" className="field-input" style={{ height: 'auto', padding: '8px 12px' }} />
          </div>
        </div>
      </Modal>
    </Section>
  );
}

/* ── SESSION CREATION ── */
export function StaffSessionCreation() {
  const [showModal, setShowModal] = useState(false);
  const [sessions, setSessions] = useState([]);

  const cols = [
    { key: 'title', label: 'Session Title' },
    { key: 'course', label: 'Course', render: (v, r) => v || r.course_name || '—' },
    { key: 'scheduled_date', label: 'Date', render: (v, r) => v || r.date || '—' },
    { key: 'scheduled_time', label: 'Time', render: (v, r) => v || r.time || '—' },
    { key: 'duration_minutes', label: 'Duration', render: (v, r) => `${v || r.duration || 60} min` },
    { key: 'room', label: 'Platform / Room', render: (v, r) => v || r.platform || 'Online' },
  ];

  return (
    <Section>
      <PageHeader title="Session Creation" subtitle="Schedule and manage your teaching sessions."
        action={<Button icon="+" onClick={() => setShowModal(true)}>New Session</Button>} />
      <Card><Table columns={cols} data={sessions} empty="No sessions created yet." /></Card>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Schedule New Session"
        footer={<div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={() => setShowModal(false)}>Create</Button></div>}>
        <div className="form-grid">
          <Input label="Session Title" placeholder="e.g. Week 7 Discussion" required className="form-col-span" />
          <Input label="Course Code" placeholder="e.g. PHY101" required />
          <Input label="Date" type="date" required />
          <Input label="Time" type="time" />
          <Input label="Duration (min)" type="number" placeholder="60" />
          <Input label="Platform / Room" placeholder="Zoom / Room 201" />
        </div>
      </Modal>
    </Section>
  );
}

/* ── STUDENT DETAILS ── */
const DEFAULT_STUDENTS = [
  { id: 1, full_name: 'Aarav Sharma', enroll_id: 'STU-101', class_name: 'Class 10-A', section: 'A', phone: '+91 98765 43210', email: 'aarav@school.edu', guardian: 'Ramesh Sharma', attendance_rate: 94, status: 'Active' },
  { id: 2, full_name: 'Diya Patel', enroll_id: 'STU-102', class_name: 'Class 10-A', section: 'A', phone: '+91 98765 43211', email: 'diya@school.edu', guardian: 'Nilesh Patel', attendance_rate: 98, status: 'Active' },
  { id: 3, full_name: 'Rohan Verma', enroll_id: 'STU-103', class_name: 'Class 10-A', section: 'A', phone: '+91 98765 43212', email: 'rohan@school.edu', guardian: 'Suresh Verma', attendance_rate: 82, status: 'Active' },
  { id: 4, full_name: 'Ananya Iyer', enroll_id: 'STU-104', class_name: 'Class 10-B', section: 'B', phone: '+91 98765 43213', email: 'ananya@school.edu', guardian: 'Venkatesh Iyer', attendance_rate: 91, status: 'Active' },
  { id: 5, full_name: 'Kabir Khan', enroll_id: 'STU-105', class_name: 'Class 10-B', section: 'B', phone: '+91 98765 43214', email: 'kabir@school.edu', guardian: 'Tariq Khan', attendance_rate: 88, status: 'Active' },
];

export function StaffStudentDetails() {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [students, setStudents] = useState(() => {
    try {
      const stored = localStorage.getItem('portal_students_db');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_STUDENTS;
  });

  useEffect(() => {
    api.getStaffStudents()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        if (data.length > 0) {
          setStudents(prev => {
            const combined = [...data];
            prev.forEach(p => {
              if (!combined.some(c => (c.enroll_id || c.id) === (p.enroll_id || p.id))) {
                combined.push(p);
              }
            });
            localStorage.setItem('portal_students_db', JSON.stringify(combined));
            return combined;
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newStud = {
      id: Date.now(),
      full_name: fd.get('full_name'),
      name: fd.get('full_name'),
      enroll_id: fd.get('enroll_id') || `STU-${Math.floor(100 + Math.random() * 900)}`,
      class_name: fd.get('class_name'),
      section: fd.get('section') || 'A',
      email: fd.get('email') || `${fd.get('enroll_id')?.toLowerCase()}@school.edu`,
      phone: fd.get('phone') || '',
      guardian: fd.get('guardian') || '',
      guardian_phone: fd.get('guardian_phone') || '',
      attendance_rate: 100,
      status: 'Active',
    };

    try {
      await api.createStaffStudent(newStud);
    } catch (err) {}

    const updated = [newStud, ...students];
    setStudents(updated);
    try { localStorage.setItem('portal_students_db', JSON.stringify(updated)); } catch (e) {}

    setShowAddModal(false);
    setSuccessMsg(`✓ Student ${newStud.full_name} (${newStud.enroll_id}) added successfully!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filtered = students.filter(s =>
    (s.name || s.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.enroll_id || s.sid || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.class_name || s.class || '').toLowerCase().includes(search.toLowerCase())
  );

  const cols = [
    { key: 'full_name', label: 'Student', render: (v, r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={v || r.name} size="sm" />
        <div>
          <div style={{ fontWeight: 600 }}>{v || r.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.email || '—'}</div>
        </div>
      </div>
    )},
    { key: 'enroll_id', label: 'ID', render: (v, r) => <Badge label={v || r.sid || '—'} variant="info" /> },
    { key: 'class_name', label: 'Class', render: (v, r) => v || r.class || '—' },
    { key: 'phone', label: 'Phone', render: v => v || '—' },
    { key: 'attendance_rate', label: 'Attendance', render: (v, r) => <ProgressBar value={v ?? r.att ?? 90} color={(v ?? r.att ?? 90) >= 75 ? 'success' : 'danger'} size="sm" /> },
    { key: 'status', label: 'Status', render: v => <Badge label={v || 'Active'} variant="success" /> },
    { key: 'actions', label: 'Action', render: (_, r) => <Button size="sm" variant="outline" onClick={() => setSelectedStudent(r)}>View</Button> },
  ];

  return (
    <Section>
      <PageHeader
        title="Student Details"
        subtitle="Manage student directory, view profiles, and enroll new students."
        action={<Button icon="+" onClick={() => setShowAddModal(true)}>Add Student</Button>}
      />

      {successMsg && (
        <div style={{ padding: '12px 16px', background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: 14, fontWeight: 500 }}>
          {successMsg}
        </div>
      )}

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID or class…" style={{ maxWidth: 320 }} />
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total Students: <strong>{filtered.length}</strong></div>
        </div>
        <Table columns={cols} data={filtered} empty="No student records found." />
      </Card>

      {/* Add Student Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Enroll New Student"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" form="add-student-form">Add Student</Button>
          </div>
        }
      >
        <form id="add-student-form" onSubmit={handleAddStudent}>
          <div className="form-grid">
            <Input label="Full Name" name="full_name" placeholder="e.g. Aarav Sharma" required className="form-col-span" />
            <Input label="Enrollment ID" name="enroll_id" placeholder="e.g. STU-108" required />
            <Input label="Class / Grade" name="class_name" placeholder="e.g. Class 10-A" required />
            <Input label="Section" name="section" placeholder="A / B / C" />
            <Input label="Student Email" name="email" type="email" placeholder="student@school.edu" />
            <Input label="Student Phone" name="phone" placeholder="+91 98765 00000" />
            <Input label="Guardian Name" name="guardian" placeholder="Parent or Guardian" />
            <Input label="Guardian Phone" name="guardian_phone" placeholder="+91 98765 11111" />
          </div>
        </form>
      </Modal>

      {/* View Student Modal */}
      <Modal
        open={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={`Student Profile — ${selectedStudent?.full_name || selectedStudent?.name || ''}`}
        footer={<Button onClick={() => setSelectedStudent(null)}>Close</Button>}
      >
        {selectedStudent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['Full Name', selectedStudent.full_name || selectedStudent.name || '—'],
              ['Enrollment ID', selectedStudent.enroll_id || selectedStudent.sid || '—'],
              ['Class & Section', `${selectedStudent.class_name || selectedStudent.class || '—'} (Sec ${selectedStudent.section || 'A'})`],
              ['Email Address', selectedStudent.email || '—'],
              ['Phone Number', selectedStudent.phone || '—'],
              ['Guardian Name', selectedStudent.guardian || '—'],
              ['Guardian Phone', selectedStudent.guardian_phone || '—'],
              ['Current Attendance', `${selectedStudent.attendance_rate ?? 90}%`],
              ['Account Status', selectedStudent.status || 'Active'],
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

/* ── CLASS CREATION ── */
export function StaffClassCreation() {
  const [showModal, setShowModal] = useState(false);
  const [classes, setClasses] = useState([]);

  const cols = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Class Name' },
    { key: 'sem', label: 'Semester' },
    { key: 'strength', label: 'Strength' },
  ];

  return (
    <Section>
      <PageHeader title="Class Creation" subtitle="Create and manage class groups."
        action={<Button icon="+" onClick={() => setShowModal(true)}>New Class</Button>} />
      <Card><Table columns={cols} data={classes} empty="No class groups created yet." /></Card>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Class Group"
        footer={<div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={() => setShowModal(false)}>Create</Button></div>}>
        <div className="form-grid">
          <Input label="Class Code" placeholder="e.g. XI-A" required />
          <Input label="Class Name" placeholder="e.g. Class XI-A" required />
          <Input label="Semester" placeholder="e.g. Sem 2" />
        </div>
      </Modal>
    </Section>
  );
}

/* ── TEST CREATION ── */
export function StaffTestCreation() {
  const [showModal, setShowModal] = useState(false);
  const [tests, setTests] = useState([]);

  const cols = [
    { key: 'title', label: 'Title' },
    { key: 'course', label: 'Course' },
    { key: 'date', label: 'Date' },
    { key: 'duration', label: 'Duration' },
    { key: 'marks', label: 'Total Marks' },
  ];

  return (
    <Section>
      <PageHeader title="Test Creation" subtitle="Create and schedule assessments for your classes."
        action={<Button icon="+" onClick={() => setShowModal(true)}>New Test</Button>} />
      <Card><Table columns={cols} data={tests} empty="No tests scheduled." /></Card>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Assessment"
        footer={<div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={() => setShowModal(false)}>Create</Button></div>}>
        <div className="form-grid">
          <Input label="Assessment Title" placeholder="e.g. Unit Test 1" required className="form-col-span" />
          <Input label="Course Code" placeholder="e.g. PHY101" required />
          <Input label="Date" type="date" required />
          <Input label="Duration (min)" type="number" placeholder="60" />
          <Input label="Total Marks" type="number" placeholder="100" />
        </div>
      </Modal>
    </Section>
  );
}

/* ── TASK REVIEWS & CREATION ── */
const DEFAULT_TASKS = [
  { id: 1, title: 'Calculus Problem Set 3', course: 'Mathematics', class_name: 'Class 10-A', due_date: '2026-09-25', max_marks: 100, description: 'Complete questions 1 to 15 from Chapter 4 on Derivatives.' },
  { id: 2, title: 'Electromagnetism Lab Report', course: 'Physics', class_name: 'Class 10-A', due_date: '2026-09-28', max_marks: 50, description: 'Submit experimental findings on magnetic flux inductance.' },
];

const DEFAULT_SUBMISSIONS = [
  { id: 1, student_name: 'Aarav Sharma', student_id: 'STU-101', task_id: 1, task_title: 'Calculus Problem Set 3', submitted_at: '2026-09-15', answer_text: 'Attached step-by-step proofs for problems 1-15 with graph plots.', grade: '', feedback: '', status: 'Pending' },
  { id: 2, student_name: 'Diya Patel', student_id: 'STU-102', task_id: 1, task_title: 'Calculus Problem Set 3', submitted_at: '2026-09-14', answer_text: 'Solutions compiled into PDF with full working and chain rule derivations.', grade: '95/100', feedback: 'Outstanding execution and clean notation!', status: 'Graded' },
  { id: 3, student_name: 'Rohan Verma', student_id: 'STU-103', task_id: 2, task_title: 'Electromagnetism Lab Report', submitted_at: '2026-09-15', answer_text: 'Measurement readings recorded across 5 trials; error margin noted at 2.4%.', grade: '', feedback: '', status: 'Pending' },
];

export function StaffTaskReviews() {
  const [tab, setTab] = useState('submissions');
  const [subFilter, setSubFilter] = useState('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewGrade, setReviewGrade] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewStatus, setReviewStatus] = useState('Graded');
  const [toastMsg, setToastMsg] = useState('');

  const [tasks, setTasks] = useState(() => {
    try {
      const stored = localStorage.getItem('portal_staff_tasks');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_TASKS;
  });

  const [subs, setSubs] = useState(() => {
    try {
      const stored = localStorage.getItem('portal_staff_subs');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_SUBMISSIONS;
  });

  useEffect(() => {
    api.getStaffSubmissions()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        if (data.length > 0) setSubs(data);
      })
      .catch(() => {});
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newTask = {
      id: Date.now(),
      title: fd.get('title'),
      course: fd.get('course'),
      class_name: fd.get('class_name'),
      due_date: fd.get('due_date'),
      max_marks: Number(fd.get('max_marks')) || 100,
      description: fd.get('description'),
    };

    try { await api.createStaffTask(newTask); } catch (e) {}

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    try { localStorage.setItem('portal_staff_tasks', JSON.stringify(updatedTasks)); } catch (e) {}

    setShowAddTask(false);
    setToastMsg(`✓ Task "${newTask.title}" created and published!`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const openReviewModal = (sub) => {
    setReviewItem(sub);
    setReviewGrade(sub.grade || '');
    setReviewFeedback(sub.feedback || '');
    setReviewStatus(sub.status === 'Graded' ? 'Graded' : 'Graded');
  };

  const handleSubmitReview = async () => {
    if (!reviewItem) return;
    const updated = subs.map(s => {
      if (s.id === reviewItem.id) {
        return {
          ...s,
          grade: reviewGrade || 'Graded',
          feedback: reviewFeedback,
          status: reviewStatus,
          reviewed_at: new Date().toISOString(),
        };
      }
      return s;
    });

    try {
      await api.gradeStaffSubmission(reviewItem.id, { grade: reviewGrade, feedback: reviewFeedback });
    } catch (e) {}

    setSubs(updated);
    try { localStorage.setItem('portal_staff_subs', JSON.stringify(updated)); } catch (e) {}

    setToastMsg(`✓ Review submitted for ${reviewItem.student_name}!`);
    setTimeout(() => setToastMsg(''), 4000);
    setReviewItem(null);
  };

  const filteredSubs = subs.filter(s => {
    if (subFilter === 'all') return true;
    return (s.status || 'pending').toLowerCase() === subFilter.toLowerCase();
  });

  const subCols = [
    { key: 'student_name', label: 'Student', render: (v, r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={v || r.student} size="sm" />
        <div>
          <div style={{ fontWeight: 600 }}>{v || r.student}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.student_id || '—'}</div>
        </div>
      </div>
    )},
    { key: 'task_title', label: 'Task Title', render: (v, r) => <strong>{v || r.task || '—'}</strong> },
    { key: 'submitted_at', label: 'Submitted', render: v => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'grade', label: 'Grade / Score', render: v => v ? <Badge label={v} variant="success" /> : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Pending</span> },
    { key: 'status', label: 'Status', render: v => <Badge label={v || 'Pending'} variant={v === 'Graded' ? 'success' : v === 'Needs Revision' ? 'warning' : 'info'} dot /> },
    { key: 'actions', label: 'Action', render: (_, r) => (
      <Button size="sm" variant={r.status === 'Graded' ? 'outline' : 'primary'} onClick={() => openReviewModal(r)}>
        {r.status === 'Graded' ? 'Edit Review' : 'Grade & Review'}
      </Button>
    )},
  ];

  const taskCols = [
    { key: 'title', label: 'Task Title', render: v => <strong>{v}</strong> },
    { key: 'course', label: 'Course' },
    { key: 'class_name', label: 'Class' },
    { key: 'due_date', label: 'Due Date', render: v => v || '—' },
    { key: 'max_marks', label: 'Max Marks', render: v => `${v} pts` },
  ];

  return (
    <Section>
      <PageHeader
        title="Tasks & Reviews"
        subtitle="Create course tasks, assign assignments, and review student submissions."
        action={<Button icon="+" onClick={() => setShowAddTask(true)}>Create Task</Button>}
      />

      {toastMsg && (
        <div style={{ padding: '12px 16px', background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: 14, fontWeight: 500 }}>
          {toastMsg}
        </div>
      )}

      {/* Main navigation tabs */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
        <Button
          variant={tab === 'submissions' ? 'primary' : 'ghost'}
          onClick={() => setTab('submissions')}
        >
          Submissions to Review ({subs.filter(s => (s.status || '').toLowerCase() !== 'graded').length} Pending)
        </Button>
        <Button
          variant={tab === 'tasks' ? 'primary' : 'ghost'}
          onClick={() => setTab('tasks')}
        >
          Active Tasks ({tasks.length})
        </Button>
      </div>

      {tab === 'submissions' ? (
        <Card>
          <div style={{ marginBottom: 16 }}>
            <Tabs
              tabs={[
                { value: 'all', label: 'All Submissions', count: subs.length },
                { value: 'pending', label: 'Pending Review', count: subs.filter(s => (s.status || 'pending').toLowerCase() === 'pending').length },
                { value: 'graded', label: 'Graded', count: subs.filter(s => (s.status || '').toLowerCase() === 'graded').length },
              ]}
              active={subFilter}
              onChange={setSubFilter}
            />
          </div>
          <Table columns={subCols} data={filteredSubs} empty="No student submissions found." />
        </Card>
      ) : (
        <Card>
          <Table columns={taskCols} data={tasks} empty="No tasks created yet." />
        </Card>
      )}

      {/* Create Task Modal */}
      <Modal
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        title="Create New Task / Assignment"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setShowAddTask(false)}>Cancel</Button>
            <Button type="submit" form="create-task-form">Publish Task</Button>
          </div>
        }
      >
        <form id="create-task-form" onSubmit={handleCreateTask}>
          <div className="form-grid">
            <Input label="Task Title" name="title" placeholder="e.g. Thermodynamics Lab Report" required className="form-col-span" />
            <Input label="Course / Subject" name="course" placeholder="e.g. Physics" required />
            <Input label="Target Class" name="class_name" placeholder="e.g. Class 10-A" required />
            <Input label="Due Date" name="due_date" type="date" required />
            <Input label="Total Marks" name="max_marks" type="number" placeholder="100" defaultValue="100" />
            <div className="form-col-span">
              <Textarea label="Instructions / Description" name="description" placeholder="Provide problem descriptions, reading materials or guidelines…" rows={4} required />
            </div>
          </div>
        </form>
      </Modal>

      {/* Review & Grade Modal */}
      <Modal
        open={!!reviewItem}
        onClose={() => setReviewItem(null)}
        title={`Review Submission — ${reviewItem?.student_name || ''}`}
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setReviewItem(null)}>Cancel</Button>
            <Button onClick={handleSubmitReview} disabled={!reviewGrade.trim()}>Submit Grade & Review</Button>
          </div>
        }
      >
        {reviewItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: 14, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>TASK / ASSIGNMENT</div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{reviewItem.task_title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>STUDENT SUBMISSION:</div>
              <div style={{ fontSize: 13, background: 'var(--bg-surface)', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                {reviewItem.answer_text || 'Files attached and submitted through student portal.'}
              </div>
            </div>

            <div className="form-grid">
              <Input
                label="Score / Grade"
                placeholder="e.g. 92/100 or A+"
                value={reviewGrade}
                onChange={e => setReviewGrade(e.target.value)}
                required
              />
              <Select
                label="Review Status"
                value={reviewStatus}
                onChange={e => setReviewStatus(e.target.value)}
                options={[
                  { value: 'Graded', label: 'Graded & Approved' },
                  { value: 'Needs Revision', label: 'Needs Revision' },
                ]}
              />
              <div className="form-col-span">
                <Textarea
                  label="Teacher Feedback / Remarks"
                  placeholder="Provide constructive feedback, praise, or areas for improvement…"
                  value={reviewFeedback}
                  onChange={e => setReviewFeedback(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Section>
  );
}

/* ── STAFF SELF ATTENDANCE ── */
export function StaffAttendanceStaff() {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [records, setRecords] = useState([]);

  const cols = [
    { key: 'date', label: 'Date' },
    { key: 'checkIn', label: 'Check In' },
    { key: 'checkOut', label: 'Check Out' },
    { key: 'status', label: 'Status', render: v => <Badge label={v || 'Present'} variant={v === 'Absent' ? 'absent' : 'present'} dot /> },
  ];
  const now = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <Section>
      <PageHeader title="My Attendance" subtitle="Record your daily check-in and check-out." />
      <Card>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
          <Button
            variant="primary" icon="⏰"
            disabled={checkedIn}
            onClick={() => { setCheckedIn(true); setCheckInTime(now()); }}
          >Check In</Button>
          <Button
            variant="secondary" icon="🚪"
            disabled={!checkedIn}
            onClick={() => setCheckedIn(false)}
          >Check Out</Button>
          {checkedIn && <span style={{ fontSize: 13, color: 'var(--success)' }}>✓ Checked in at {checkInTime}</span>}
        </div>
      </Card>
      <Card>
        <CardHeader title="Attendance History" />
        <Table columns={cols} data={records} empty="No attendance records found." />
      </Card>
    </Section>
  );
}

/* ── STUDENT ATTENDANCE (STAFF MARKS) ── */
export function StaffAttendanceStudents() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedClass, setSelectedClass] = useState('All');
  const [saved, setSaved] = useState(false);
  const [att, setAtt] = useState({});

  // Sync roster with students from localStorage or API
  const [students, setStudents] = useState(() => {
    try {
      const stored = localStorage.getItem('portal_students_db');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_STUDENTS;
  });

  useEffect(() => {
    api.getStaffStudents()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.results || [];
        if (data.length > 0) {
          setStudents(prev => {
            const combined = [...data];
            prev.forEach(p => {
              if (!combined.some(c => (c.enroll_id || c.id) === (p.enroll_id || p.id))) {
                combined.push(p);
              }
            });
            return combined;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Initialize all to 'present' on first load if not set
  useEffect(() => {
    const savedAtt = localStorage.getItem(`portal_att_${selectedDate}`);
    if (savedAtt) {
      try {
        setAtt(JSON.parse(savedAtt));
        return;
      } catch (e) {}
    }
    const init = {};
    students.forEach(s => {
      const sid = s.id || s.enroll_id;
      init[sid] = 'present';
    });
    setAtt(init);
  }, [selectedDate, students]);

  const toggle = (id, val) => setAtt(a => ({ ...a, [id]: val }));

  const markAll = (status) => {
    const next = {};
    students.forEach(s => {
      const sid = s.id || s.enroll_id;
      next[sid] = status;
    });
    setAtt(next);
  };

  const filteredStudents = students.filter(s => {
    if (selectedClass === 'All') return true;
    return (s.class_name || s.class || '').toLowerCase().includes(selectedClass.toLowerCase());
  });

  const presentCount = filteredStudents.filter(s => att[s.id || s.enroll_id] === 'present').length;
  const absentCount = filteredStudents.filter(s => att[s.id || s.enroll_id] === 'absent').length;
  const leaveCount = filteredStudents.filter(s => att[s.id || s.enroll_id] === 'leave').length;
  const totalCount = filteredStudents.length;
  const attRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  const save = async () => {
    const records = filteredStudents.map(s => ({
      enroll_id: s.enroll_id,
      status: att[s.id || s.enroll_id] === 'present' ? 'P' : att[s.id || s.enroll_id] === 'absent' ? 'A' : 'L',
    }));

    try {
      await api.markStudentAttendance({
        date: selectedDate,
        class_name: selectedClass === 'All' ? 'Class 10-A' : selectedClass,
        records,
      });
    } catch (e) {}

    try {
      localStorage.setItem(`portal_att_${selectedDate}`, JSON.stringify(att));
    } catch (e) {}

    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <Section>
      <PageHeader
        title="Student Attendance"
        subtitle={`Mark attendance for your classroom students — select date and toggle status.`}
      />

      {saved && (
        <div style={{ padding: '12px 16px', background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: 13, fontWeight: 500 }}>
          ✓ Attendance for {selectedDate} saved successfully for {filteredStudents.length} students!
        </div>
      )}

      {/* Date, Class and Quick Actions Strip */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>ATTENDANCE DATE</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="field-input"
                style={{ width: 170 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>FILTER CLASS</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="field-input"
                style={{ width: 150 }}
              >
                <option value="All">All Classes</option>
                <option value="10-A">Class 10-A</option>
                <option value="10-B">Class 10-B</option>
                <option value="11-A">Class 11-A</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button size="sm" variant="success" onClick={() => markAll('present')}>✓ Mark All Present</Button>
            <Button size="sm" variant="danger" onClick={() => markAll('absent')}>✗ Mark All Absent</Button>
          </div>
        </div>

        {/* Live Attendance Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>ROSTER SIZE</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{totalCount} Students</div>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>PRESENT</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>{presentCount} ({attRate}%)</div>
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>ABSENT</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>{absentCount}</div>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>ON LEAVE</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>{leaveCount}</div>
          </div>
        </div>
      </Card>

      {/* Roster Table */}
      <Card>
        <CardHeader title={`Students Roster (${filteredStudents.length})`} />
        {filteredStudents.length === 0 ? (
          <EmptyState icon="👥" title="No enrolled students" subtitle="Add students in Student Details or adjust your class filter." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredStudents.map(s => {
              const sid = s.id || s.enroll_id;
              const currentStatus = att[sid] || 'present';
              return (
                <div key={sid} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 18px', background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  flexWrap: 'wrap', gap: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar name={s.full_name || s.name} size="sm" />
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{s.full_name || s.name}</span>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {s.enroll_id || sid} • {s.class_name || s.class || 'Class 10-A'}
                      </div>
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => toggle(sid, 'present')}
                      style={{
                        padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: 'none',
                        cursor: 'pointer', fontWeight: 600, fontSize: 13,
                        background: currentStatus === 'present' ? '#10b981' : 'var(--bg-surface)',
                        color: currentStatus === 'present' ? '#fff' : 'var(--text-muted)',
                        boxShadow: currentStatus === 'present' ? '0 2px 4px rgba(16, 185, 129, 0.3)' : 'none',
                      }}
                    >
                      ✓ Present
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(sid, 'absent')}
                      style={{
                        padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: 'none',
                        cursor: 'pointer', fontWeight: 600, fontSize: 13,
                        background: currentStatus === 'absent' ? '#ef4444' : 'var(--bg-surface)',
                        color: currentStatus === 'absent' ? '#fff' : 'var(--text-muted)',
                        boxShadow: currentStatus === 'absent' ? '0 2px 4px rgba(239, 68, 68, 0.3)' : 'none',
                      }}
                    >
                      ✗ Absent
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(sid, 'leave')}
                      style={{
                        padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: 'none',
                        cursor: 'pointer', fontWeight: 600, fontSize: 13,
                        background: currentStatus === 'leave' ? '#f59e0b' : 'var(--bg-surface)',
                        color: currentStatus === 'leave' ? '#fff' : 'var(--text-muted)',
                        boxShadow: currentStatus === 'leave' ? '0 2px 4px rgba(245, 158, 11, 0.3)' : 'none',
                      }}
                    >
                      ⏳ Leave
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredStudents.length > 0 && (
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <Button icon="💾" onClick={save} size="lg">Save Attendance</Button>
          </div>
        )}
      </Card>
    </Section>
  );
}

/* ── STAFF NOTIFICATIONS ── */
export function StaffNotifications() {
  const [showCompose, setShowCompose] = useState(false);
  const [notifs, setNotifs] = useState([]);

  return (
    <Section>
      <PageHeader title="Notifications" subtitle="Received alerts and broadcast messages."
        action={<Button icon="📢" onClick={() => setShowCompose(true)}>Broadcast</Button>} />
      <Card>
        {notifs.length === 0 ? (
          <EmptyState icon="🔔" title="No broadcast notifications" subtitle="System and administrative broadcasts will show here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifs.map(n => (
              <Card key={n.id} hover>
                <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{n.title}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>From: {n.sender} · {n.date}</p>
              </Card>
            ))}
          </div>
        )}
      </Card>
      <Modal open={showCompose} onClose={() => setShowCompose(false)} title="Broadcast Announcement"
        footer={<div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><Button variant="ghost" onClick={() => setShowCompose(false)}>Cancel</Button><Button onClick={() => setShowCompose(false)}>Broadcast</Button></div>}>
        <div className="form-grid form-grid--1">
          <Input label="Title" placeholder="Announcement title" required />
          <Input label="Target Audience" placeholder="e.g. All Students" />
          <Textarea label="Message" rows={5} required />
        </div>
      </Modal>
    </Section>
  );
}

/* ── TICKETS HANDLING ── */
export function StaffTickets() {
  const [tab, setTab] = useState('open');
  const [tickets, setTickets] = useState([]);

  const filtered = tickets.filter(t => tab === 'all' || (t.status || 'open').toLowerCase() === tab);
  const cols = [
    { key: 'id', label: 'Ticket ID', render: v => `#TCK-${v}` },
    { key: 'student_name', label: 'Student', render: (v, r) => v || r.student || '—' },
    { key: 'subject', label: 'Subject' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status', render: v => <Badge label={v || 'Open'} variant={v === 'Open' ? 'open' : 'resolved'} dot /> },
  ];

  return (
    <Section>
      <PageHeader title="Tickets Handling" subtitle="Respond to and resolve student support requests." />
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Tabs tabs={[{ value: 'all', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'resolved', label: 'Resolved' }]}
            active={tab} onChange={setTab} />
        </div>
        <Table columns={cols} data={filtered} empty="No tickets found." />
      </Card>
    </Section>
  );
}
