import PortalLayout from './PortalLayout';

const NAV = [
  { section: 'Main' },
  { to: '/staff/dashboard',             icon: '🏠', label: 'Dashboard', end: true },
  { section: 'Teaching' },
  { to: '/staff/courses',               icon: '📚', label: 'View Courses' },
  { to: '/staff/study-materials',       icon: '📄', label: 'Study Materials' },
  { to: '/staff/session-creation',      icon: '📅', label: 'Session Creation' },
  { to: '/staff/test-creation',         icon: '📝', label: 'Test Creation' },
  { section: 'Students' },
  { to: '/staff/student-details',       icon: '👥', label: 'Student Details' },
  { to: '/staff/class-creation',        icon: '🏫', label: 'Class Creation' },
  { to: '/staff/attendance-students',   icon: '✅', label: 'Student Attendance' },
  { to: '/staff/task-reviews',          icon: '🔍', label: 'Task Reviews' },
  { section: 'Operations' },
  { to: '/staff/attendance-staff',      icon: '⏰', label: 'Staff Attendance' },
  { to: '/staff/tickets',               icon: '🎟️', label: 'Tickets' },
  { to: '/staff/notifications',         icon: '🔔', label: 'Notifications' },
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
