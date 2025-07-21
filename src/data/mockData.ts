import { Client, Deal, Task, DashboardStats, User, Team } from '../types';
import { getPermissionsForRole } from '../utils/permissions';

// واجهة أنشطة الصفقة
export interface DealActivity {
  id: string;
  dealId: string;
  type: 'created' | 'meeting' | 'proposal' | 'followup' | 'negotiation' | 'contract_sent' | 'contract_signed' | 'lost' | 'won' | 'note';
  title: string;
  description: string;
  date: string;
  userId: string;
  userName: string;
  attachments?: string[];
  duration?: number; // بالدقائق للاجتماعات
  location?: string; // للاجتماعات
  outcome?: string; // للاجتماعات والمفاوضات
}

// بيانات أنشطة الصفقات
export const mockDealActivities: DealActivity[] = [
  // أنشطة الصفقة 1
  {
    id: '1',
    dealId: '1',
    type: 'created',
    title: 'تم إنشاء الصفقة',
    description: 'تم إنشاء صفقة جديدة لشركة التقنية المتقدمة',
    date: '2024-01-15T09:00:00Z',
    userId: '6',
    userName: 'سارة أحمد'
  },
  {
    id: '2',
    dealId: '1',
    type: 'meeting',
    title: 'اجتماع أولي مع العميل',
    description: 'اجتماع تمهيدي لفهم احتياجات الشركة ومتطلبات المشروع',
    date: '2024-01-18T14:00:00Z',
    userId: '6',
    userName: 'سارة أحمد',
    duration: 60,
    location: 'مكتب العميل - الرياض',
    outcome: 'تم تحديد المتطلبات الأساسية للمشروع'
  },
  {
    id: '3',
    dealId: '1',
    type: 'proposal',
    title: 'إرسال العرض التجاري',
    description: 'تم إرسال العرض التجاري التفصيلي مع الأسعار والمواصفات',
    date: '2024-01-22T11:30:00Z',
    userId: '6',
    userName: 'سارة أحمد',
    attachments: ['عرض_تجاري_شركة_التقنية.pdf']
  },
  {
    id: '4',
    dealId: '1',
    type: 'negotiation',
    title: 'مفاوضات حول السعر والشروط',
    description: 'جلسة مفاوضات لتحسين الشروط والأسعار',
    date: '2024-01-25T16:00:00Z',
    userId: '6',
    userName: 'سارة أحمد',
    duration: 90,
    location: 'مقر الشركة - الرياض',
    outcome: 'تم الاتفاق على خصم 10% مع تحسين شروط الدفع'
  },
  {
    id: '5',
    dealId: '1',
    type: 'contract_sent',
    title: 'إرسال العقد النهائي',
    description: 'تم إرسال العقد النهائي للعميل للتوقيع',
    date: '2024-01-28T10:00:00Z',
    userId: '6',
    userName: 'سارة أحمد',
    attachments: ['عقد_شركة_التقنية_النهائي.pdf']
  },
  {
    id: '6',
    dealId: '1',
    type: 'contract_signed',
    title: 'توقيع العقد',
    description: 'تم توقيع العقد من قبل العميل وإتمام الصفقة',
    date: '2024-02-01T15:30:00Z',
    userId: '6',
    userName: 'سارة أحمد',
    attachments: ['عقد_موقع_شركة_التقنية.pdf']
  },
  {
    id: '7',
    dealId: '1',
    type: 'won',
    title: 'إتمام الصفقة بنجاح',
    description: 'تم إتمام الصفقة بنجاح وقيدها في النظام',
    date: '2024-02-01T16:00:00Z',
    userId: '6',
    userName: 'سارة أحمد'
  },

  // أنشطة الصفقة 2
  {
    id: '8',
    dealId: '2',
    type: 'created',
    title: 'تم إنشاء الصفقة',
    description: 'تم إنشاء صفقة جديدة لشركة الخدمات المالية',
    date: '2024-01-20T08:30:00Z',
    userId: '7',
    userName: 'محمد علي'
  },
  {
    id: '9',
    dealId: '2',
    type: 'meeting',
    title: 'عرض المنتج',
    description: 'عرض تفصيلي للمنتجات والخدمات المقدمة',
    date: '2024-01-23T13:00:00Z',
    userId: '7',
    userName: 'محمد علي',
    duration: 75,
    location: 'مقر الشركة - جدة',
    outcome: 'إعجاب العميل بالمنتجات وطلب عرض أسعار'
  },
  {
    id: '10',
    dealId: '2',
    type: 'proposal',
    title: 'إرسال عرض الأسعار',
    description: 'تم إرسال عرض أسعار مفصل للمنتجات المطلوبة',
    date: '2024-01-26T09:15:00Z',
    userId: '7',
    userName: 'محمد علي',
    attachments: ['عرض_أسعار_شركة_الخدمات_المالية.pdf']
  },
  {
    id: '11',
    dealId: '2',
    type: 'followup',
    title: 'مكالمة متابعة',
    description: 'مكالمة متابعة لمعرفة رأي العميل في العرض',
    date: '2024-01-29T11:00:00Z',
    userId: '7',
    userName: 'محمد علي',
    outcome: 'العميل يحتاج وقت للدراسة والمراجعة'
  },
  {
    id: '12',
    dealId: '2',
    type: 'note',
    title: 'ملاحظة مهمة',
    description: 'العميل مهتم بالمنتج لكن يحتاج ضمانات إضافية',
    date: '2024-02-02T14:20:00Z',
    userId: '7',
    userName: 'محمد علي'
  },

  // أنشطة الصفقة 3
  {
    id: '13',
    dealId: '3',
    type: 'created',
    title: 'تم إنشاء الصفقة',
    description: 'تم إنشاء صفقة جديدة لشركة التصنيع الحديث',
    date: '2024-01-25T10:00:00Z',
    userId: '8',
    userName: 'فاطمة محمد'
  },
  {
    id: '14',
    dealId: '3',
    type: 'meeting',
    title: 'اجتماع استكشافي',
    description: 'اجتماع لاستكشاف احتياجات الشركة الصناعية',
    date: '2024-01-28T15:30:00Z',
    userId: '8',
    userName: 'فاطمة محمد',
    duration: 45,
    location: 'مصنع الشركة - الدمام',
    outcome: 'تم تحديد المشاكل الحالية والحلول المطلوبة'
  },
  {
    id: '15',
    dealId: '3',
    type: 'proposal',
    title: 'عرض الحلول',
    description: 'عرض حلول تقنية لحل مشاكل الشركة',
    date: '2024-02-01T12:00:00Z',
    userId: '8',
    userName: 'فاطمة محمد',
    attachments: ['حلول_تقنية_شركة_التصنيع.pdf']
  },
  {
    id: '16',
    dealId: '3',
    type: 'lost',
    title: 'خسارة الصفقة',
    description: 'العميل اختار منافس آخر بسبب السعر',
    date: '2024-02-05T16:45:00Z',
    userId: '8',
    userName: 'فاطمة محمد',
    outcome: 'المنافس قدم عرضاً أقل بنسبة 15%'
  },

  // أنشطة الصفقة 4
  {
    id: '17',
    dealId: '4',
    type: 'created',
    title: 'تم إنشاء الصفقة',
    description: 'تم إنشاء صفقة جديدة لشركة النقل السريع',
    date: '2024-02-01T08:00:00Z',
    userId: '9',
    userName: 'علي أحمد'
  },
  {
    id: '18',
    dealId: '4',
    type: 'meeting',
    title: 'اجتماع تقني',
    description: 'اجتماع تقني لدراسة المتطلبات التقنية',
    date: '2024-02-04T14:00:00Z',
    userId: '9',
    userName: 'علي أحمد',
    duration: 120,
    location: 'مركز البيانات - الرياض',
    outcome: 'تم تحديد المواصفات التقنية المطلوبة'
  },
  {
    id: '19',
    dealId: '4',
    type: 'proposal',
    title: 'عرض تقني ومالي',
    description: 'عرض شامل يتضمن الجوانب التقنية والمالية',
    date: '2024-02-08T10:30:00Z',
    userId: '9',
    userName: 'علي أحمد',
    attachments: ['عرض_تقني_مالي_شركة_النقل.pdf']
  },
  {
    id: '20',
    dealId: '4',
    type: 'negotiation',
    title: 'مفاوضات شاملة',
    description: 'مفاوضات حول السعر والمواصفات والجدول الزمني',
    date: '2024-02-12T16:00:00Z',
    userId: '9',
    userName: 'علي أحمد',
    duration: 180,
    location: 'مقر الشركة - الرياض',
    outcome: 'تم الاتفاق على خصم 8% مع تحسين المواصفات'
  },

  // أنشطة الصفقة 5
  {
    id: '21',
    dealId: '5',
    type: 'created',
    title: 'تم إنشاء الصفقة',
    description: 'تم إنشاء صفقة جديدة لشركة التجزئة الكبرى',
    date: '2024-02-05T09:15:00Z',
    userId: '10',
    userName: 'نورا سعد'
  },
  {
    id: '22',
    dealId: '5',
    type: 'meeting',
    title: 'اجتماع استراتيجي',
    description: 'اجتماع استراتيجي لدراسة احتياجات الشركة',
    date: '2024-02-08T13:30:00Z',
    userId: '10',
    userName: 'نورا سعد',
    duration: 90,
    location: 'المقر الرئيسي - جدة',
    outcome: 'تم تحديد الأهداف الاستراتيجية والمتطلبات'
  },
  {
    id: '23',
    dealId: '5',
    type: 'proposal',
    title: 'عرض استراتيجي',
    description: 'عرض استراتيجي شامل لحلول الشركة',
    date: '2024-02-12T11:00:00Z',
    userId: '10',
    userName: 'نورا سعد',
    attachments: ['عرض_استراتيجي_شركة_التجزئة.pdf']
  },
  {
    id: '24',
    dealId: '5',
    type: 'followup',
    title: 'متابعة دورية',
    description: 'مكالمة متابعة دورية مع العميل',
    date: '2024-02-15T15:00:00Z',
    userId: '10',
    userName: 'نورا سعد',
    outcome: 'العميل راضٍ عن العرض ويحتاج موافقة الإدارة'
  }
];

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

// Add a general sales manager with no team or region
mockUsers.push({
  id: 'sm-general',
  name: 'مدير مبيعات عام',
  email: 'general.manager@example.com',
  phone: '',
  department: 'Sales',
  role: 'sales_manager',
  teamId: undefined,
  region: undefined,
  isActive: true,
  joinDate: '2024-01-01',
  permissions: getPermissionsForRole('sales_manager'),
  managerId: undefined,
  preferences: {
    theme: 'light',
    notifications: { email: true, push: true, desktop: true },
    language: 'ar',
    timezone: 'Asia/Riyadh'
  }
});

// تحديث بيانات مدراء المبيعات لإضافة سجل الفرق السابقة
mockUsers.forEach(user => {
  if (user.role === 'sales_manager') {
    // إضافة خاصية previousTeams إذا لم تكن موجودة
    if (!('previousTeams' in user)) {
      // مثال: فاطمة علي كانت تدير فريق 3 سابقاً
      if (user.id === '2') {
        user.previousTeams = ['3'];
      } else {
        user.previousTeams = [];
      }
    }
  }
});

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
    title: 'متابعة عرض السعر مع شركة التقنية المتقدمة',
    description: 'جدولة مكالمة لمناقشة عرض الترخيص المؤسسي والتفاصيل التقنية',
    dueDate: '2024-01-25',
    status: 'pending',
    priority: 'high',
    clientId: '1',
    dealId: '1',
    assignee: '6', // سارة أحمد - فريق الرياض
    createdBy: '6'
  },
  {
    id: '2',
    title: 'إعداد العقد النهائي لشركة الابتكار التقني',
    description: 'صياغة العقد النهائي لمشروع الهجرة السحابية مع جميع الشروط والضمانات',
    dueDate: '2024-01-22',
    status: 'done',
    priority: 'medium',
    clientId: '2',
    dealId: '2',
    assignee: '7', // أحمد محمد - فريق الرياض
    createdBy: '7'
  },
  {
    id: '3',
    title: 'تحليل متطلبات شركة تدفق البيانات',
    description: 'دراسة وتحليل المتطلبات التقنية لمنصة التحليلات والذكاء الاصطناعي',
    dueDate: '2024-01-30',
    status: 'pending',
    priority: 'medium',
    clientId: '3',
    dealId: '3',
    assignee: '6', // سارة أحمد - فريق الرياض
    createdBy: '6'
  },
  {
    id: '4',
    title: 'مكالمات المتابعة الشهرية مع العملاء النشطين',
    description: 'جدولة وإجراء مكالمات المتابعة الشهرية مع جميع العملاء النشطين لتقييم رضاهم',
    dueDate: '2024-01-28',
    status: 'pending',
    priority: 'low',
    assignee: '7', // أحمد محمد - فريق الرياض
    createdBy: '7'
  },
  {
    id: '5',
    title: 'إعداد عرض تجاري لشركة الحلول الذكية',
    description: 'تحضير عرض تجاري شامل لمشروع نظام إدارة المخزون مع التحليلات المتقدمة',
    dueDate: '2024-02-05',
    status: 'pending',
    priority: 'high',
    clientId: '4',
    dealId: '4',
    assignee: '8', // فاطمة علي - فريق جدة
    createdBy: '8'
  },
  {
    id: '6',
    title: 'اجتماع مع فريق شركة النظم المتكاملة',
    description: 'اجتماع تقني مع فريق العميل لمناقشة تفاصيل مشروع البوابات الإلكترونية',
    dueDate: '2024-02-08',
    status: 'pending',
    priority: 'medium',
    clientId: '5',
    dealId: '5',
    assignee: '9', // عمر خالد - فريق جدة
    createdBy: '9'
  },
  {
    id: '7',
    title: 'مراجعة العقد مع شركة التقنية الخضراء',
    description: 'مراجعة شاملة للعقد مع فريق القانون قبل التوقيع النهائي',
    dueDate: '2024-02-12',
    status: 'done',
    priority: 'high',
    clientId: '6',
    dealId: '6',
    assignee: '8', // فاطمة علي - فريق جدة
    createdBy: '8'
  },
  {
    id: '8',
    title: 'إعداد خطة التنفيذ لشركة البيانات الآمنة',
    description: 'وضع خطة تنفيذ مفصلة لمشروع نظام الأمان السيبراني مع الجدول الزمني',
    dueDate: '2024-02-15',
    status: 'pending',
    priority: 'medium',
    clientId: '7',
    dealId: '7',
    assignee: '9', // عمر خالد - فريق جدة
    createdBy: '9'
  },
  {
    id: '9',
    title: 'متابعة دفع شركة الحلول السحابية',
    description: 'متابعة عملية الدفع مع قسم المحاسبة وتأكيد استلام المبلغ',
    dueDate: '2024-02-18',
    status: 'pending',
    priority: 'low',
    clientId: '8',
    dealId: '8',
    assignee: '10', // يوسف أحمد - فريق الدمام
    createdBy: '10'
  },
  {
    id: '10',
    title: 'إعداد تقرير الأداء الشهري',
    description: 'إعداد تقرير شامل عن أداء المبيعات والإنجازات المحققة خلال الشهر',
    dueDate: '2024-02-20',
    status: 'pending',
    priority: 'medium',
    assignee: '6', // سارة أحمد - فريق الرياض
    createdBy: '6'
  },
  {
    id: '11',
    title: 'اجتماع مع شركة التقنية المستقبلية',
    description: 'اجتماع تمهيدي لمناقشة مشروع الذكاء الاصطناعي والروبوتات',
    dueDate: '2024-02-25',
    status: 'pending',
    priority: 'high',
    clientId: '9',
    dealId: '9',
    assignee: '11', // فهد سعد - فريق الدمام
    createdBy: '11'
  },
  {
    id: '12',
    title: 'إعداد عرض تجاري لشركة الحلول المتقدمة',
    description: 'تحضير عرض تجاري لمشروع نظام إدارة الموارد البشرية المتكامل',
    dueDate: '2024-03-01',
    status: 'pending',
    priority: 'medium',
    clientId: '10',
    dealId: '10',
    assignee: '12', // لينا محمد - فريق الدمام
    createdBy: '12'
  },
  {
    id: '13',
    title: 'متابعة تنفيذ مشروع شركة التقنية المتقدمة',
    description: 'متابعة مراحل تنفيذ المشروع والتأكد من الالتزام بالجدول الزمني',
    dueDate: '2024-03-05',
    status: 'pending',
    priority: 'high',
    clientId: '1',
    dealId: '1',
    assignee: '6', // سارة أحمد - فريق الرياض
    createdBy: '6'
  },
  {
    id: '14',
    title: 'إعداد خطة التدريب لشركة الابتكار التقني',
    description: 'وضع خطة تدريب شاملة لفريق العميل على النظام الجديد',
    dueDate: '2024-03-08',
    status: 'pending',
    priority: 'medium',
    clientId: '2',
    dealId: '2',
    assignee: '7', // أحمد محمد - فريق الرياض
    createdBy: '7'
  },
  {
    id: '15',
    title: 'مراجعة العقد مع شركة البيانات الآمنة',
    description: 'مراجعة نهائية للعقد قبل التوقيع والتأكد من جميع الشروط',
    dueDate: '2024-03-10',
    status: 'pending',
    priority: 'high',
    clientId: '7',
    dealId: '7',
    assignee: '9', // عمر خالد - فريق جدة
    createdBy: '9'
  },
  {
    id: '16',
    title: 'متابعة عرض الأسعار مع شركة المستقبل',
    description: 'التواصل مع نورا سعد لمناقشة عرض الأسعار المقدم.',
    dueDate: '2024-03-12',
    status: 'pending',
    priority: 'high',
    clientId: '4',
    dealId: '4',
    assignee: '8', // عبدالرحمن محمد
    createdBy: '4'
  },
  {
    id: '17',
    title: 'إعداد تقرير الأداء لفريق الرياض',
    description: 'تحليل أداء فريق الرياض وتقديم تقرير للمدير.',
    dueDate: '2024-03-15',
    status: 'pending',
    priority: 'medium',
    assignee: '3', // سارة أحمد
    createdBy: '2'
  },
  {
    id: '18',
    title: 'جدولة عرض تجريبي لشركة الإبداع',
    description: 'تحديد موعد لعرض تجريبي لمنصة التجارة الإلكترونية.',
    dueDate: '2024-03-14',
    status: 'pending',
    priority: 'high',
    clientId: '10',
    dealId: '10',
    assignee: '10', // يوسف أحمد
    createdBy: '5'
  },
  {
    id: '19',
    title: 'مراجعة ملاحظات العميل لصفقة "حلول الذكاء الاصطناعي"',
    description: 'مراجعة الملاحظات من سامي العتيبي والتنسيق مع الفريق الفني.',
    dueDate: '2024-03-18',
    status: 'pending',
    priority: 'high',
    clientId: '12',
    dealId: '12',
    assignee: '12', // لينا محمد
    createdBy: '14'
  },
  {
    id: '20',
    title: 'تحديث بيانات العميل "شركة القصيم"',
    description: 'إضافة معلومات الاتصال الجديدة وتحديث حالة العميل.',
    dueDate: '2024-03-11',
    status: 'done',
    priority: 'low',
    clientId: '13',
    assignee: '15', // سعيد الحربي
    createdBy: '15'
  },
  {
    id: '21',
    title: 'التحضير لاجتماع فريق جدة الأسبوعي',
    description: 'إعداد أجندة الاجتماع ومشاركة النقاط الرئيسية.',
    dueDate: '2024-03-13',
    status: 'pending',
    priority: 'medium',
    assignee: '7', // نورا سعد
    createdBy: '4'
  },
  {
    id: '22',
    title: 'إرسال عقد "خدمة الاستشارات التقنية" للتوقيع',
    description: 'إرسال النسخة النهائية من العقد إلى عبدالله فهد.',
    dueDate: '2024-02-28',
    status: 'done',
    priority: 'high',
    clientId: '7',
    dealId: '7',
    assignee: '7', // نورا سعد
    createdBy: '4'
  },
  {
    id: '23',
    title: 'مكالمة متابعة مع "شركة الريادة"',
    description: 'متابعة الاهتمام بحلول الأمن السيبراني.',
    dueDate: '2024-03-16',
    status: 'pending',
    priority: 'medium',
    clientId: '9',
    dealId: '9',
    assignee: '9', // ريم عبدالله
    createdBy: '5'
  },
  {
    id: '24',
    title: 'بحث عن عملاء محتملين في قطاع التعليم',
    description: 'تحديد 5 عملاء محتملين جدد في قطاع التعليم بالرياض.',
    dueDate: '2024-03-20',
    status: 'pending',
    priority: 'low',
    assignee: '6', // خالد عبدالله
    createdBy: '2'
  },
  {
    id: '25',
    title: 'إغلاق صفقة "تطوير تطبيق الهاتف المحمول"',
    description: 'تأكيد إتمام الصفقة وتحديث حالتها في النظام إلى "رابحة".',
    dueDate: '2024-01-26',
    status: 'done',
    priority: 'high',
    clientId: '5',
    dealId: '5',
    assignee: '3', // سارة أحمد
    createdBy: '2'
  },
  {
    id: '26',
    title: 'التواصل مع العميل غير النشط "الشركة الرقمية"',
    description: 'محاولة إعادة تفعيل العلاقة مع عمر حسن.',
    dueDate: '2024-03-22',
    status: 'pending',
    priority: 'medium',
    clientId: '5',
    assignee: '3', // سارة أحمد
    createdBy: '2'
  },
  {
    id: '27',
    title: 'تقديم تقرير خسارة صفقة "خدمة تدقيق الأمان"',
    description: 'تحليل أسباب خسارة الصفقة وتقديم تقرير للمدير.',
    dueDate: '2024-01-15',
    status: 'done',
    priority: 'medium',
    clientId: '4',
    dealId: '4',
    assignee: '8', // عبدالرحمن محمد
    createdBy: '4'
  },
  {
    id: '28',
    title: 'جدولة تدريب لفريق الدمام على المنتج الجديد',
    description: 'تنظيم جلسة تدريبية لأعضاء فريق الدمام.',
    dueDate: '2024-03-25',
    status: 'pending',
    priority: 'medium',
    assignee: '10', // يوسف أحمد
    createdBy: '5'
  },
  {
    id: '29',
    title: 'متابعة العقد مع شركة مكة',
    description: 'التأكد من استلام العقد الموقع من سلوى منصور.',
    dueDate: '2024-03-19',
    status: 'pending',
    priority: 'high',
    clientId: '11',
    dealId: '11',
    assignee: '11', // فهد سعد
    createdBy: '13'
  },
  {
    id: '30',
    title: 'إعداد قائمة بالعملاء المحتملين في المدينة المنورة',
    description: 'تجميع قائمة بـ 10 شركات يمكن استهدافها في المدينة.',
    dueDate: '2024-03-28',
    status: 'pending',
    priority: 'low',
    assignee: '12', // لينا محمد
    createdBy: '14'
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