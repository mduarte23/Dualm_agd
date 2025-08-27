import React, { createContext, useContext, useMemo, useState } from 'react';

const StackNavContext = createContext(null);

export const StackNavProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('login'); // 'login' | 'dashboard' | 'about' | 'contact'

  const value = useMemo(() => ({ currentPage, setCurrentPage }), [currentPage]);
  return (
    <StackNavContext.Provider value={value}>
      {children}
    </StackNavContext.Provider>
  );
};

export const useStackNav = () => {
  const ctx = useContext(StackNavContext);
  if (!ctx) throw new Error('useStackNav must be used within StackNavProvider');
  return ctx;
};


