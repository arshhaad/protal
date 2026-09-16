import { useState, useEffect } from 'react';
import PortalLayout from './PortalLayout';

const NAV = [
  { section: 'Main' },
  { to: '/student/dashboard',    icon: '🏠', label: 'Dashboard', end: true },
  { to: '/student/profile',      icon: '👤', label: 'Profile' },
  { section: 'Academics' },
  { to: '/student/exam-details', icon: '📝', label: 'Exam Details' },
  { to: '/student/marks',        icon: '📊', label: 'Marks' },
  { to: '/student/attendance',   icon: '📅', label: 'Attendance' },
  { to: '/student/sessions',     icon: '🖥️', label: 'Sessions' },
  { to: '/student/my-courses',   icon: '📚', label: 'My Courses' },
  { to: '/student/progress',     icon: '📈', label: 'Progress' },
  { section: 'Actions' },
  { to: '/student/tasks',        icon: '✅', label: 'Tasks' },
  { to: '/student/leave-request',icon: '🗓️', label: 'Leave Request' },
  { to: '/student/payment',      icon: '💳', label: 'Payment' },
  { section: 'Support' },
  { to: '/student/notifications',icon: '🔔', label: 'Notifications' },
  { to: '/student/tickets',      icon: '🎟️', label: 'Tickets' },
  { to: '/student/contact-us',   icon: '📞', label: 'Contact Us' },
];

export default function StudentLayout() {
  const [user, setUser] = useState({ name: 'Student', role: 'Student Portal', avatarColor: '#6366f1' });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('studentUser');
      if (stored) {
        const u = JSON.parse(stored);
        setUser({
          name: u.full_name || u.enroll_id || 'Student',
          role: u.class_name ? `Class ${u.class_name}` : 'Student',
          avatarColor: '#6366f1',
        });
      }
    } catch (e) {}
  }, []);

  return (
    <PortalLayout
      navItems={NAV}
      user={user}
      accentColor="#6366f1"
      logoutPath="/student/login"
      title="EduPortal"
      logoIcon="🎓"
    />
  );
} 

