import { UserRole, Permissions } from '../types';

// صلاحيات المدير (Admin)
export const adminPermissions: Permissions = {
  users: {
    view: true,
    create: true,
    edit: true,
    delete: true,
  },
  clients: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    viewAll: true,
  },
  deals: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    viewAll: true,
  },
  tasks: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    assign: true,
    viewAll: true,
  },
  reports: {
    view: true,
    export: true,
    viewAll: true,
  },
  settings: {
    view: true,
    edit: true,
  },
};

// صلاحيات مدير المبيعات (Sales Manager)
export const salesManagerPermissions: Permissions = {
  users: {
    view: false,
    create: false,
    edit: false,
    delete: false,
  },
  clients: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    viewAll: true,
  },
  deals: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    viewAll: true,
  },
  tasks: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    assign: true,
    viewAll: true,
  },
  reports: {
    view: true,
    export: false,
    viewAll: false, // يرى تقارير المبيعات فقط
  },
  settings: {
    view: false,
    edit: false,
  },
};

// دالة للحصول على صلاحيات الدور
export const getPermissionsForRole = (role: UserRole): Permissions => {
  switch (role) {
    case 'admin':
      return adminPermissions;
    case 'sales_manager':
      return salesManagerPermissions;
    default:
      return salesManagerPermissions; // افتراضي
  }
};

// دالة للتحقق من الصلاحية
export const hasPermission = (
  userPermissions: Permissions,
  section: keyof Permissions,
  action: string
): boolean => {
  const sectionPermissions = userPermissions[section] as Record<string, boolean>;
  return sectionPermissions && sectionPermissions[action] === true;
};

// دالة للتحقق من الصلاحية مع الدور
export const checkPermission = (
  userRole: UserRole,
  section: keyof Permissions,
  action: string
): boolean => {
  const permissions = getPermissionsForRole(userRole);
  return hasPermission(permissions, section, action);
}; 