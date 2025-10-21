import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { api } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set persistence to LOCAL
    setPersistence(auth, browserLocalPersistence);

    // Expose auth functions globally for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      (window as any).getFirebaseToken = async () => {
        if (auth.currentUser) {
          try {
            const token = await auth.currentUser.getIdToken();
            console.log('✅ Firebase Token:');
            console.log(token);
            console.log('\n🚀 Test command:');
            console.log(`curl -H "Authorization: Bearer ${token}" "http://localhost:3001/meetings?from=2024-10-16T00:00:00Z&to=2024-10-17T23:59:59Z"`);
            return token;
          } catch (error) {
            console.error('❌ Error getting token:', error);
            return null;
          }
        } else {
          console.log('❌ No user signed in. Please sign in first.');
          return null;
        }
      };
      
      (window as any).firebaseAuth = auth;
      console.log('🔧 Debug functions available:');
      console.log('- getFirebaseToken() - Get current user token');
      console.log('- firebaseAuth - Firebase auth instance');
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get user profile from backend
          const userData = await api.auth.getProfile();
          setUser(userData);
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: new Date(),
          });
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      // Send token to backend to establish session
      await api.auth.signInWithFirebase(idToken);
      
      // User state will be updated by onAuthStateChanged
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in with Google');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Sign out from backend first
      await api.auth.signOut();
      
      // Then sign out from Firebase
      await firebaseSignOut(auth);
      
      setUser(null);
      setFirebaseUser(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message || 'Failed to sign out');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        error,
        signInWithGoogle,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

