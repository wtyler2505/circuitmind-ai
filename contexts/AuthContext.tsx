import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authService, User, UserRole } from '../services/authService';

interface Permissions {
  canEditInventory: boolean;
  canModifyDiagram: boolean;
  canViewAPIKeys: boolean;
  canDeleteData: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  isLocked: boolean;
  isSetup: boolean;
  permissions: Permissions;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  setup: (pin: string) => Promise<void>;
  lock: () => void;
}

const DEFAULT_PERMISSIONS: Permissions = {
  canEditInventory: false,
  canModifyDiagram: false,
  canViewAPIKeys: false,
  canDeleteData: false
};

const ROLE_PERMISSIONS: Record<UserRole, Permissions> = {
  admin: {
    canEditInventory: true,
    canModifyDiagram: true,
    canViewAPIKeys: true,
    canDeleteData: true
  },
  engineer: {
    canEditInventory: true,
    canModifyDiagram: true,
    canViewAPIKeys: false,
    canDeleteData: false
  },
  observer: {
    canEditInventory: false,
    canModifyDiagram: false,
    canViewAPIKeys: false,
    canDeleteData: false
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLocked, setIsLocked] = useState(authService.isSetup());
  const [isSetup, setIsSetup] = useState(authService.isSetup());

  const login = async (pin: string): Promise<boolean> => {
    const user = await authService.validatePin(pin);
    if (user) {
      setCurrentUser(user);
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const setup = async (pin: string): Promise<void> => {
    await authService.setupMasterPin(pin);
    setIsSetup(true);
    // Auto-login after setup
    await login(pin);
  };

  const logout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
    setIsLocked(true);
  }, []);

  const lock = useCallback(() => {
    setIsLocked(true);
  }, []);

  const permissions = currentUser 
    ? ROLE_PERMISSIONS[currentUser.role] 
    : DEFAULT_PERMISSIONS;

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLocked,
      isSetup,
      permissions,
      login,
      logout,
      setup,
      lock
    }}>
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
