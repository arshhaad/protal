import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { section: 'Main' },
  { to: '/staff/dashboard', icon: '🏠', label: 'Dashboard' },
  { section: 'Teaching' },
  { to: '/staff/courses', icon: '📚', label: 'View Courses' },
  { to: '/staff/study-materials', icon: '📄', label: 'Study Materials' },
  { to: '/staff/session-creation', icon: '📅', label: 'Create Session' },
  { to: '/staff/test-creation', icon: '📝', label: 'Create Test' },
  { section: 'Students' },
  { to: '/staff/student-details', icon: '👥', label: 'Student Details' },
  { to: '/staff/class-creation', icon: '🏫', label: 'Create Class' },
  { to: '/staff/attendance-students', icon: '✅', label: 'Student Attendance' },
  { to: '/staff/task-reviews', icon: '🔍', label: 'Reviews & Tasks' },
  { section: 'Operations' },
  { to: '/staff/attendance-staff', icon: '⏰', label: 'Staff Attendance' },
  { to: '/staff/tickets', icon: '🎟️', label: 'Tickets Handling' },
  { to: '/staff/notifications', icon: '🔔', label: 'Notifications' },
];

export default function StaffSidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className={`overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6)' }}>📚</div>
          <div className="sidebar-logo-text">Staff<span style={{ color: '#a855f7' }}>Hub</span></div>
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
                style={({ isActive }) => isActive ? { color: '#a855f7' } : {}}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="sidebar-user">
          <div className="avatar" style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6)' }}>T</div>
          <div className="user-info">
            <div className="user-name">Staff User</div>
            <div className="user-id">Educator</div>
          </div>
          <button className="logout-btn" onClick={() => navigate('/staff/login')} title="Logout">🚪</button>
        </div>
      </aside>

      <button
        className="hamburger"
        style={{ position: 'fixed', top: 18, left: 16, zIndex: 200 }}
        onClick={() => setOpen(o => !o)}
      >☰</button>
    </>
  );
}
