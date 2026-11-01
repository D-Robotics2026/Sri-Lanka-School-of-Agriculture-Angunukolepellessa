import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemUser, UserRole } from '../types';
import { SEED_SYSTEM_USERS } from '../data/seedData';

interface AuthContextType {
  currentUser: SystemUser | null;
  login: (username: string, passwordHash: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  changePassword: (newPassword: string) => { success: boolean; error?: string };
  mustChangePasswordOpen: boolean;
  setMustChangePasswordOpen: (open: boolean) => void;
  allUsers: SystemUser[];
  updateUser: (user: SystemUser) => void;
  addUser: (user: Omit<SystemUser, 'id' | 'createdAt'>) => void;
}

const STORAGE_KEY_LOGGED_IN = 'loggedInUser';
const STORAGE_KEY_USERS = 'soa_system_users';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<SystemUser[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USERS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse system users from localStorage', e);
    }
    return SEED_SYSTEM_USERS;
  });

  const [currentUser, setCurrentUser] = useState<SystemUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LOGGED_IN);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse loggedInUser from localStorage', e);
    }
    // Default bootstrap user: superadmin
    return SEED_SYSTEM_USERS[0];
  });

  const [mustChangePasswordOpen, setMustChangePasswordOpen] = useState(false);

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  // Sync currentUser to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_LOGGED_IN, JSON.stringify(currentUser));
      if (currentUser.mustChangePassword) {
        setMustChangePasswordOpen(true);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY_LOGGED_IN);
    }
  }, [currentUser]);

  const login = (username: string, passwordInput: string) => {
    const found = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!found) {
      return { success: false, error: 'Invalid username or password.' };
    }

    if (found.passwordHash !== passwordInput) {
      return { success: false, error: 'Invalid credentials provided.' };
    }

    const updatedUser = {
      ...found,
      lastLogin: new Date().toISOString()
    };

    updateUser(updatedUser);
    setCurrentUser(updatedUser);

    if (updatedUser.mustChangePassword) {
      setMustChangePasswordOpen(true);
    }

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_LOGGED_IN);
  };

  const switchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      if (user.mustChangePassword) {
        setMustChangePasswordOpen(true);
      }
    }
  };

  const changePassword = (newPassword: string) => {
    if (!currentUser) return { success: false, error: 'No user logged in.' };
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const updated = {
      ...currentUser,
      passwordHash: newPassword,
      mustChangePassword: false
    };

    updateUser(updated);
    setCurrentUser(updated);
    setMustChangePasswordOpen(false);
    return { success: true };
  };

  const updateUser = (updatedUser: SystemUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const addUser = (newUser: Omit<SystemUser, 'id' | 'createdAt'>) => {
    const created: SystemUser = {
      ...newUser,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setUsers((prev) => [created, ...prev]);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        switchUser,
        changePassword,
        mustChangePasswordOpen,
        setMustChangePasswordOpen,
        allUsers: users,
        updateUser,
        addUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
