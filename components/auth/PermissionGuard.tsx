import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

interface PermissionGuardProps {
  permissions?: (keyof ReturnType<typeof usePermissions>)[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permissions = [], 
  fallback = null, 
  children 
}) => {
  const userPerms = usePermissions();

  const hasAll = permissions.every(p => {
    const val = (userPerms as Record<string, unknown>)[p as string];
    return typeof val === 'boolean' ? val : false;
  });

  if (!hasAll) return <>{fallback}</>;

  return <>{children}</>;
};
