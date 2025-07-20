import { Client, Deal, Task, DashboardStats, User, Team } from '../types';
import { getPermissionsForRole } from '../utils/permissions';

// بيانات الفرق الوهمية
export const mockTeams: Team[] = [
  {
    id: '1',
    name: 'فريق الرياض',
    region: 'الرياض',
    managerId: '2', // فاطمة علي
    description: 'فريق مبيعات منطقة الرياض والمناطق المحيطة',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-20'
  },
  {
    id: '2',
    name: 'فريق جدة',
    region: 'جدة',
    managerId: '4', // علي حسن
    description: 'فريق مبيعات منطقة جدة والمناطق المحيطة',
    isActive: true,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-18'
  },
  {
    id: '3',
    name: 'فريق الدمام',
    region: 'الدمام',
    managerId: '5', // محمد عبدالله
    description: 'فريق مبيعات المنطقة الشرقية',
    isActive: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15'
  }
];

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    email: 'ahmed@company.com',
    phone: '+966501234567',
    company: 'شركة التقنية المتقدمة',
    position: 'مدير المبيعات',
    status: 'active',
    notes: 'عميل مهم، مهتم بالمنتجات الجديدة',
    assignedTo: '2', // مخصص لمدير المبيعات
    createdBy: '1', // أنشأه المدير
    createdAt: '2024-01-15',
    lastContact: '2024-01-20'
  },
  {
    id: '2',
    name: 'فاطمة علي',
    email: 'fatima@techcorp.com',
    phone: '+966507654321',
    company: 'تيك كورب',
    position: 'المدير التنفيذي',
    status: 'prospect',
    notes: 'عميل محتمل، يحتاج متابعة',
    assignedTo: '3', // مخصص لمندوب المبيعات
    createdBy: '3', // أنشأه مندوب المبيعات
    createdAt: '2024-01-18',
    lastContact: '2024-01-22'
  },
  {
    id: '3',
    name: 'خالد عبدالله',
    email: 'khalid@innovate.com',
    phone: '+966509876543',
    company: 'شركة الابتكار',
    position: 'مدير المشتريات',
    status: 'active',
    notes: 'عميل نشط، يطلب عروض دورية',
    assignedTo: '3', // مخصص لمندوب المبيعات
    createdBy: '3', // أنشأه مندوب المبيعات
    createdAt: '2024-01-10',
    lastContact: '2024-01-25'
  },
  {
    id: '4',
    name: 'نورا سعد',
    email: 'nora@future.com',
    phone: '+966501112223',
    company: 'شركة المستقبل',
    position: 'مدير التسويق',
    status: 'lead',
    notes: 'عميل رائد، يحتاج تطوير',
    assignedTo: '2', // مخصص لمدير المبيعات
    createdBy: '1', // أنشأه المدير
    createdAt: '2024-01-12',
    lastContact: '2024-01-19'
  },
  {
    id: '5',
    name: 'عمر حسن',
    email: 'omar@digital.com',
    phone: '+966504445556',
    company: 'الشركة الرقمية',
    position: 'المدير العام',
    status: 'inactive',
    notes: 'عميل غير نشط، يحتاج إعادة تفعيل',
    assignedTo: '3', // مخصص لمندوب المبيعات
    createdBy: '3', // أنشأه مندوب المبيعات
    createdAt: '2024-01-05',
    lastContact: '2024-01-15'
  }
];

export const mockDeals: Deal[] = [
  {
    id: '1',
    title: 'Enterprise Software License',
    amount: 45000,
    status: 'pending',
    date: '2024-02-15',
    clientId: '1',
    clientName: 'TechCorp Solutions',
    probability: 75,
    assignedTo: '1' // مخصص للمدير
  },
  {
    id: '2',
    title: 'Cloud Migration Project',
    amount: 85000,
    status: 'won',
    date: '2024-01-20',
    clientId: '2',
    clientName: 'InnovateTech',
    probability: 100,
    assignedTo: '2' // مخصص لمدير المبيعات
  },
  {
    id: '3',
    title: 'Data Analytics Platform',
    amount: 120000,
    status: 'pending',
    date: '2024-02-28',
    clientId: '3',
    clientName: 'DataStream Inc',
    probability: 60,
    assignedTo: '1' // مخصص للمدير
  },
  {
    id: '4',
    title: 'Security Audit Service',
    amount: 25000,
    status: 'lost',
    date: '2024-01-10',
    clientId: '4',
    clientName: 'CloudNine Solutions',
    probability: 0,
    assignedTo: '2' // مخصص لمدير المبيعات
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Follow up with TechCorp on proposal',
    description: 'Schedule a call to discuss the enterprise license proposal',
    dueDate: '2024-01-25',
    status: 'pending',
    priority: 'high',
    clientId: '1',
    dealId: '1',
    assignee: '1',
    createdBy: '1'
  },
  {
    id: '2',
    title: 'Prepare contract for InnovateTech',
    description: 'Draft the final contract for the cloud migration project',
    dueDate: '2024-01-22',
    status: 'done',
    priority: 'medium',
    clientId: '2',
    dealId: '2',
    assignee: '2',
    createdBy: '2'
  },
  {
    id: '3',
    title: 'Research DataStream requirements',
    description: 'Analyze technical requirements for the analytics platform',
    dueDate: '2024-01-30',
    status: 'pending',
    priority: 'medium',
    clientId: '3',
    dealId: '3',
    assignee: '1',
    createdBy: '1'
  },
  {
    id: '4',
    title: 'Monthly client check-in calls',
    description: 'Schedule and conduct monthly check-in calls with all active clients',
    dueDate: '2024-01-28',
    status: 'pending',
    priority: 'low',
    assignee: '2',
    createdBy: '2'
  }
];

export const mockDashboardStats: DashboardStats = {
  totalClients: mockClients.length,
  totalDeals: mockDeals.length,
  successfulDeals: mockDeals.filter(deal => deal.status === 'won').length,
  pendingTasks: mockTasks.filter(task => task.status === 'pending').length,
  revenue: mockDeals.filter(deal => deal.status === 'won').reduce((sum, deal) => sum + deal.amount, 0),
  dealsByStatus: {
    pending: mockDeals.filter(deal => deal.status === 'pending').length,
    won: mockDeals.filter(deal => deal.status === 'won').length,
    lost: mockDeals.filter(deal => deal.status === 'lost').length
  }
};

// المستخدمون مع الأدوار المختلفة
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    email: 'admin@crm.com',
    role: 'admin',
    phone: '+966 50 123 4567',
    department: 'الإدارة',
    joinDate: '2023-01-15',
    lastLogin: '2024-01-20T10:30:00Z',
    isActive: true,
    permissions: getPermissionsForRole('admin'),
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        desktop: true
      },
      language: 'ar',
      timezone: 'Asia/Riyadh'
    }
  },
  {
    id: '2',
    name: 'فاطمة علي',
    email: 'sales@crm.com',
    role: 'sales_manager',
    phone: '+966 55 987 6543',
    department: 'المبيعات',
    teamId: '1', // فريق الرياض
    region: 'الرياض',
    managerId: '1', // المدير العام
    joinDate: '2023-02-01',
    lastLogin: '2024-01-20T09:15:00Z',
    isActive: true,
    permissions: getPermissionsForRole('sales_manager'),
    preferences: {
      theme: 'dark',
      notifications: {
        email: true,
        push: true,
        desktop: false
      },
      language: 'ar',
      timezone: 'Asia/Riyadh'
    }
  },
  {
    id: '3',
    name: 'سارة أحمد',
    email: 'sarah@crm.com',
    role: 'sales_representative',
    phone: '+966 54 321 9876',
    department: 'المبيعات',
    teamId: '1', // فريق الرياض
    region: 'الرياض',
    managerId: '2', // فاطمة علي
    joinDate: '2023-03-15',
    lastLogin: '2024-01-20T08:45:00Z',
    isActive: true,
    permissions: getPermissionsForRole('sales_representative'),
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        desktop: true
      },
      language: 'ar',
      timezone: 'Asia/Riyadh'
    }
  },
  {
    id: '4',
    name: 'علي حسن',
    email: 'ali@crm.com',
    role: 'sales_manager',
    phone: '+966 53 456 7890',
    department: 'المبيعات',
    teamId: '2', // فريق جدة
    region: 'جدة',
    managerId: '1', // المدير العام
    joinDate: '2023-02-15',
    lastLogin: '2024-01-20T11:20:00Z',
    isActive: true,
    permissions: getPermissionsForRole('sales_manager'),
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        desktop: true
      },
      language: 'ar',
      timezone: 'Asia/Riyadh'
    }
  },
  {
    id: '5',
    name: 'محمد عبدالله',
    email: 'mohammed@crm.com',
    role: 'sales_manager',
    phone: '+966 52 789 0123',
    department: 'المبيعات',
    teamId: '3', // فريق الدمام
    region: 'الدمام',
    managerId: '1', // المدير العام
    joinDate: '2023-03-01',
    lastLogin: '2024-01-20T07:30:00Z',
    isActive: true,
    permissions: getPermissionsForRole('sales_manager'),
    preferences: {
      theme: 'dark',
      notifications: {
        email: true,
        push: false,
        desktop: true
      },
      language: 'ar',
      timezone: 'Asia/Riyadh'
    }
  },
  {
    id: '6',
    name: 'خالد عبدالله',
    email: 'khalid@crm.com',
    role: 'sales_representative',
    phone: '+966 51 234 5678',
    department: 'المبيعات',
    teamId: '1', // فريق الرياض
    region: 'الرياض',
    managerId: '2', // فاطمة علي
    joinDate: '2023-04-01',
    lastLogin: '2024-01-20T09:45:00Z',
    isActive: true,
    permissions: getPermissionsForRole('sales_representative'),
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        desktop: true
      },
      language: 'ar',
      timezone: 'Asia/Riyadh'
    }
  },
  {
    id: '7',
    name: 'نورا سعد',
    email: 'nora@crm.com',
    role: 'sales_representative',
    phone: '+966 56 345 6789',
    department: 'المبيعات',
    teamId: '2', // فريق جدة
    region: 'جدة',
    managerId: '4', // علي حسن
    joinDate: '2023-04-15',
    lastLogin: '2024-01-20T10:15:00Z',
    isActive: true,
    permissions: getPermissionsForRole('sales_representative'),
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        desktop: false
      },
      language: 'ar',
      timezone: 'Asia/Riyadh'
    }
  },
  // مندوبي مبيعات جدد بدون فريق
  {
    id: '8',
    name: 'عبدالرحمن محمد',
    email: 'abdulrahman@crm.com',
    role: 'sales_representative',
    phone: '+966 57 456 7890',
    department: 'المبيعات',
    teamId: undefined, // غير منضم لأي فريق
    region: 'الرياض',
    managerId: undefined,
    joinDate: '2024-01-01',
    lastLogin: '2024-01-20T12:00:00Z',
    isActive: true,
    permissions: getPermissionsForRole('sales_representative'),
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        desktop: true
      },
      language: 'ar',
      timezone: 'Asia/Riyadh'
    }
  },
  {
    id: '9',
    name: 'ريم عبدالله',
    email: 'reem@crm.com',
    role: 'sales_representative',
    phone: '+966 58 567 8901',
    department: 'المبيعات',
    teamId: undefined, // غير منضم لأي فريق
    region: 'جدة',
    managerId: undefined,
    joinDate: '2024-01-05',
    lastLogin: '2024-01-20T13:15:00Z',
    isActive: true,
    permissions: getPermissionsForRole('sales_representative'),
    preferences: {
      theme: 'dark',
      notifications: {
        email: true,
        push: true,
        desktop: false
      },
      language: 'ar',
      timezone: 'Asia/Riyadh'
    }
  },
  {
    id: '10',
    name: 'يوسف أحمد',
    email: 'youssef@crm.com',
    role: 'sales_representative',
    phone: '+966 59 678 9012',
    department: 'المبيعات',
    teamId: undefined, // غير منضم لأي فريق
    region: 'الدمام',
    managerId: undefined,
    joinDate: '2024-01-10',
    lastLogin: '2024-01-20T14:30:00Z',
    isActive: true,
    permissions: getPermissionsForRole('sales_representative'),
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        push: false,
        desktop: true
      },
      language: 'ar',
      timezone: 'Asia/Riyadh'
    }
  },
  {
    id: '11',
    name: 'فهد سعد',
    email: 'fahad@crm.com',
    role: 'sales_representative',
    phone: '+966 60 789 0123',
    department: 'المبيعات',
    teamId: undefined, // غير منضم لأي فريق
    region: 'الرياض',
    managerId: undefined,
    joinDate: '2024-01-12',
    lastLogin: '2024-01-20T15:45:00Z',
    isActive: true,
    permissions: getPermissionsForRole('sales_representative'),
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        desktop: true
      },
      language: 'ar',
      timezone: 'Asia/Riyadh'
    }
  },
  {
    id: '12',
    name: 'لينا محمد',
    email: 'lina@crm.com',
    role: 'sales_representative',
    phone: '+966 61 890 1234',
    department: 'المبيعات',
    teamId: undefined, // غير منضم لأي فريق
    region: 'جدة',
    managerId: undefined,
    joinDate: '2024-01-15',
    lastLogin: '2024-01-20T16:20:00Z',
    isActive: true,
    permissions: getPermissionsForRole('sales_representative'),
    preferences: {
      theme: 'dark',
      notifications: {
        email: true,
        push: true,
        desktop: true
      },
      language: 'ar',
      timezone: 'Asia/Riyadh'
    }
  }
];

// المستخدم الافتراضي (للتطبيق الحالي)
export const mockUser: User = mockUsers[0]; // المدير افتراضياً