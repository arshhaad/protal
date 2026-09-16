import PortalLayout from './PortalLayout';

const NAV = [
  { section: 'Overview' },
  { to: '/admin/dashboard',       icon: '🏠', label: 'Dashboard', end: true },
  { section: 'Management' },
  { to: '/admin/manage-courses',  icon: '📚', label: 'Manage Courses' },
  { to: '/admin/manage-users',    icon: '👩‍🎓', label: 'Manage Students' },
  { to: '/admin/manage-staff',    icon: '👨‍🏫', label: 'Manage Staff' },
  { section: 'Events & Comms' },
  { to: '/admin/events',          icon: '🗓️', label: 'Events' },
  { to: '/admin/message-users',   icon: '💬', label: 'Message Students' },
  { to: '/admin/message-staff',   icon: '📨', label: 'Message Staff' },
  { section: 'Reports' },
  { to: '/admin/staff-reports',   icon: '📊', label: 'Staff Reports' },
  { to: '/admin/student-reports', icon: '📈', label: 'Student Reports' },
  { to: '/admin/course-reports',  icon: '📉', label: 'Course Reports' },
  { section: 'Finance' },
  { to: '/admin/payments',        icon: '💳', label: 'Payments' },
];

export default function AdminLayout() {
  return (
    <PortalLayout
      navItems={NAV}
      user={{ name: 'Administrator', role: 'Super Admin', avatarColor: '#ef4444' }}
      accentColor="#ef4444"
      logoutPath="/admin/login"
      title="AdminPanel"
      logoIcon="🛡️"
    />
  );
}
