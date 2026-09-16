import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { Avatar, Modal, Button, useToast } from './ui/index';
import './PortalLayout.css';

export default function PortalLayout({
  navItems,          // [{ section }, { to, icon, label, badge, badgeVariant }]
  user,              // { name, role, avatarColor }
  accentColor,       // CSS color for active nav items
  logoutPath,
  title,             // App/portal name e.g. "EduPortal"
  logoIcon = '🎓',
}) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Settings mock state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);

  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const handleToggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sidebarCollapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const accent = accentColor || 'var(--accent)';

  // Find active item and section for dynamic breadcrumb / header title
  let currentSection = '';
  let currentLabel = 'Dashboard';
  for (const item of navItems) {
    if (item.section) currentSection = item.section;
    if (item.to && (location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to)))) {
      currentLabel = item.label;
      break;
    }
  }

  const handleProfileClick = () => {
    setProfileOpen(false);
    if (location.pathname.startsWith('/student')) {
      navigate('/student/profile');
    } else {
      setShowProfileModal(true);
    }
  };

  const handleLogout = () => {
    setProfileOpen(false);
    toast('Signed out successfully. See you soon!', 'info');
    navigate(logoutPath);
  };

  return (
    <div className={`portal ${collapsed ? 'portal--collapsed' : ''}`}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}
        aria-label="Navigation"
      >
        {/* Logo */}
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon" style={{ background: accent }} aria-hidden="true">
            {logoIcon}
          </div>
          {!collapsed && (
            <div className="sidebar__logo-text">
              <span className="sidebar__logo-name">{title}</span>
            </div>
          )}
          <button
            className="sidebar__collapse-btn"
            onClick={handleToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar__nav" aria-label="Main navigation">
          {navItems.map((item, i) => {
            if (item.section) {
              return collapsed ? null : (
                <p key={i} className="sidebar__section-label">{item.section}</p>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                }
                style={({ isActive }) => isActive ? { '--item-accent': accent } : {}}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
              >
                <span className="sidebar__link-icon" aria-hidden="true">{item.icon}</span>
                {!collapsed && (
                  <span className="sidebar__link-label">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span
                    className={`sidebar__badge ${item.badgeVariant === 'danger' ? 'sidebar__badge--danger' : ''}`}
                    aria-label={`${item.badge} notifications`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User */}
        <div className="sidebar__user">
          <Avatar name={user.name} size="sm" color={user.avatarColor || accent} />
          {!collapsed && (
            <div className="sidebar__user-info">
              <p className="sidebar__user-name">{user.name}</p>
              <p className="sidebar__user-role">{user.role}</p>
            </div>
          )}
          {!collapsed && (
            <button
              className="sidebar__logout"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              ⎋
            </button>
          )}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="portal__main">
        {/* Header */}
        <header className="portal__header">
          {/* Left: hamburger + breadcrumbs */}
          <div className="header__left">
            <button
              className="header__hamburger"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              ☰
            </button>
            <div className="header__breadcrumbs" aria-label="Breadcrumb">
              <span className="header__breadcrumb-root">{title}</span>
              {currentSection && (
                <>
                  <span className="header__breadcrumb-sep">/</span>
                  <span className="header__breadcrumb-section">{currentSection}</span>
                </>
              )}
              <span className="header__breadcrumb-sep">/</span>
              <span className="header__breadcrumb-current">{currentLabel}</span>
            </div>
          </div>

          {/* Center: desktop search bar */}
          <div className="header__search">
            <span className="header__search-icon" aria-hidden="true">🔍</span>
            <input
              type="search"
              className="header__search-input"
              placeholder="Search features, courses, records… (Ctrl+K)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Global search"
            />
          </div>

          {/* Right: theme toggle + notifications + profile */}
          <div className="header__right">
            <ThemeToggle />

            <NavLink
              to={`${logoutPath.replace('/login','')}/notifications`}
              className="header__icon-btn"
              aria-label="Notifications"
            >
              🔔
              <span className="header__notif-dot" aria-hidden="true" />
            </NavLink>

            {/* Profile dropdown */}
            <div className="header__profile" ref={profileRef}>
              <button
                className="header__profile-btn"
                onClick={() => setProfileOpen(o => !o)}
                aria-label="Profile menu"
                aria-haspopup="true"
                aria-expanded={profileOpen}
              >
                <Avatar name={user.name} size="sm" color={user.avatarColor || accent} />
                <div className="header__profile-info">
                  <span className="header__profile-name">{user.name}</span>
                  <span className="header__profile-role">{user.role}</span>
                </div>
                <span className="header__profile-chevron" aria-hidden="true">▾</span>
              </button>

              {profileOpen && (
                <div className="profile-dropdown" role="menu">
                  <div className="profile-dropdown__header">
                    <Avatar name={user.name} size="md" color={user.avatarColor || accent} />
                    <div>
                      <p className="profile-dropdown__name">{user.name}</p>
                      <p className="profile-dropdown__role">{user.role}</p>
                    </div>
                  </div>
                  <div className="profile-dropdown__divider" />
                  <button role="menuitem" className="profile-dropdown__item" onClick={handleProfileClick}>
                    <span>👤</span> Profile
                  </button>
                  <button role="menuitem" className="profile-dropdown__item" onClick={() => { setProfileOpen(false); setShowSettingsModal(true); }}>
                    <span>⚙️</span> Settings
                  </button>
                  <div className="profile-dropdown__divider" />
                  <div className="profile-dropdown__theme">
                    <span>Theme</span>
                    <ThemeToggle />
                  </div>
                  <div className="profile-dropdown__divider" />
                  <button
                    role="menuitem"
                    className="profile-dropdown__item profile-dropdown__item--danger"
                    onClick={handleLogout}
                  >
                    <span>⎋</span> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="portal__content" id="main-content">
          <Outlet />
        </main>
      </div>

      {/* ── SETTINGS MODAL ── */}
      <Modal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Portal Preferences & Settings"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setShowSettingsModal(false)}>Cancel</Button>
            <Button onClick={() => { setShowSettingsModal(false); toast('Settings saved successfully!'); }}>Save Changes</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Account Preferences</h4>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Configure notifications and user display options for this device.</p>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Email Notifications</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Receive digests for updates, attendance & circulars</p>
            </div>
            <input type="checkbox" checked={emailAlerts} onChange={e => setEmailAlerts(e.target.checked)} />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Sound Effects</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Play subtle audio chime on new notification toasts</p>
            </div>
            <input type="checkbox" checked={soundEffects} onChange={e => setSoundEffects(e.target.checked)} />
          </label>
        </div>
      </Modal>

      {/* ── PROFILE MODAL (Non-Student) ── */}
      <Modal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="User Profile Details"
        footer={<Button onClick={() => setShowProfileModal(false)}>Close</Button>}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
          <Avatar name={user.name} size="lg" color={user.avatarColor || accent} />
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user.role} • EduPortal Staff Roster</p>
            <span style={{ display: 'inline-block', marginTop: 4, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--success-light)', color: 'var(--success)', fontSize: 11, fontWeight: 600 }}>Active Session</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
          <div style={{ padding: 12, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Email Address</span>
            <strong style={{ color: 'var(--text-primary)' }}>{user.name.toLowerCase().replace(/\s+/g, '')}@school.edu</strong>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>System ID</span>
            <strong style={{ color: 'var(--text-primary)' }}>EMP-2024-009</strong>
          </div>
        </div>
      </Modal>
    </div>
  );
}
