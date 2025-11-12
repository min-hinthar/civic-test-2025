
import { useState, useEffect, useCallback } from 'react';
import { User, TestSession } from '../types';

const USERS_DB_KEY = 'citizenshipQuizUsersDB';
const CURRENT_USER_EMAIL_KEY = 'citizenshipQuizCurrentUserEmail';

// Helper to get all users from our "DB"
const getUsersFromStorage = (): Record<string, User> => {
  try {
    const db = localStorage.getItem(USERS_DB_KEY);
    return db ? JSON.parse(db) : {};
  } catch (error) {
    console.error("Failed to parse users DB from localStorage", error);
    return {};
  }
};

// Helper to save all users to our "DB"
const saveUsersToStorage = (users: Record<string, User>) => {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUserEmail = localStorage.getItem(CURRENT_USER_EMAIL_KEY);
    if (currentUserEmail) {
      const users = getUsersFromStorage();
      const storedUser = users[currentUserEmail];
      if (storedUser) {
        setUser(storedUser);
      }
    }
  }, []);

  const login = useCallback((email: string, name: string) => {
    const users = getUsersFromStorage();
    let currentUser = users[email];

    if (!currentUser) {
      // Create a new user if one doesn't exist
      currentUser = { email, name, testHistory: [] };
    } else {
      // Or update their name if they log in again
      currentUser.name = name;
    }
    
    users[email] = currentUser;
    saveUsersToStorage(users);
    localStorage.setItem(CURRENT_USER_EMAIL_KEY, email);
    setUser(currentUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
  }, []);

  const addTestResult = useCallback((newTest: TestSession) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      
      const updatedUser: User = {
        ...currentUser,
        testHistory: [newTest, ...currentUser.testHistory], // Add new test to the beginning of the array
      };
      
      const users = getUsersFromStorage();
      users[updatedUser.email] = updatedUser;
      saveUsersToStorage(users);
      
      return updatedUser;
    });
  }, []);

  return { user, login, logout, addTestResult };
};
