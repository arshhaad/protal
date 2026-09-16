import PortalLayout from './PortalLayout';

const NAV = [
  { section: 'Academic Overview' },
  { to: '/hm/dashboard',           icon: '🏛️', label: 'HM Overview', end: true },
  { section: 'Faculty & Students' },
  { to: '/hm/staff-oversight',     icon: '👨‍🏫', label: 'Staff Oversight' },
  { to: '/hm/student-performance', icon: '🎓', label: 'Student Performance' },
  { to: '/hm/classes-curriculum',   icon: '🏫', label: 'Classes & Curriculum' },
  { section: 'Administrative Actions' },
  { to: '/hm/leave-approvals',     icon: '✅', label: 'Leave Approvals', badge: '4', badgeVariant: 'danger' },
  { to: '/hm/announcements',       icon: '📢', label: 'Announcements' },
  { section: 'Analytics & Support' },
  { to: '/hm/academic-reports',    icon: '📊', label: 'Academic Reports' },
  { to: '/hm/tickets',             icon: '🎟️', label: 'Grievances & Tickets' },
];

export default function HMLayout() {
  return (
    <PortalLayout
      navItems={NAV}
      user={{ name: 'Dr. Arthur Sterling', role: 'Head Master', avatarColor: '#0d9488' }}
      accentColor="#0d9488"
      logoutPath="/hm/login"
      title="HeadmasterDesk"
      logoIcon="🏛️"
    />
  );
}
