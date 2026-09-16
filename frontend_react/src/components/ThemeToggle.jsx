import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      className={`theme-toggle ${isDark ? 'theme-toggle--dark' : ''}`}
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb">
          <span className="theme-toggle__icon" aria-hidden="true">
            {isDark ? '🌙' : '☀️'}
          </span>
        </span>
      </span>
    </button>
  );
}
