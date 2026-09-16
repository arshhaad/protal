import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { section: 'Main' },
  { to: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
  { section: 'Management' },
  { to: '/admin/manage-hm', icon: '🏛️', label: 'Manage HM' },
  { to: '/admin/manage-students', icon: '👩‍🎓', label: 'Manage Students' },
  { to: '/admin/manage-staff', icon: '👨‍🏫', label: 'Manage Staff' },
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className={`overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}>🛡️</div>
          <div className="sidebar-logo-text">Admin<span style={{ color: '#ef4444' }}>Panel</span></div>
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
                style={({ isActive }) => isActive ? { color: '#ef4444' } : {}}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="sidebar-user">
          <div className="avatar" style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}>A</div>
          <div className="user-info">
            <div className="user-name">Administrator</div>
            <div className="user-id">Super Admin</div>
          </div>
          <button className="logout-btn" onClick={() => navigate('/admin/login')} title="Logout">🚪</button>
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
