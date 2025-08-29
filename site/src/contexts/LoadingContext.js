import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

const LoadingContext = createContext(null);

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const networkCountRef = useRef(0);
  const manualCountRef = useRef(0);
  const hideTimerRef = useRef(null);
  const interceptorsRef = useRef({ request: null, response: null });

  const updateVisibility = (withDelay = false) => {
    const shouldShow = networkCountRef.current > 0 || manualCountRef.current > 0;
    if (shouldShow) {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      setIsLoading(true);
      return;
    }
    // no work pending: optionally delay hiding to prevent flicker
    const hide = () => setIsLoading(false);
    if (withDelay) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        hideTimerRef.current = null;
        hide();
      }, 120);
    } else {
      hide();
    }
  };

  const incrementNetwork = () => {
    networkCountRef.current += 1;
    updateVisibility(false);
  };

  const decrementNetwork = () => {
    networkCountRef.current = Math.max(0, networkCountRef.current - 1);
    updateVisibility(true);
  };

  // Allow manual control (e.g., on navigation transitions)
  const startLoading = () => {
    manualCountRef.current += 1;
    updateVisibility(false);
  };
  const stopLoading = () => {
    manualCountRef.current = Math.max(0, manualCountRef.current - 1);
    updateVisibility(true);
  };

  useEffect(() => {
    // Register axios interceptors once
    if (!interceptorsRef.current.request) {
      interceptorsRef.current.request = axios.interceptors.request.use((config) => {
        incrementNetwork();
        return config;
      });
    }

    if (!interceptorsRef.current.response) {
      interceptorsRef.current.response = axios.interceptors.response.use(
        (response) => {
          decrementNetwork();
          return response;
        },
        (error) => {
          decrementNetwork();
          return Promise.reject(error);
        }
      );
    }

    return () => {
      // Eject on unmount to avoid leaks in tests/hot reloads
      if (interceptorsRef.current.request !== null) {
        axios.interceptors.request.eject(interceptorsRef.current.request);
        interceptorsRef.current.request = null;
      }
      if (interceptorsRef.current.response !== null) {
        axios.interceptors.response.eject(interceptorsRef.current.response);
        interceptorsRef.current.response = null;
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, []);

  const value = useMemo(() => ({
    isLoading,
    startLoading,
    stopLoading
  }), [isLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
  return ctx;
};


