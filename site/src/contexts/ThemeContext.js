import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';

const ThemeContext = createContext(null);

export const ThemeProviderCustom = ({ children }) => {
  const stored = (() => {
    try { return localStorage.getItem('theme'); } catch { return null; }
  })();
  const userTema = !!(authService.getCurrentUser()?.tema);
  const initial = stored || (userTema ? 'dark' : 'light');

  const [theme, setTheme] = useState(initial);

  useEffect(() => {
    try { localStorage.setItem('theme', theme); } catch {}
    const root = document.getElementById('root');
    if (!root) return;
    if (theme === 'dark') root.classList.add('theme-dark'); else root.classList.remove('theme-dark');
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useThemeCustom = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeCustom must be used within ThemeProviderCustom');
  return ctx;
};


