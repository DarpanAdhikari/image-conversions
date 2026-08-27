import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Features' },
  { path: '/editor', label: 'Editor' },
  { path: '/converter', label: 'Converter' },
  { path: '/metadata', label: 'Metadata' },
  { path: '/batch', label: 'Batch' },
  { path: '/playground', label: 'Playground' },
  { path: '/docs', label: 'Docs' },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="layout">
      <header className="header">
        <div className="header-inner container">
          <Link to="/" className="logo">
            <img
              src="https://www.darpanadhikari.com.np/images/logo.ico"
              alt="DRP"
              className="logo-icon"
            />
            <span className="logo-text">DRP</span>
            <span className="logo-tag">Digital Resolution Pro</span>
          </Link>

          <nav className="nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${
                  location.pathname === item.path ? 'active' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <button
              className="btn btn-ghost btn-sm theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/drp-imagesdk"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
            >
              npm
            </a>
          </div>
        </div>
      </header>

      <main className="main">{children}</main>

      <footer className="footer">
        <div className="container footer-inner">
          <p>© 2024 DRP - Digital Resolution Pro. Built with real image processing.</p>
        </div>
      </footer>
    </div>
  );
}
