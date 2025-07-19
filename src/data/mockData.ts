import { Client, Deal, Task, DashboardStats, User } from '../types';
import { getPermissionsForRole } from '../utils/permissions';

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@techcorp.com',
    phone: '+1 (555) 123-4567',
    company: 'TechCorp Solutions',
    createdAt: '2024-01-15',
    lastContact: '2024-01-20',
    assignedTo: '1', // مخصص للمدير
    createdBy: '1' // أنشأه المدير
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@innovatetech.com',
    phone: '+1 (555) 987-6543',
    company: 'InnovateTech',
    createdAt: '2024-01-10',
    lastContact: '2024-01-18',
    assignedTo: '2', // مخصص لمدير المبيعات
    createdBy: '2' // أنشأته فاطمة
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'mchen@datastream.io',
    phone: '+1 (555) 456-7890',
    company: 'DataStream Inc',
    createdAt: '2024-01-05',
    lastContact: '2024-01-19',
    assignedTo: '1', // مخصص للمدير
    createdBy: '1' // أنشأه المدير
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    email: 'emily@cloudnine.com',
    phone: '+1 (555) 321-9876',
    company: 'CloudNine Solutions',
    createdAt: '2024-01-12',
    lastContact: '2024-01-17',
    assignedTo: '2', // مخصص لمدير المبيعات
    createdBy: '2' // أنشأته فاطمة
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
  }
];

// المستخدم الافتراضي (للتطبيق الحالي)
export const mockUser: User = mockUsers[0]; // المدير افتراضياً