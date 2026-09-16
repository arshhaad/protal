/* ============================================================
   EDUPORTAL — Shared UI Component Library
   All primitive components: Button, Badge, Card, Input,
   Table, Modal, Toast, Skeleton, EmptyState, etc.
   ============================================================ */
import { useState, useEffect, useRef, createContext, useContext } from 'react';
import './ui.css';

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
      {!loading && icon && <span className="btn-icon btn-icon--left" aria-hidden="true">{icon}</span>}
      {children}
      {!loading && iconRight && <span className="btn-icon btn-icon--right" aria-hidden="true">{iconRight}</span>}
    </button>
  );
}

/* ── BADGE ───────────────────────────────────────────────── */
const BADGE_VARIANTS = {
  active:     'badge--success',
  inactive:   'badge--neutral',
  pending:    'badge--warning',
  approved:   'badge--success',
  rejected:   'badge--danger',
  paid:       'badge--success',
  unpaid:     'badge--danger',
  overdue:    'badge--danger',
  open:       'badge--info',
  in_progress:'badge--warning',
  resolved:   'badge--success',
  closed:     'badge--neutral',
  submitted:  'badge--info',
  graded:     'badge--success',
  present:    'badge--success',
  absent:     'badge--danger',
  late:       'badge--warning',
  leave:      'badge--info',
  excellent:  'badge--success',
  good:       'badge--info',
  average:    'badge--warning',
  at_risk:    'badge--danger',
};

export function Badge({ label, variant, dot = false }) {
  const cls = BADGE_VARIANTS[variant?.toLowerCase()] || BADGE_VARIANTS[label?.toLowerCase()] || 'badge--neutral';
  return (
    <span className={`badge ${cls}`}>
      {dot && <span className="badge-dot" aria-hidden="true" />}
      {label}
    </span>
  );
}

/* ── CARD ────────────────────────────────────────────────── */
export function Card({ children, className = '', padding = true, hover = false }) {
  return (
    <div className={`card ${padding ? 'card--padded' : ''} ${hover ? 'card--hover' : ''} ${className}`}>
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
export function StatCard({ icon, label, value, change, changeType = 'neutral', color = 'accent' }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__icon" aria-hidden="true">{icon}</div>
      <div className="stat-card__body">
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
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
        {icon && <span className="field-icon field-icon--left" aria-hidden="true">{icon}</span>}
        <input
          id={id}
          className={`field-input ${icon ? 'field-input--icon-left' : ''} ${iconRight ? 'field-input--icon-right' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...rest}
        />
        {iconRight && <span className="field-icon field-icon--right" aria-hidden="true">{iconRight}</span>}
      </div>
      {hint && !error && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="field-error" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  );
}

export function Select({ label, id, error, hint, children, required, className = '', ...rest }) {
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
          {required && <span className="field-required"> *</span>}
        </label>
      )}
      <div className="field-wrap">
        <select id={id} className="field-input field-select" {...rest}>
          {children}
        </select>
        <span className="field-icon field-icon--right select-arrow" aria-hidden="true">▾</span>
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
        <span className="field-icon field-icon--left" aria-hidden="true">🔒</span>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className="field-input field-input--icon-left field-input--icon-right"
          aria-invalid={!!error}
          {...rest}
        />
        <button
          type="button"
          className="field-icon field-icon--right pwd-toggle"
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? '🙈' : '👁️'}
        </button>
      </div>
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}

/* ── TABLE ───────────────────────────────────────────────── */
export function Table({ columns, data, loading = false, empty = 'No data found.', emptyAction }) {
  if (loading) {
    return (
      <div className="table-wrap">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 44, marginBottom: 6 }} />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <EmptyState
        icon="📋"
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
              <th key={col.key} style={col.width ? { width: col.width } : {}}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id ?? i}>
              {columns.map(col => (
                <td key={col.key} data-label={col.label}>
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
          <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
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

  const add = (msg, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  };

  const remove = (id) => setToasts(t => t.filter(x => x.id !== id));

  return (
    <ToastContext.Provider value={add}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.type}`} role="alert">
            <span className="toast-icon">
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : 'ℹ'}
            </span>
            <span className="toast-msg">{t.msg}</span>
            <button className="toast-close" onClick={() => remove(t.id)} aria-label="Dismiss">✕</button>
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

/* ── EMPTY STATE ─────────────────────────────────────────── */
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon" aria-hidden="true">{icon}</div>}
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__desc">{description}</p>}
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
export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`search-input ${className}`}>
      <span className="search-input__icon" aria-hidden="true">🔍</span>
      <input
        type="search"
        className="search-input__field"
        value={value}
        onChange={e => onChange(e.target.value)}
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
          key={tab.value}
          role="tab"
          aria-selected={active === tab.value}
          className={`tab ${active === tab.value ? 'tab--active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
          {tab.label}
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

/* ── THEME TOGGLE ────────────────────────────────────────── */
export function ThemeToggle() {
  // Imported separately per layout to avoid circular deps
  // This is a placeholder — actual component in ThemeToggle.jsx
  return null;
}
