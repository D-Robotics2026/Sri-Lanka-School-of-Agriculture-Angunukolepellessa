import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemUser, UserRole } from '../types';
import { subscribeToCollection, saveFirestoreDoc } from '../firebase/syncService';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, FIREBASE_DB_NAME } from '../firebase/config';
import { syncAllUsersToFirebaseAuth, createFirebaseAuthAccount } from '../firebase/authService';

export const BOOTSTRAP_SUPERADMIN: SystemUser = {
  id: 'user-superadmin',
  username: 'superadmin',
  passwordHash: 'admin123',
  role: 'super_admin',
  fullName: 'Director / Super Administrator',
  email: 'admin.soa@doa.gov.lk',
  phone: '+94 47 222 8234',
  mustChangePassword: false,
  createdAt: '2024-01-01T08:00:00Z',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
};

interface AuthContextType {
  currentUser: SystemUser | null;
  firebaseUser: FirebaseUser | null;
  firebaseAuthStatus: 'connected' | 'unauthenticated' | 'error';
  databaseName: string;
  login: (
    identifier: string,
    passwordHash: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
  }) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  mustChangePasswordOpen: boolean;
  setMustChangePasswordOpen: (open: boolean) => void;
  allUsers: SystemUser[];
  updateUser: (user: SystemUser) => void;
  addUser: (user: Omit<SystemUser, 'id' | 'createdAt'>) => Promise<void>;
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
    return [BOOTSTRAP_SUPERADMIN];
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
    return null;
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [firebaseAuthStatus, setFirebaseAuthStatus] = useState<'connected' | 'unauthenticated' | 'error'>('unauthenticated');
  const [mustChangePasswordOpen, setMustChangePasswordOpen] = useState(false);

  // Real-time synchronization with Firebase Authentication
  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      (user) => {
        setFirebaseUser(user);
        setFirebaseAuthStatus(user ? 'connected' : 'unauthenticated');
      },
      (err) => {
        console.warn('Firebase Auth listener:', err);
        setFirebaseAuthStatus('error');
      }
    );
    return () => unsub();
  }, []);

  // Real-time synchronization with Firestore collection "users"
  useEffect(() => {
    const unsub = subscribeToCollection<SystemUser>('users', (cloudUsers) => {
      if (cloudUsers.length > 0) {
        setUsers(cloudUsers);
      } else {
        // If Firestore users collection is currently empty, save bootstrap superadmin to cloud
        saveFirestoreDoc('users', BOOTSTRAP_SUPERADMIN.id, BOOTSTRAP_SUPERADMIN);
      }
    });
    return () => unsub();
  }, []);

  // Auto-provision system users to Firebase Authentication
  useEffect(() => {
    if (users.length > 0) {
      syncAllUsersToFirebaseAuth(users).catch((err) => {
        console.warn('Firebase Auth user sync notice:', err);
      });
    }
  }, [users.length]);

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

  const login = async (
    identifier: string,
    passwordInput: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanId = identifier.trim().toLowerCase();

    // 1. Locate user in registry
    let found = users.find(
      (u) => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
    );

    // If identifier matches bootstrap credentials
    if (!found && (cleanId === 'superadmin' || cleanId === 'admin.soa@doa.gov.lk')) {
      found = BOOTSTRAP_SUPERADMIN;
    }

    if (!found) {
      // Check if user account was created directly in Firebase Auth
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanId, passwordInput);
        if (cred.user) {
          const userFromAuth: SystemUser = {
            id: cred.user.uid,
            username: cred.user.email?.split('@')[0] || 'user',
            passwordHash: passwordInput,
            role: 'student',
            fullName: cred.user.displayName || cred.user.email?.split('@')[0] || 'Student User',
            email: cred.user.email || cleanId,
            phone: cred.user.phoneNumber || '',
            mustChangePassword: false,
            createdAt: new Date().toISOString()
          };
          saveFirestoreDoc('users', userFromAuth.id, userFromAuth);
          setUsers((prev) => [userFromAuth, ...prev]);
          setCurrentUser(userFromAuth);
          return { success: true };
        }
      } catch (authDirectErr) {
        // Continue to error return
      }

      return {
        success: false,
        error: 'No registered user found matching this Username, ID, or Email.'
      };
    }

    if (found.passwordHash !== passwordInput) {
      return { success: false, error: 'Invalid password credentials provided.' };
    }

    // 2. Synchronize authentication state with Firebase Authentication
    const authEmail = found.email || `${found.username}@soa.doa.gov.lk`;
    try {
      await signInWithEmailAndPassword(auth, authEmail, passwordInput);
    } catch (authErr: any) {
      if (authErr.code === 'auth/operation-not-allowed') {
        console.warn('Firebase Auth: Email/Password provider is disabled in Firebase Console.');
      } else if (
        authErr.code === 'auth/user-not-found' ||
        authErr.code === 'auth/invalid-credential' ||
        authErr.code === 'auth/invalid-email'
      ) {
        // Auto-provision user into Firebase Authentication
        try {
          await createUserWithEmailAndPassword(auth, authEmail, passwordInput);
        } catch (createErr) {
          console.warn('Firebase Auth auto-provision notice:', createErr);
        }
      } else {
        console.warn('Firebase Auth signin notice:', authErr?.message);
      }
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

  const register = (data: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
  }) => {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

    if (!data.fullName.trim()) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!cleanUsername) {
      return { success: false, error: 'Username is required.' };
    }
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: 'Username is already taken.' };
    }
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Email is already registered.' };
    }
    if (data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const newUser: SystemUser = {
      id: `user-${Date.now()}`,
      username: cleanUsername,
      passwordHash: data.password,
      role: data.role,
      fullName: data.fullName.trim(),
      email: cleanEmail,
      phone: data.phone?.trim() || '',
      mustChangePassword: false,
      createdAt: new Date().toISOString(),
      avatar:
        data.role === 'student'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
    };

    setUsers((prev) => [newUser, ...prev]);
    saveFirestoreDoc('users', newUser.id, newUser);

    // Sync to Firebase Auth
    try {
      createUserWithEmailAndPassword(auth, cleanEmail, data.password).catch(() => {});
    } catch {}

    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    try {
      signOut(auth);
    } catch {}
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

  const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
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

    // Sync password update to Firebase Auth
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
      }
    } catch (e) {
      console.warn('Firebase Auth update password notice:', e);
    }

    return { success: true };
  };

  const updateUser = (updatedUser: SystemUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    saveFirestoreDoc('users', updatedUser.id, updatedUser);
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const addUser = async (newUser: Omit<SystemUser, 'id' | 'createdAt'>): Promise<void> => {
    const created: SystemUser = {
      ...newUser,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setUsers((prev) => [created, ...prev]);
    saveFirestoreDoc('users', created.id, created);

    // Sync user to Firebase Authentication safely without switching active session
    try {
      const email =
        created.email && created.email.includes('@')
          ? created.email
          : `${created.username.toLowerCase().replace(/[^a-z0-9]/g, '')}@soa.doa.gov.lk`;
      const pass = created.passwordHash && created.passwordHash.length >= 6 ? created.passwordHash : 'Admin@123';
      await createFirebaseAuthAccount(email, pass);
    } catch (e) {
      console.warn('Firebase Auth user creation notice:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        firebaseAuthStatus,
        databaseName: FIREBASE_DB_NAME,
        login,
        register,
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
