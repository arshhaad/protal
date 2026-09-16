import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { section: 'Main' },
  { to: '/student/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/student/profile', icon: '👤', label: 'Profile' },
  { section: 'Academics' },
  { to: '/student/exam-details', icon: '📝', label: 'Exam Details' },
  { to: '/student/marks', icon: '📊', label: 'Marks' },
  { to: '/student/attendance', icon: '📅', label: 'Attendance' },
  { to: '/student/sessions', icon: '🖥️', label: 'Sessions' },
  { to: '/student/my-courses', icon: '📚', label: 'My Courses' },
  { to: '/student/progress', icon: '📈', label: 'Student Progress' },
  { section: 'Actions' },
  { to: '/student/tasks', icon: '✅', label: 'Tasks', badge: '3' },
  { to: '/student/leave-request', icon: '🗓️', label: 'Leave Request' },
  { to: '/student/payment', icon: '💳', label: 'Payment' },
  { section: 'Support' },
  { to: '/student/notifications', icon: '🔔', label: 'Notifications', badge: '5', badgeClass: 'red' },
  { to: '/student/tickets', icon: '🎟️', label: 'Tickets' },
  { to: '/student/contact-us', icon: '📞', label: 'Contact Us' },
];

export default function StudentSidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => navigate('/student/login');

  return (
    <>
      <div className={`overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`sidebar ${open ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🎓</div>
          <div className="sidebar-logo-text">Edu<span>Portal</span></div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) =>
            item.section ? (
              <div key={i} className="nav-section-label">{item.section}</div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.badge && (
                  <span className={`nav-badge ${item.badgeClass || ''}`}>{item.badge}</span>
                )}
              </NavLink>
            )
          )}
        </nav>

        <div className="sidebar-user">
          <div className="avatar">S</div>
          <div className="user-info">
            <div className="user-name">Student Name</div>
            <div className="user-id">STU-2024-001</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">🚪</button>
        </div>
      </aside>

      {/* Topbar hamburger toggle — exposed via window */}
      <button
        className="hamburger"
        style={{ position: 'fixed', top: 18, left: 16, zIndex: 200 }}
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle menu"
      >
        ☰
      </button>
    </>
  );
}
