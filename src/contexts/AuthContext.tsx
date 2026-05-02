import React, { createContext, useContext, useState, useEffect } from 'react';

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
  roleDetails?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  loginAsDemo: (role: UserRole) => void;
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
    phone: '+39 333 765 4321'
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
    const fetchUser = async () => {
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

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
          setToken(null);
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token, isDemoMode]);

  const login = React.useCallback((newToken: string, newUser: User) => {
    localStorage.removeItem('isDemoMode');
    localStorage.removeItem('demoRole');
    setIsDemoMode(false);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
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

  const logout = React.useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('isDemoMode');
    localStorage.removeItem('demoRole');
    setToken(null);
    setUser(null);
    setIsDemoMode(false);
  }, []);

  const value = React.useMemo(() => ({ 
    user, 
    token, 
    login, 
    loginAsDemo, 
    logout, 
    isLoading, 
    isDemoMode 
  }), [user, token, login, loginAsDemo, logout, isLoading, isDemoMode]);

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
