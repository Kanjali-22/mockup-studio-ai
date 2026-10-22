import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wand2, Image, BookOpen, Settings, Moon, Sun, Menu, X } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const navItems = [
  { to: '/', label: 'Studio', icon: Wand2 },
  { to: '/creations', label: 'My Creations', icon: Image },
  { to: '/prompt-guide', label: 'Prompt Guide', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Header({ darkMode, onToggleDarkMode }: HeaderProps) {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{
        backgroundColor: 'rgba(250, 248, 245, 0.90)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-7 h-7 rounded-lg bg-accent-600 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-semibold text-sm text-primary">Mockup Studio</span>
            <span className="font-semibold text-sm text-accent-600"> AI</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`nav-item ${pathname === to ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDarkMode}
            className="btn-ghost p-2 rounded-lg"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden btn-ghost p-2 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t px-4 py-3 flex flex-col gap-1 animate-slide-up"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}
        >
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`nav-item ${pathname === to ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
