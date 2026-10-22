import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Studio from './pages/Studio';
import Creations from './pages/Creations';
import PromptGuide from './pages/PromptGuide';
import Settings from './pages/Settings';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('mockup-studio-theme');
      if (stored !== null) {
        return stored === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mockup-studio-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mockup-studio-theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-canvas text-primary selection:bg-accent-500 selection:text-white transition-colors">
        <Header darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Studio />} />
            <Route path="/creations" element={<Creations />} />
            <Route path="/prompt-guide" element={<PromptGuide />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="border-t border-divider py-6 text-center text-xs text-secondary mt-auto">
          <div className="max-w-[1400px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-primary">Mockup Studio AI</span> &copy;{' '}
              {new Date().getFullYear()} — Powered by Stability AI
            </div>
            <div className="flex items-center gap-4 text-[11px] text-muted">
              <span>Stable Image Core & Ultra</span>
              <span>•</span>
              <span>Local IndexedDB Gallery</span>
              <span>•</span>
              <span>Zero-Cloud Retention</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
