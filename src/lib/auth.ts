import type { User } from '@/types';

const AUTH_USER_KEY = 'reservistaAuthUser';

// Mock database of users
const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin', createdAt: new Date().toISOString() },
  { id: '2', name: 'Staff User', email: 'staff@example.com', role: 'staff', createdAt: new Date().toISOString() },
];

export const login = async (email?: string, password?: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email || !password) {
        return reject(new Error('Email and password are required.'));
      }
      const user = mockUsers.find(u => u.email === email);
      // In a real app, you would verify the password hash here
      if (user && password === 'password') { // Using a generic password for mock
        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        }
        resolve(user);
      } else {
        reject(new Error('Invalid email or password.'));
      }
    }, 500);
  });
};

export const logout = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_USER_KEY);
    }
    resolve();
  });
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  try {
    return userStr ? JSON.parse(userStr) as User : null;
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};
