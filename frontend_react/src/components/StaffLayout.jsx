import PortalLayout from './PortalLayout';

const NAV = [
  { section: 'Main' },
  { to: '/staff/dashboard',             icon: 'dashboard', label: 'Dashboard', end: true },
  { section: 'Teaching' },
  { to: '/staff/courses',               icon: 'courses', label: 'View Courses' },
  { to: '/staff/study-materials',       icon: 'books', label: 'Study Materials' },
  { to: '/staff/session-creation',      icon: 'sessions', label: 'Session Creation' },
  { to: '/staff/test-creation',         icon: 'exams', label: 'Test Creation' },
  { section: 'Students' },
  { to: '/staff/student-details',       icon: 'students', label: 'Student Details' },
  { to: '/staff/class-creation',        icon: 'classes', label: 'Class Creation' },
  { to: '/staff/attendance-students',   icon: 'attendance', label: 'Student Attendance' },
  { to: '/staff/task-reviews',          icon: 'tasks', label: 'Task Reviews' },
  { section: 'Operations' },
  { to: '/staff/attendance-staff',      icon: 'clock', label: 'Staff Attendance' },
  { to: '/staff/tickets',               icon: 'tickets', label: 'Tickets' },
  { to: '/staff/notifications',         icon: 'bell', label: 'Notifications' },
];

export default function StaffLayout() {
  return (
    <PortalLayout
      navItems={NAV}
      user={{ name: 'Staff User', role: 'Educator', avatarColor: '#a855f7' }}
      accentColor="#a855f7"
      logoutPath="/staff/login"
      title="StaffHub"
      logoIcon="📚"
    />
  );
}
