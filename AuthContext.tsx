
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { auth, db } from './firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

interface AuthContextType {
  user: User | null;
  userData: any;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        
        // Ensure user document exists (useful for Google Login or first-time sync)
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
          const initialData = {
            username: currentUser.displayName || currentUser.email?.split('@')[0] || "User",
            email: currentUser.email,
            total_words_read: 0,
            reading_time: 0,
            sessions: [],
            createdAt: Date.now()
          };
          await setDoc(userRef, initialData);
        }

        // Set up a real-time listener for the user's data (stats, sessions, etc.)
        const unsubscribeDoc = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.data());
          }
        });

        setLoading(false);
        return () => unsubscribeDoc();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
