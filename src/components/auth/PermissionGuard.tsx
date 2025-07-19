import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/permissions';
import { Permissions } from '../../types';

interface PermissionGuardProps {
  permission: keyof Permissions;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  action,
  children,
  fallback = null
}) => {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  const hasAccess = hasPermission(user.permissions, permission, action);

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
};

// مكون مختصر للصلاحيات الشائعة
export const CanView: React.FC<{ permission: keyof Permissions; children: React.ReactNode }> = ({ permission, children }) => (
  <PermissionGuard permission={permission} action="view">
    {children}
  </PermissionGuard>
);

export const CanCreate: React.FC<{ permission: keyof Permissions; children: React.ReactNode }> = ({ permission, children }) => (
  <PermissionGuard permission={permission} action="create">
    {children}
  </PermissionGuard>
);

export const CanEdit: React.FC<{ permission: keyof Permissions; children: React.ReactNode }> = ({ permission, children }) => (
  <PermissionGuard permission={permission} action="edit">
    {children}
  </PermissionGuard>
);

export const CanDelete: React.FC<{ permission: keyof Permissions; children: React.ReactNode }> = ({ permission, children }) => (
  <PermissionGuard permission={permission} action="delete">
    {children}
  </PermissionGuard>
); 