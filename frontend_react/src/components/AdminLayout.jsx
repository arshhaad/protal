import PortalLayout from './PortalLayout';

const NAV = [
  { section: 'Overview' },
  { to: '/admin/dashboard',       icon: 'dashboard', label: 'Dashboard', end: true },
  { section: 'Management' },
  { to: '/admin/manage-courses',  icon: 'courses', label: 'Manage Courses' },
  { to: '/admin/manage-users',    icon: 'students', label: 'Manage Students' },
  { to: '/admin/manage-staff',    icon: 'staff', label: 'Manage Staff' },
  { section: 'Events & Comms' },
  { to: '/admin/events',          icon: 'calendar', label: 'Events' },
  { to: '/admin/message-users',   icon: 'message', label: 'Message Students' },
  { to: '/admin/message-staff',   icon: 'message', label: 'Message Staff' },
  { section: 'Reports' },
  { to: '/admin/staff-reports',   icon: 'reports', label: 'Staff Reports' },
  { to: '/admin/student-reports', icon: 'trendingUp', label: 'Student Reports' },
  { to: '/admin/course-reports',  icon: 'analytics', label: 'Course Reports' },
  { section: 'Finance' },
  { to: '/admin/payments',        icon: 'payment', label: 'Payments' },
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
