/* ============================================================
   EDUPORTAL — Shared UI Component Library
   Premium Component Architecture: Button, Badge, Card, StatCard,
   Input, Table, Modal, Toast, Skeleton, EmptyState, Icon, etc.
   ============================================================ */
import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Icon } from './Icons';
import './ui.css';

export { Icon };

/* ── BUTTON ──────────────────────────────────────────────── */
export function Button({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false,
  icon, iconRight, fullWidth = false,
  className = '', onClick, type = 'button', ...rest
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      {!loading && icon && (
        <span className="btn-icon btn-icon--left" aria-hidden="true">
          {typeof icon === 'string' && !icon.includes('<') && icon.length < 20 ? (
            ['+', '✓', '✗', '💾', '📢', '⏰', '🚪', '📝'].includes(icon) || icon.charCodeAt(0) > 255 ? (
              icon === '+' ? <Icon name="plus" size={15} /> :
              icon === '✓' ? <Icon name="check" size={15} /> :
              icon === '💾' ? <Icon name="tasks" size={15} /> :
              icon === '📢' ? <Icon name="announcements" size={15} /> :
              icon === '⏰' ? <Icon name="clock" size={15} /> :
              icon === '🚪' ? <Icon name="logout" size={15} /> :
              <span>{icon}</span>
            ) : (
              <Icon name={icon} size={15} />
            )
          ) : (
            icon
          )}
        </span>
      )}
      <span>{children}</span>
      {!loading && iconRight && (
        <span className="btn-icon btn-icon--right" aria-hidden="true">
          {typeof iconRight === 'string' ? <Icon name={iconRight} size={15} /> : iconRight}
        </span>
      )}
    </button>
  );
}

/* ── BADGE ───────────────────────────────────────────────── */
const BADGE_VARIANTS = {
  active:      'badge--success',
  inactive:    'badge--neutral',
  pending:     'badge--warning',
  approved:    'badge--success',
  rejected:    'badge--danger',
  paid:        'badge--success',
  unpaid:      'badge--danger',
  overdue:     'badge--danger',
  open:        'badge--info',
  in_progress: 'badge--warning',
  resolved:    'badge--success',
  closed:      'badge--neutral',
  submitted:   'badge--info',
  graded:      'badge--success',
  present:     'badge--success',
  absent:      'badge--danger',
  late:        'badge--warning',
  leave:       'badge--info',
  excellent:   'badge--success',
  good:        'badge--info',
  average:     'badge--warning',
  at_risk:     'badge--danger',
  high:        'badge--danger',
  medium:      'badge--warning',
  normal:      'badge--success',
};

export function Badge({ label, variant, dot = false }) {
  const v = (variant || label || 'neutral').toLowerCase();
  const cls = BADGE_VARIANTS[v] || 'badge--neutral';
  return (
    <span className={`badge ${cls}`}>
      {dot && <span className="badge-dot" aria-hidden="true" />}
      {label}
    </span>
  );
}

/* ── CARD ────────────────────────────────────────────────── */
export function Card({ children, className = '', padding = true, hover = false, style = {} }) {
  return (
    <div className={`card ${padding ? 'card--padded' : ''} ${hover ? 'card--hover' : ''} ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="card-header">
      <div>
        <h3 className="card-title">{title}</h3>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="card-action">{action}</div>}
    </div>
  );
}

/* ── STAT CARD ───────────────────────────────────────────── */
export function StatCard({ icon, label, title, value, change, changeType = 'neutral', color = 'accent' }) {
  const displayLabel = label || title;
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      if (['🎓', '👨‍🏫', '📅', '✅', '🎟️', '📈', '👥', '📚', '📋', '💳', '🗓️', '🏆', '⚠️', '📊'].includes(icon) || icon.length <= 4) {
        const iconMap = {
          '🎓': 'students',
          '👨‍🏫': 'staff',
          '📅': 'attendance',
          '✅': 'check',
          '🎟️': 'tickets',
          '📈': 'trendingUp',
          '👥': 'users',
          '📚': 'courses',
          '📋': 'tasks',
          '💳': 'payment',
          '🗓️': 'calendar',
          '🏆': 'star',
          '⚠️': 'tickets',
          '📊': 'reports',
        };
        const iconName = iconMap[icon] || 'sparkles';
        return <Icon name={iconName} size={22} />;
      }
      return <Icon name={icon} size={22} />;
    }
    return icon;
  };

  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__icon-wrap">
        <div className="stat-card__icon" aria-hidden="true">{renderIcon()}</div>
      </div>
      <div className="stat-card__body">
        <p className="stat-card__label">{displayLabel}</p>
        <p className="stat-card__value">{value ?? '0'}</p>
        {change && (
          <p className={`stat-card__change stat-card__change--${changeType}`}>
            {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : ''} {change}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── INPUT ───────────────────────────────────────────────── */
export function Input({
  label, id, error, hint, icon, iconRight,
  className = '', required, ...rest
}) {
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
          {required && <span className="field-required" aria-label="required"> *</span>}
        </label>
      )}
      <div className="field-wrap">
        {icon && (
          <span className="field-icon field-icon--left" aria-hidden="true">
            {typeof icon === 'string' ? <Icon name={icon} size={16} /> : icon}
          </span>
        )}
        <input
          id={id}
          className={`field-input ${icon ? 'field-input--icon-left' : ''} ${iconRight ? 'field-input--icon-right' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          required={required}
          {...rest}
        />
        {iconRight && (
          <span className="field-icon field-icon--right" aria-hidden="true">
            {typeof iconRight === 'string' ? <Icon name={iconRight} size={16} /> : iconRight}
          </span>
        )}
      </div>
      {hint && !error && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="field-error" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  );
}

export function Select({ label, id, error, hint, children, required, className = '', options, ...rest }) {
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
          {required && <span className="field-required"> *</span>}
        </label>
      )}
      <div className="field-wrap">
        <select id={id} className="field-input field-select" aria-invalid={!!error} required={required} {...rest}>
          {options ? (
            options.map((opt, i) => (
              <option key={opt.value ?? i} value={opt.value}>
                {opt.label ?? opt.value}
              </option>
            ))
          ) : (
            children
          )}
        </select>
        <span className="field-icon field-icon--right select-arrow" aria-hidden="true">
          <Icon name="chevronDown" size={14} />
        </span>
      </div>
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}

export function Textarea({ label, id, error, hint, required, className = '', ...rest }) {
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
          {required && <span className="field-required"> *</span>}
        </label>
      )}
      <textarea
        id={id}
        className="field-input field-textarea"
        aria-invalid={!!error}
        required={required}
        {...rest}
      />
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}

/* ── PASSWORD INPUT ─────────────────────────────────────── */
export function PasswordInput({ label, id, error, hint, required, className = '', ...rest }) {
  const [show, setShow] = useState(false);
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
          {required && <span className="field-required"> *</span>}
        </label>
      )}
      <div className="field-wrap">
        <span className="field-icon field-icon--left" aria-hidden="true">
          <Icon name="lock" size={16} />
        </span>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className="field-input field-input--icon-left field-input--icon-right"
          aria-invalid={!!error}
          required={required}
          {...rest}
        />
        <button
          type="button"
          className="field-icon field-icon--right pwd-toggle"
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          <Icon name="eye" size={16} />
        </button>
      </div>
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}

/* ── TABLE ───────────────────────────────────────────────── */
export function Table({ columns, data, loading = false, empty = 'No records found.', emptyAction }) {
  if (loading) {
    return (
      <div className="table-wrap">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8, borderRadius: 8 }} />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <EmptyState
        icon="tasks"
        title={typeof empty === 'string' ? empty : 'No records found'}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="table-wrap" role="region" aria-label="Data table" tabIndex={0}>
      <table className="table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key || col.label} style={col.width ? { width: col.width } : {}}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id ?? i}>
              {columns.map(col => (
                <td key={col.key || col.label} data-label={col.label}>
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── MODAL ───────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className={`modal modal--${size}`}>
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

/* ── TOAST SYSTEM ────────────────────────────────────────── */
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const lastValidationToast = useRef(0);

  const add = (msg, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  };

  const remove = (id) => setToasts(t => t.filter(x => x.id !== id));

  useEffect(() => {
    const handleToast = (event) => {
      const { message, type = 'info', duration } = event.detail || {};
      if (message) add(message, type, duration);
    };
    const handleInvalid = (event) => {
      // Native validation also applies to inputs inside modals and forms whose
      // submit button is rendered in a modal footer.
      if (Date.now() - lastValidationToast.current < 750) return;
      lastValidationToast.current = Date.now();
      const field = event.target;
      const label = field.labels?.[0]?.textContent?.replace('*', '').trim() || field.name || 'field';
      add(field.validationMessage || `Please enter a valid ${label}.`, 'error');
    };
    window.addEventListener('portal:toast', handleToast);
    document.addEventListener('invalid', handleInvalid, true);
    return () => {
      window.removeEventListener('portal:toast', handleToast);
      document.removeEventListener('invalid', handleInvalid, true);
    };
  }, []);

  return (
    <ToastContext.Provider value={add}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.type}`} role="alert">
            <span className="toast-icon">
              {t.type === 'success' ? <Icon name="check" size={16} /> :
               t.type === 'error' ? <Icon name="x" size={16} /> :
               <Icon name="announcements" size={16} />}
            </span>
            <span className="toast-msg">{t.msg}</span>
            <button className="toast-close" onClick={() => remove(t.id)} aria-label="Dismiss">
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
};

// Lets non-React code (the API client) show the same accessible notification.
export function showToast(message, type = 'success', duration = 4000) {
  window.dispatchEvent(new CustomEvent('portal:toast', { detail: { message, type, duration } }));
}

/* ── EMPTY STATE ─────────────────────────────────────────── */
export function EmptyState({ icon = 'tasks', title, subtitle, description, action }) {
  const desc = description || subtitle;
  const renderIcon = () => {
    if (typeof icon === 'string') {
      if (['👥', '📋', '🔔', '📚', '🎟️', '🎓', '👨‍🏫', '💳', '🗓️', '📅'].includes(icon)) {
        const map = {
          '👥': 'users',
          '📋': 'tasks',
          '🔔': 'announcements',
          '📚': 'courses',
          '🎟️': 'tickets',
          '🎓': 'students',
          '👨‍🏫': 'staff',
          '💳': 'payment',
          '🗓️': 'leave',
          '📅': 'calendar',
        };
        return <Icon name={map[icon] || 'sparkles'} size={32} />;
      }
      return <Icon name={icon} size={32} />;
    }
    return icon;
  };

  return (
    <div className="empty-state">
      <div className="empty-state__icon-halo">
        <div className="empty-state__icon">{renderIcon()}</div>
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {desc && <p className="empty-state__desc">{desc}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}

/* ── SKELETON ROWS ───────────────────────────────────────── */
export function SkeletonRows({ rows = 5, cols = 4 }) {
  return (
    <div className="skeleton-table">
      {[...Array(rows)].map((_, r) => (
        <div key={r} className="skeleton-row">
          {[...Array(cols)].map((_, c) => (
            <div key={c} className="skeleton" style={{ height: 16, flex: 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── SEARCH INPUT ────────────────────────────────────────── */
export function SearchInput({ value, onChange, placeholder = 'Search…', className = '', style = {} }) {
  return (
    <div className={`search-input ${className}`} style={style}>
      <span className="search-input__icon" aria-hidden="true">
        <Icon name="search" size={16} />
      </span>
      <input
        type="search"
        className="search-input__field"
        value={value}
        onChange={typeof onChange === 'function' ? (e => onChange(e.target ? e.target.value : e)) : undefined}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}

/* ── TABS ────────────────────────────────────────────────── */
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.value || tab.key}
          role="tab"
          aria-selected={active === (tab.value || tab.key)}
          className={`tab ${active === (tab.value || tab.key) ? 'tab--active' : ''}`}
          onClick={() => onChange(tab.value || tab.key)}
        >
          {tab.icon && <span className="tab-icon">{typeof tab.icon === 'string' ? <Icon name={tab.icon} size={14} /> : tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.count != null && <span className="tab-count">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ── CONFIRMATION DIALOG ─────────────────────────────────── */
export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Delete', variant = 'danger' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant={variant} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
        </div>
      }
    >
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-base)' }}>{description}</p>
    </Modal>
  );
}

/* ── PAGE HEADER ─────────────────────────────────────────── */
export function PageHeader({ title, subtitle, action, breadcrumb }) {
  return (
    <div className="page-header">
      {breadcrumb && <p className="breadcrumb">{breadcrumb}</p>}
      <div className="page-header__row">
        <div>
          <h1 className="page-header__title">{title}</h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
        {action && <div className="page-header__action">{action}</div>}
      </div>
    </div>
  );
}

/* ── DIVIDER ─────────────────────────────────────────────── */
export function Divider({ label }) {
  if (label) return (
    <div className="divider divider--label">
      <span className="divider-text">{label}</span>
    </div>
  );
  return <hr className="divider" />;
}

/* ── AVATAR ──────────────────────────────────────────────── */
export function Avatar({ name = '', size = 'md', src, color }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  if (src) return <img src={src} alt={name} className={`avatar avatar--${size}`} />;
  return (
    <div
      className={`avatar avatar--${size} avatar--initials`}
      aria-label={name}
      style={color ? { background: color } : {}}
    >
      {initials}
    </div>
  );
}

/* ── PROGRESS BAR ────────────────────────────────────────── */
export function ProgressBar({ value, max = 100, color = 'accent', label, size = 'md' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`progress progress--${size}`}>
      {label && <div className="progress-label">{label}<span>{Math.round(pct)}%</span></div>}
      <div className="progress-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={`progress-fill progress-fill--${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
