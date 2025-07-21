export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position?: string; // المنصب الوظيفي
  status: 'active' | 'inactive' | 'prospect' | 'lead'; // حالة العميل
  notes?: string; // ملاحظات
  assignedTo?: string; // معرف المستخدم المخصص له العميل
  createdBy?: string; // معرف منشئ العميل
  createdAt: string;
  lastContact?: string;
}

export interface Deal {
  id: string;
  title: string;
  amount: number;
  status: 'pending' | 'won' | 'lost';
  date: string;
  clientId: string;
  clientName: string;
  probability?: number;
  assignedTo?: string; // من يملك هذا العقد
  teamId?: string; // الفريق المسؤول عن الصفقة
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'pending' | 'done';
  priority: 'low' | 'medium' | 'high';
  clientId?: string;
  dealId?: string;
  assignee?: string;
  createdBy?: string; // من أنشأ هذه المهمة
  teamId?: string; // الفريق المسؤول عن المهمة
}

export interface DashboardStats {
  totalClients: number;
  totalDeals: number;
  successfulDeals: number;
  pendingTasks: number;
  revenue: number;
  dealsByStatus: {
    pending: number;
    won: number;
    lost: number;
  };
}

// نظام الأدوار
export type UserRole = 'admin' | 'sales_manager' | 'sales_representative';

// نظام الفرق
export interface Team {
  id: string;
  name: string;           // اسم الفريق
  region: string;         // المنطقة الجغرافية
  managerId?: string;     // مدير الفريق (قد يكون undefined إذا لم يكن هناك مدير)
  description?: string;   // وصف الفريق
  isActive: boolean;      // حالة الفريق
  createdAt: string;      // تاريخ الإنشاء
  updatedAt?: string;     // تاريخ التحديث
}

// نظام الصلاحيات
export interface Permissions {
  users: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  teams: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    manageMembers: boolean; // إدارة أعضاء الفريق
  };
  clients: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    viewAll: boolean; // رؤية عملاء الآخرين
  };
  deals: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    viewAll: boolean; // رؤية عقود الآخرين
  };
  tasks: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    assign: boolean;
    viewAll: boolean; // رؤية مهام الآخرين
  };
  reports: {
    view: boolean;
    export: boolean;
    viewAll: boolean; // رؤية جميع التقارير
  };
  settings: {
    view: boolean;
    edit: boolean;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  department?: string;
  teamId?: string;        // معرف الفريق
  region?: string;        // المنطقة الجغرافية
  managerId?: string;     // معرف المدير المباشر
  joinDate: string;
  lastLogin?: string;
  isActive: boolean; // هل الحساب مفعل
  permissions: Permissions;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
      desktop: boolean;
    };
    language: string;
    timezone: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}