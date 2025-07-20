import { Client, Deal, Task, DashboardStats, User, Team } from '../types';
import { getPermissionsForRole } from '../utils/permissions';

// بيانات الفرق الوهمية
export const mockTeams: Team[] = [
  // فريق نشط مع مدير وأعضاء
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
  // فريق نشط مع مدير وأعضاء
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
  // فريق نشط مع مدير وأعضاء
  {
    id: '3',
    name: 'فريق الدمام',
    region: 'الدمام',
    managerId: '5', // محمد عبدالله
    description: 'فريق مبيعات المنطقة الشرقية',
    isActive: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15'
  },
  // فريق غير نشط بدون أعضاء
  {
    id: '4',
    name: 'فريق مكة',
    region: 'مكة',
    managerId: '13', // سلوى منصور
    description: 'فريق جديد في مكة',
    isActive: false,
    createdAt: '2024-02-01',
    updatedAt: '2024-02-10'
  },
  // فريق نشط بدون عملاء
  {
    id: '5',
    name: 'فريق المدينة',
    region: 'المدينة',
    managerId: '14', // سامي العتيبي
    description: 'فريق المدينة المنورة',
    isActive: true,
    createdAt: '2024-02-05',
    updatedAt: '2024-02-15'
  },
  // فريق إضافي يديره نفس المدير (فاطمة علي)
  {
    id: '6',
    name: 'فريق الشمال',
    region: 'الشمال',
    managerId: '2', // فاطمة علي تدير فريقين
    description: 'فريق مبيعات منطقة الشمال',
    isActive: true,
    createdAt: '2024-03-01',
    updatedAt: '2024-03-10'
  },
  // فريق إضافي يديره نفس المدير (علي حسن)
  {
    id: '7',
    name: 'فريق الجنوب',
    region: 'الجنوب',
    managerId: '4', // علي حسن يدير فريقين
    description: 'فريق مبيعات منطقة الجنوب',
    isActive: true,
    createdAt: '2024-03-05',
    updatedAt: '2024-03-12'
  }
];

// بيانات المستخدمين (مدير نظام، مدراء مبيعات، مندوبي مبيعات)
export const mockUsers: User[] = [
  // مدير النظام
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
      notifications: { email: true, push: true, desktop: true },
      language: 'ar',
      timezone: 'Asia/Riyadh'
    }
  },
  // مدراء مبيعات
  { id: '2', name: 'فاطمة علي', email: 'fatima@crm.com', role: 'sales_manager', phone: '+966 55 987 6543', department: 'المبيعات', teamId: '1', region: 'الرياض', managerId: '1', joinDate: '2023-02-01', lastLogin: '2024-01-20T09:15:00Z', isActive: true, permissions: getPermissionsForRole('sales_manager'), preferences: { theme: 'dark', notifications: { email: true, push: true, desktop: false }, language: 'ar', timezone: 'Asia/Riyadh' } },
  { id: '4', name: 'علي حسن', email: 'ali@crm.com', role: 'sales_manager', phone: '+966 53 456 7890', department: 'المبيعات', teamId: '2', region: 'جدة', managerId: '1', joinDate: '2023-02-15', lastLogin: '2024-01-20T11:20:00Z', isActive: true, permissions: getPermissionsForRole('sales_manager'), preferences: { theme: 'light', notifications: { email: true, push: true, desktop: true }, language: 'ar', timezone: 'Asia/Riyadh' } },
  { id: '5', name: 'محمد عبدالله', email: 'mohammed@crm.com', role: 'sales_manager', phone: '+966 52 789 0123', department: 'المبيعات', teamId: '3', region: 'الدمام', managerId: '1', joinDate: '2023-03-01', lastLogin: '2024-01-20T07:30:00Z', isActive: true, permissions: getPermissionsForRole('sales_manager'), preferences: { theme: 'dark', notifications: { email: true, push: false, desktop: true }, language: 'ar', timezone: 'Asia/Riyadh' } },
  { id: '13', name: 'سلوى منصور', email: 'salwa@crm.com', role: 'sales_manager', phone: '+966 54 111 2222', department: 'المبيعات', teamId: '4', region: 'مكة', managerId: '1', joinDate: '2024-02-01', lastLogin: '2024-02-10T08:00:00Z', isActive: false, permissions: getPermissionsForRole('sales_manager'), preferences: { theme: 'light', notifications: { email: true, push: false, desktop: false }, language: 'ar', timezone: 'Asia/Riyadh' } },
  { id: '14', name: 'سامي العتيبي', email: 'sami@crm.com', role: 'sales_manager', phone: '+966 55 222 3333', department: 'المبيعات', teamId: '5', region: 'المدينة', managerId: '1', joinDate: '2024-02-05', lastLogin: '2024-02-15T09:00:00Z', isActive: true, permissions: getPermissionsForRole('sales_manager'), preferences: { theme: 'dark', notifications: { email: true, push: true, desktop: true }, language: 'ar', timezone: 'Asia/Riyadh' } },
  // مندوبي مبيعات موزعين على الفرق
  { id: '3', name: 'سارة أحمد', email: 'sarah@crm.com', role: 'sales_representative', phone: '+966 54 321 9876', department: 'المبيعات', teamId: '1', region: 'الرياض', managerId: '2', joinDate: '2023-03-15', lastLogin: '2024-01-20T08:45:00Z', isActive: true, permissions: getPermissionsForRole('sales_representative'), preferences: { theme: 'light', notifications: { email: true, push: true, desktop: true }, language: 'ar', timezone: 'Asia/Riyadh' } },
  { id: '6', name: 'خالد عبدالله', email: 'khalid@crm.com', role: 'sales_representative', phone: '+966 51 234 5678', department: 'المبيعات', teamId: '1', region: 'الرياض', managerId: '2', joinDate: '2023-04-01', lastLogin: '2024-01-20T09:45:00Z', isActive: true, permissions: getPermissionsForRole('sales_representative'), preferences: { theme: 'light', notifications: { email: true, push: true, desktop: true }, language: 'ar', timezone: 'Asia/Riyadh' } },
  { id: '7', name: 'نورا سعد', email: 'nora@crm.com', role: 'sales_representative', phone: '+966 56 345 6789', department: 'المبيعات', teamId: '2', region: 'جدة', managerId: '4', joinDate: '2023-04-15', lastLogin: '2024-01-20T10:15:00Z', isActive: true, permissions: getPermissionsForRole('sales_representative'), preferences: { theme: 'light', notifications: { email: true, push: true, desktop: false }, language: 'ar', timezone: 'Asia/Riyadh' } },
  { id: '8', name: 'عبدالرحمن محمد', email: 'abdulrahman@crm.com', role: 'sales_representative', phone: '+966 57 456 7890', department: 'المبيعات', teamId: '2', region: 'جدة', managerId: '4', joinDate: '2024-01-01', lastLogin: '2024-01-20T12:00:00Z', isActive: true, permissions: getPermissionsForRole('sales_representative'), preferences: { theme: 'light', notifications: { email: true, push: true, desktop: true }, language: 'ar', timezone: 'Asia/Riyadh' } },
  { id: '9', name: 'ريم عبدالله', email: 'reem@crm.com', role: 'sales_representative', phone: '+966 58 567 8901', department: 'المبيعات', teamId: '3', region: 'الدمام', managerId: '5', joinDate: '2024-01-05', lastLogin: '2024-01-20T13:15:00Z', isActive: true, permissions: getPermissionsForRole('sales_representative'), preferences: { theme: 'dark', notifications: { email: true, push: true, desktop: false }, language: 'ar', timezone: 'Asia/Riyadh' } },
  { id: '10', name: 'يوسف أحمد', email: 'youssef@crm.com', role: 'sales_representative', phone: '+966 59 678 9012', department: 'المبيعات', teamId: '3', region: 'الدمام', managerId: '5', joinDate: '2024-01-10', lastLogin: '2024-01-20T14:30:00Z', isActive: true, permissions: getPermissionsForRole('sales_representative'), preferences: { theme: 'light', notifications: { email: true, push: false, desktop: true }, language: 'ar', timezone: 'Asia/Riyadh' } },
  { id: '11', name: 'فهد سعد', email: 'fahad@crm.com', role: 'sales_representative', phone: '+966 60 789 0123', department: 'المبيعات', teamId: '4', region: 'مكة', managerId: '13', joinDate: '2024-01-12', lastLogin: '2024-01-20T15:45:00Z', isActive: true, permissions: getPermissionsForRole('sales_representative'), preferences: { theme: 'light', notifications: { email: true, push: true, desktop: true }, language: 'ar', timezone: 'Asia/Riyadh' } },
  { id: '12', name: 'لينا محمد', email: 'lina@crm.com', role: 'sales_representative', phone: '+966 61 890 1234', department: 'المبيعات', teamId: '5', region: 'المدينة', managerId: '14', joinDate: '2024-01-15', lastLogin: '2024-01-20T16:20:00Z', isActive: true, permissions: getPermissionsForRole('sales_representative'), preferences: { theme: 'dark', notifications: { email: true, push: true, desktop: true }, language: 'ar', timezone: 'Asia/Riyadh' } },
  // مندوب بدون فريق
  { id: '15', name: 'سعيد الحربي', email: 'saeed@crm.com', role: 'sales_representative', phone: '+966 62 123 4567', department: 'المبيعات', teamId: undefined, region: 'القصيم', managerId: undefined, joinDate: '2024-02-10', lastLogin: '2024-02-20T10:00:00Z', isActive: false, permissions: getPermissionsForRole('sales_representative'), preferences: { theme: 'light', notifications: { email: true, push: false, desktop: false }, language: 'ar', timezone: 'Asia/Riyadh' } }
];

// بيانات العملاء (موزعة على الفرق والمندوبين وبعضهم غير مخصص)
export const mockClients: Client[] = [
  // ... (أضف هنا 15 عميل متنوع، بعضهم مخصص لمدير، بعضهم لمندوب، وبعضهم غير مخصص)
  { id: '1', name: 'أحمد محمد', email: 'ahmed@company.com', phone: '+966501234567', company: 'شركة التقنية المتقدمة', position: 'مدير المبيعات', status: 'active', notes: 'عميل مهم، مهتم بالمنتجات الجديدة', assignedTo: '2', createdBy: '1', createdAt: '2024-01-15', lastContact: '2024-01-20' },
  { id: '2', name: 'فاطمة علي', email: 'fatima@techcorp.com', phone: '+966507654321', company: 'تيك كورب', position: 'المدير التنفيذي', status: 'prospect', notes: 'عميل محتمل، يحتاج متابعة', assignedTo: '3', createdBy: '3', createdAt: '2024-01-18', lastContact: '2024-01-22' },
  { id: '3', name: 'خالد عبدالله', email: 'khalid@innovate.com', phone: '+966509876543', company: 'شركة الابتكار', position: 'مدير المشتريات', status: 'active', notes: 'عميل نشط، يطلب عروض دورية', assignedTo: '3', createdBy: '3', createdAt: '2024-01-10', lastContact: '2024-01-25' },
  { id: '4', name: 'نورا سعد', email: 'nora@future.com', phone: '+966501112223', company: 'شركة المستقبل', position: 'مدير التسويق', status: 'lead', notes: 'عميل رائد، يحتاج تطوير', assignedTo: '2', createdBy: '1', createdAt: '2024-01-12', lastContact: '2024-01-19' },
  { id: '5', name: 'عمر حسن', email: 'omar@digital.com', phone: '+966504445556', company: 'الشركة الرقمية', position: 'المدير العام', status: 'inactive', notes: 'عميل غير نشط، يحتاج إعادة تفعيل', assignedTo: '3', createdBy: '3', createdAt: '2024-01-05', lastContact: '2024-01-15' },
  { id: '6', name: 'سارة منصور', email: 'sara@company.com', phone: '+966501111111', company: 'شركة النور', position: 'مديرة مشاريع', status: 'active', notes: '', assignedTo: '6', createdBy: '2', createdAt: '2024-02-01', lastContact: '2024-02-10' },
  { id: '7', name: 'عبدالله فهد', email: 'abdullah@company.com', phone: '+966502222222', company: 'شركة الأمل', position: 'مدير مالي', status: 'prospect', notes: '', assignedTo: '7', createdBy: '4', createdAt: '2024-02-02', lastContact: '2024-02-11' },
  { id: '8', name: 'منى خالد', email: 'mona@company.com', phone: '+966503333333', company: 'شركة الرؤية', position: 'مديرة تسويق', status: 'active', notes: '', assignedTo: '8', createdBy: '4', createdAt: '2024-02-03', lastContact: '2024-02-12' },
  { id: '9', name: 'سعيد العتيبي', email: 'saeed@company.com', phone: '+966504444444', company: 'شركة الريادة', position: 'مدير تطوير', status: 'inactive', notes: '', assignedTo: '9', createdBy: '5', createdAt: '2024-02-04', lastContact: '2024-02-13' },
  { id: '10', name: 'هند محمد', email: 'hind@company.com', phone: '+966505555555', company: 'شركة الإبداع', position: 'مديرة مشتريات', status: 'active', notes: '', assignedTo: '10', createdBy: '5', createdAt: '2024-02-05', lastContact: '2024-02-14' },
  { id: '11', name: 'سلوى منصور', email: 'salwa@company.com', phone: '+966506666666', company: 'شركة مكة', position: 'مديرة', status: 'lead', notes: '', assignedTo: '13', createdBy: '13', createdAt: '2024-02-06', lastContact: '2024-02-15' },
  { id: '12', name: 'سامي العتيبي', email: 'sami@company.com', phone: '+966507777777', company: 'شركة المدينة', position: 'مدير', status: 'active', notes: '', assignedTo: '14', createdBy: '14', createdAt: '2024-02-07', lastContact: '2024-02-16' },
  { id: '13', name: 'سعيد الحربي', email: 'saeed@company.com', phone: '+966508888888', company: 'شركة القصيم', position: 'مدير', status: 'prospect', notes: '', assignedTo: '15', createdBy: '15', createdAt: '2024-02-08', lastContact: '2024-02-17' },
  { id: '14', name: 'ليلى فهد', email: 'layla@company.com', phone: '+966509999999', company: 'شركة جدة', position: 'مديرة', status: 'inactive', notes: '', assignedTo: undefined, createdBy: '4', createdAt: '2024-02-09', lastContact: '2024-02-18' },
  { id: '15', name: 'محمد صالح', email: 'mohammed@company.com', phone: '+966501010101', company: 'شركة الرياض', position: 'مدير', status: 'active', notes: '', assignedTo: undefined, createdBy: '2', createdAt: '2024-02-10', lastContact: '2024-02-19' }
];

export const mockDeals: Deal[] = [
  {
    id: '1',
    title: 'رخصة برمجيات المؤسسات',
    amount: 45000,
    status: 'pending',
    date: '2024-02-15',
    clientId: '1',
    clientName: 'أحمد محمد',
    probability: 75,
    assignedTo: '3' // مخصص لمندوب المبيعات سارة أحمد
  },
  {
    id: '2',
    title: 'مشروع الهجرة إلى السحابة',
    amount: 85000,
    status: 'won',
    date: '2024-01-20',
    clientId: '2',
    clientName: 'فاطمة علي',
    probability: 100,
    assignedTo: '6' // مخصص لمندوب المبيعات خالد عبدالله
  },
  {
    id: '3',
    title: 'منصة تحليل البيانات',
    amount: 120000,
    status: 'pending',
    date: '2024-02-28',
    clientId: '3',
    clientName: 'خالد عبدالله',
    probability: 60,
    assignedTo: '7' // مخصص لمندوب المبيعات نورا سعد
  },
  {
    id: '4',
    title: 'خدمة تدقيق الأمان',
    amount: 25000,
    status: 'lost',
    date: '2024-01-10',
    clientId: '4',
    clientName: 'نورا سعد',
    probability: 0,
    assignedTo: '8' // مخصص لمندوب المبيعات عبدالرحمن محمد
  },
  {
    id: '5',
    title: 'تطوير تطبيق الهاتف المحمول',
    amount: 35000,
    status: 'won',
    date: '2024-01-25',
    clientId: '5',
    clientName: 'عمر حسن',
    probability: 90,
    assignedTo: '3' // مخصص لمندوب المبيعات
  },
  {
    id: '6',
    title: 'نظام إدارة المخزون',
    amount: 28000,
    status: 'pending',
    date: '2024-02-10',
    clientId: '6',
    clientName: 'سارة منصور',
    probability: 70,
    assignedTo: '6' // مخصص لمندوب المبيعات
  },
  {
    id: '7',
    title: 'خدمة الاستشارات التقنية',
    amount: 15000,
    status: 'won',
    date: '2024-01-30',
    clientId: '7',
    clientName: 'عبدالله فهد',
    probability: 85,
    assignedTo: '7' // مخصص لمندوب المبيعات
  },
  {
    id: '8',
    title: 'تطوير موقع إلكتروني',
    amount: 22000,
    status: 'pending',
    date: '2024-02-20',
    clientId: '8',
    clientName: 'منى خالد',
    probability: 65,
    assignedTo: '8' // مخصص لمندوب المبيعات
  },
  {
    id: '9',
    title: 'حلول الأمن السيبراني',
    amount: 55000,
    status: 'pending',
    date: '2024-03-01',
    clientId: '9',
    clientName: 'سعيد العتيبي',
    probability: 80,
    assignedTo: '9' // مخصص لمندوب المبيعات ريم عبدالله
  },
  {
    id: '10',
    title: 'منصة التجارة الإلكترونية',
    amount: 75000,
    status: 'won',
    date: '2024-02-25',
    clientId: '10',
    clientName: 'هند محمد',
    probability: 95,
    assignedTo: '10' // مخصص لمندوب المبيعات يوسف أحمد
  },
  {
    id: '11',
    title: 'نظام إدارة الموارد البشرية',
    amount: 40000,
    status: 'pending',
    date: '2024-03-05',
    clientId: '11',
    clientName: 'سلوى منصور',
    probability: 70,
    assignedTo: '11' // مخصص لمندوب المبيعات فهد سعد
  },
  {
    id: '12',
    title: 'حلول الذكاء الاصطناعي',
    amount: 95000,
    status: 'pending',
    date: '2024-03-10',
    clientId: '12',
    clientName: 'سامي العتيبي',
    probability: 85,
    assignedTo: '12' // مخصص لمندوب المبيعات لينا محمد
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

// المستخدم الافتراضي (للتطبيق الحالي)
export const mockUser: User = mockUsers[0]; // المدير افتراضياً