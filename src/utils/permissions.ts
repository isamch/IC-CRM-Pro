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

// صلاحيات مدير المبيعات (Sales Manager) - إدارة إدارية
export const salesManagerPermissions: Permissions = {
  users: {
    view: true, // يمكنه رؤية فريقه فقط
    create: false, // لا يمكنه إنشاء مستخدمين جدد
    edit: true, // يمكنه تعديل بيانات فريقه فقط
    delete: false, // لا يمكنه حذف المستخدمين
  },
  clients: {
    view: true,
    create: false, // لا يضيف عملاء مباشرة
    edit: false, // لا يعدل بيانات العملاء
    delete: false,
    viewAll: true, // يرى عملاء فريقه
  },
  deals: {
    view: true,
    create: false, // لا يضيف عقود مباشرة
    edit: false, // لا يعدل العقود
    delete: false,
    viewAll: true, // يرى عقود فريقه
  },
  tasks: {
    view: true,
    create: true, // يمكنه إنشاء مهام لفريقه
    edit: true,
    delete: true,
    assign: true, // يمكنه تخصيص المهام لفريقه
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

// صلاحيات مندوب المبيعات (Sales Representative) - تنفيذ عملي
export const salesRepresentativePermissions: Permissions = {
  users: {
    view: false,
    create: false,
    edit: false,
    delete: false,
  },
  clients: {
    view: true,
    create: true, // يضيف عملاء جدد
    edit: true, // يعدل بيانات عملائه
    delete: true, // يحذف عملائه
    viewAll: false, // يرى عملاءه فقط
  },
  deals: {
    view: true,
    create: true, // يضيف عقود جديدة
    edit: true, // يعدل عقوده
    delete: true, // يحذف عقوده
    viewAll: false, // يرى عقوده فقط
  },
  tasks: {
    view: true,
    create: true, // يضيف مهام جديدة
    edit: true, // يعدل مهامه
    delete: true, // يحذف مهامه
    assign: false, // لا يخصص مهام للآخرين
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