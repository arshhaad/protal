import PortalLayout from './PortalLayout';

const NAV = [
  { section: 'Academic Overview' },
  { to: '/hm/dashboard',           icon: 'dashboard', label: 'HM Overview', end: true },
  { section: 'Faculty & Students' },
  { to: '/hm/staff-oversight',     icon: 'staff', label: 'Staff Oversight' },
  { to: '/hm/student-performance', icon: 'students', label: 'Student Performance' },
  { to: '/hm/classes-curriculum',   icon: 'classes', label: 'Classes & Curriculum' },
  { section: 'Administrative Actions' },
  { to: '/hm/leave-approvals',     icon: 'leave', label: 'Leave Approvals' },
  { to: '/hm/announcements',       icon: 'announcements', label: 'Announcements' },
  { section: 'Analytics & Support' },
  { to: '/hm/academic-reports',    icon: 'reports', label: 'Academic Reports' },
  { to: '/hm/tickets',             icon: 'tickets', label: 'Grievances & Tickets' },
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
