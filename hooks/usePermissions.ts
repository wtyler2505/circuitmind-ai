import { useAuth } from '../contexts/AuthContext';

export function usePermissions() {
  const { permissions, currentUser, isLocked } = useAuth();

  const canAction = (action: keyof typeof permissions) => {
    if (isLocked) return false;
    return permissions[action];
  };

  return {
    ...permissions,
    canAction,
    role: currentUser?.role || 'observer',
    isOwner: currentUser?.role === 'admin'
  };
}
