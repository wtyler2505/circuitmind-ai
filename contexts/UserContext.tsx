import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userProfileService, UserProfile } from '../services/userProfileService';

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserProfile['preferences']>) => Promise<void>;
  switchProfile: (id: string) => Promise<void>;
  updateExpertise: (level: UserProfile['expertise']) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const profile = await userProfileService.getActiveProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Fallback handled by service, but if that fails, we might be in trouble.
      // Ideally show error toast
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Sync Theme to DOM
  useEffect(() => {
    if (!user) return;
    
    // Remove old themes
    document.body.classList.remove('theme-cyber', 'theme-industrial', 'theme-minimal');
    // Add new theme
    document.body.classList.add(`theme-${user.preferences.theme}`);
  }, [user?.preferences.theme]);

  const updatePreferences = async (prefs: Partial<UserProfile['preferences']>) => {
    if (!user) return;
    try {
      const updated = await userProfileService.updatePreferences(user.id, prefs);
      setUser(updated);
      
      // Apply CSS Variables for theme if needed (can be done in a separate effect or here)
      // This will be handled by LayoutContext or a global style manager listening to user changes
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const switchProfile = async (id: string) => {
    try {
      userProfileService.switchProfile(id);
      await refreshUser();
    } catch (error) {
      console.error('Failed to switch profile:', error);
    }
  };

  const updateExpertise = async (level: UserProfile['expertise']) => {
    if (!user) return;
    try {
      const updated = { ...user, expertise: level };
      await userProfileService.saveProfile(updated);
      setUser(updated);
    } catch (error) {
      console.error('Failed to update expertise:', error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isLoading, 
      refreshUser, 
      updatePreferences, 
      switchProfile,
      updateExpertise 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
