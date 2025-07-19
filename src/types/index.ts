export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  avatar?: string;
  createdAt: string;
  lastContact?: string;
  assignedTo?: string; // من يملك هذا العميل
  createdBy?: string; // من أنشأ هذا العميل
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
export type UserRole = 'admin' | 'sales_manager';

// نظام الصلاحيات
export interface Permissions {
  users: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
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