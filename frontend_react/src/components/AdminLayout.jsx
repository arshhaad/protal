import PortalLayout from './PortalLayout';

const NAV = [
  { section: 'Overview' },
  { to: '/admin/dashboard',       icon: 'dashboard', label: 'Dashboard', end: true },
  { section: 'Management' },
  { to: '/admin/manage-hm',       icon: 'staff', label: 'Manage HM' },
  { to: '/admin/manage-staff',    icon: 'staff', label: 'Manage Staff' },
  { to: '/admin/manage-students', icon: 'students', label: 'Manage Students' },
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
