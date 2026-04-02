'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to retrieve user and role information from localStorage.
 * Safe for SSR - returns empty state initially, populates on client mount.
 * @returns {{ user: Object, isAdmin: Boolean, isStaff: Boolean }}
 */
export const useUser = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userJson = localStorage.getItem('user');
        const userData = userJson ? JSON.parse(userJson) : null;

        if (userData) {
          setUser(userData);
          setIsAdmin(userData.role === 'ADMIN');
          setIsStaff(userData.role === 'STAFF');
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
      }
    }
  }, []);

  return { user, isAdmin, isStaff };
};
