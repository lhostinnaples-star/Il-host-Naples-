import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export enum UserRole {
  ADMIN = 'admin',
  HOTEL_OWNER = 'hotel_owner',
  CUSTOMER = 'customer',
  SUPPLIER = 'supplier',
  SERVICE_PROVIDER = 'service_provider'
}

export enum UserStatus {
  PENDING_VERIFICATION = 'pending_verification',
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended'
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  rejectionReason?: string;
  roleDetails?: any;
  supplierAccess?: 'none' | 'pending' | 'approved' | 'rejected';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole, phone?: string) => Promise<void>;
  loginAsDemo: (role: UserRole) => void;
  updateUser: (updates: Partial<User>) => void;
  updateUserStatus: (userId: string, status: UserStatus, reason?: string) => void;
  updateUserSupplierAccess: (userId: string, status: 'none' | 'pending' | 'approved' | 'rejected') => void;
  logout: () => void;
  isLoading: boolean;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const MOCK_USERS: Record<string, User> = {
  customer: {
    id: 'demo-customer',
    name: 'Marco Rossi',
    email: 'customer@demo.com',
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
    phone: '+39 333 123 4567'
  },
  lister: {
    id: 'demo-lister',
    name: 'Sofia Esposito',
    email: 'lister@demo.com',
    role: UserRole.HOTEL_OWNER,
    status: UserStatus.ACTIVE,
    phone: '+39 333 765 4321',
    supplierAccess: 'approved'
  },
  supplier: {
    id: 'demo-supplier',
    name: 'Pulizie Napoli Srl',
    email: 'supplier@demo.com',
    role: UserRole.SUPPLIER,
    status: UserStatus.ACTIVE,
    phone: '+39 081 555 1122'
  },
  service_provider: {
    id: 'demo-provider',
    name: 'Naples Tours & Transfers',
    email: 'provider@demo.com',
    role: UserRole.SERVICE_PROVIDER,
    status: UserStatus.ACTIVE,
    phone: '+39 081 999 8877'
  },
  admin: {
    id: 'demo-admin',
    name: 'Admin',
    email: 'admin@demo.com',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(localStorage.getItem('isDemoMode') === 'true');

  useEffect(() => {
    if (isDemoMode) {
      const demoUserRole = localStorage.getItem('demoRole');
      if (demoUserRole) {
        const userKey = demoUserRole === UserRole.HOTEL_OWNER ? 'lister' : 
                       demoUserRole === UserRole.SERVICE_PROVIDER ? 'service_provider' : 
                       demoUserRole;
        
        setUser(MOCK_USERS[userKey] || null);
      }
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocInfo = await getDoc(userDocRef);
          
          if (userDocInfo.exists()) {
            const data = userDocInfo.data();
            setUser({
              id: firebaseUser.uid,
              name: data.name || firebaseUser.displayName || 'User',
              email: data.email || firebaseUser.email || '',
              role: data.role as UserRole,
              status: data.status as UserStatus,
              phone: data.phone || '',
              supplierAccess: data.supplierAccess || 'none'
            });
          } else {
            // Fallback role logic: check if email matches a mock user
            const mockUser = Object.values(MOCK_USERS).find(u => u.email === firebaseUser.email);
            
            if (mockUser) {
              setUser({
                ...mockUser,
                id: firebaseUser.uid
              });
            } else {
              setUser({
                id: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                email: firebaseUser.email || '',
                role: UserRole.CUSTOMER,
                status: UserStatus.ACTIVE
              });
            }
          }
        } catch (error) {
          console.error("Error fetching user data setup", error);
          // Fallback role logic: check if email matches a mock user
          const mockUser = Object.values(MOCK_USERS).find(u => u.email === firebaseUser.email);
          
          if (mockUser) {
            setUser({
              ...mockUser,
              id: firebaseUser.uid
            });
          } else {
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              role: UserRole.CUSTOMER,
              status: UserStatus.ACTIVE
            });
          }
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  const login = React.useCallback((newToken: string, newUser: User) => {
    localStorage.removeItem('isDemoMode');
    localStorage.removeItem('demoRole');
    setIsDemoMode(false);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const signIn = React.useCallback(async (email: string, password: string) => {
    setIsDemoMode(false);
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUp = React.useCallback(async (email: string, password: string, name: string, role: UserRole, phone: string = '') => {
    setIsDemoMode(false);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    
    // Save the user profile to Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      name,
      email,
      phone,
      role,
      status: role === UserRole.CUSTOMER ? UserStatus.ACTIVE : UserStatus.PENDING_APPROVAL,
      createdAt: serverTimestamp(),
      supplierAccess: 'none',
      profilePhoto: '',
      bio: ''
    });
  }, []);

  const loginAsDemo = React.useCallback((role: UserRole) => {
    localStorage.setItem('isDemoMode', 'true');
    localStorage.setItem('demoRole', role);
    setIsDemoMode(true);
    
    const userKey = role === UserRole.HOTEL_OWNER ? 'lister' : 
                   role === UserRole.SERVICE_PROVIDER ? 'service_provider' : 
                   role;
    
    setUser(MOCK_USERS[userKey]);
    setToken('demo-token');
  }, []);

  const logout = React.useCallback(async () => {
    await signOut(auth);
    localStorage.removeItem('token');
    localStorage.removeItem('isDemoMode');
    localStorage.removeItem('demoRole');
    setToken(null);
    setUser(null);
    setIsDemoMode(false);
  }, []);

  const updateUser = React.useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const updateUserStatus = React.useCallback((userId: string, status: UserStatus, reason?: string) => {
    // In a real app, this would be an API call
    console.log(`Email notification sent to user ${userId}: Your account status is now ${status}${reason ? `. Reason: ${reason}` : ''}`);
    
    setUser(prev => {
      if (prev && prev.id === userId) {
        return { ...prev, status, rejectionReason: reason };
      }
      return prev;
    });

    // Also update in MOCK_USERS for demo purposes if needed
    // or persist in local storage if we were using it for users
  }, []);

  const updateUserSupplierAccess = React.useCallback((userId: string, status: 'none' | 'pending' | 'approved' | 'rejected') => {
    setUser(prev => {
      if (prev && prev.id === userId) {
        return { ...prev, supplierAccess: status };
      }
      return prev;
    });
    
    // Update MOCK_USERS so Admin sees the change
    const userToUpdate = Object.values(MOCK_USERS).find(u => u.id === userId);
    if (userToUpdate) {
      userToUpdate.supplierAccess = status;
    }
  }, []);

  const value = React.useMemo(() => ({ 
    user, 
    token, 
    login, 
    signIn,
    signUp,
    loginAsDemo, 
    updateUser,
    updateUserStatus,
    updateUserSupplierAccess,
    logout, 
    isLoading, 
    isDemoMode 
  }), [user, token, login, signIn, signUp, loginAsDemo, updateUser, updateUserStatus, updateUserSupplierAccess, logout, isLoading, isDemoMode]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
