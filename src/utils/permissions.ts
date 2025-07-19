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
    viewAll: true, // يرى عملاء فريقه
  },
  deals: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    viewAll: true, // يرى عقود فريقه
  },
  tasks: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    assign: true,
    viewAll: true, // يرى مهام فريقه
  },
  reports: {
    view: true,
    export: false,
    viewAll: false, // يرى تقارير فريقه فقط
  },
  settings: {
    view: false,
    edit: false,
  },
};

// صلاحيات مندوب المبيعات (Sales Representative)
export const salesRepresentativePermissions: Permissions = {
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
    viewAll: false, // يرى عملاءه فقط
  },
  deals: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    viewAll: false, // يرى عقوده فقط
  },
  tasks: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    assign: false,
    viewAll: false, // يرى مهامه فقط
  },
  reports: {
    view: true,
    export: false,
    viewAll: false, // يرى تقاريره فقط
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
    case 'sales_representative':
      return salesRepresentativePermissions;
    default:
      return salesRepresentativePermissions; // افتراضي
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