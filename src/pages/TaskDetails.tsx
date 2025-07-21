import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { mockTasks, mockClients, mockUsers, mockDeals } from '../data/mockData';
import { 
  Edit2, ArrowLeft, Calendar, User, Clock, 
  AlertTriangle, FileText, Target, Building, DollarSign,
  CheckCircle, AlertCircle, Users2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Task } from '../types';
import { mockTeams } from '../data/mockData';
import { UnauthorizedPage } from '../components/auth/UnauthorizedPage';

export const TaskDetails: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const task = mockTasks.find(t => t.id === taskId);
  if (!task) {
    return <div className="p-8 text-center text-red-500">المهمة غير موجودة</div>;
  }
  const assignee = mockUsers.find(u => u.id === task.assignee);
  const team = mockTeams.find(t => t.id === task.teamId);
  const deal = task.dealId ? mockDeals.find(d => d.id === task.dealId) : undefined;
  const client = task.clientId ? mockClients.find(c => c.id === task.clientId) : undefined;

  // Access control
  const isAdmin = currentUser?.role === 'admin';
  const isAssignee = currentUser?.id === task.assignee;
  let isManagerOfAssignee = false;
  if (currentUser?.role === 'sales_manager' && assignee && assignee.teamId) {
    const managedTeams = mockTeams.filter(team => team.managerId === currentUser.id).map(team => team.id);
    isManagerOfAssignee = managedTeams.includes(assignee.teamId);
  }
  const isDealOwner = deal && deal.assignedTo === currentUser?.id;
  if (!isAdmin && !isAssignee && !isManagerOfAssignee && !isDealOwner) {
    return <UnauthorizedPage message="لا يمكنك عرض تفاصيل هذه المهمة." />;
  }

  const [editModalOpen, setEditModalOpen] = useState(false);

  if (!task) {
    return <div className="p-8 text-center text-red-500">المهمة غير موجودة</div>;
  }

  // Check permissions - only show task if user has access
  const hasAccess = currentUser?.role === 'admin' || 
                   isDealOwner ||
                   (currentUser?.role === 'sales_manager' && (() => {
                     const assignee = mockUsers.find(u => u.id === task.assignee);
                     return assignee?.teamId === currentUser.teamId;
                   })()) ||
                   (currentUser?.role === 'sales_representative' && task.assignee === currentUser.id);

  if (!hasAccess) {
    return <div className="p-8 text-center text-red-500">ليس لديك صلاحية لعرض هذه المهمة</div>;
  }

  const getPriorityBadge = (priority: Task['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };

    const labels = {
      low: 'منخفضة',
      medium: 'متوسطة',
      high: 'عالية'
    };

    const icons = {
      low: AlertCircle,
      medium: Clock,
      high: AlertTriangle
    };

    const Icon = icons[priority];

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${colors[priority]}`}>
        <Icon className="w-4 h-4" />
        {labels[priority]}
      </span>
    );
  };

  const getStatusBadge = (status: Task['status']) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      done: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    };

    const labels = {
      pending: 'قيد التنفيذ',
      done: 'مكتملة'
    };

    const icons = {
      pending: Clock,
      done: CheckCircle
    };

    const Icon = icons[status];

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
        <Icon className="w-4 h-4" />
        {labels[status]}
      </span>
    );
  };

  const isOverdue = () => {
    return new Date(task.dueDate) < new Date() && task.status === 'pending';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    // Here you would update the task in your state/store/backend
    console.log('Saving task data:', taskData);
    setEditModalOpen(false);
  };

  return (
    <div className="p-4 max-w-full mx-auto space-y-6 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-200">
      <div className="flex items-center mb-6">
        <Button variant="ghost" icon={ArrowLeft} size="sm" onClick={() => navigate(-1)}>
          العودة
        </Button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white ml-4">تفاصيل المهمة</h2>
        <div className="flex-1"></div>
        {(currentUser?.role === 'admin' || currentUser?.role === 'sales_manager' || task.assignee === currentUser?.id || isDealOwner) && (
          <Button 
            variant="outline" 
            icon={Edit2} 
            size="sm" 
            onClick={() => setEditModalOpen(true)}
          >
            تعديل المهمة
          </Button>
        )}
      </div>

      {/* Task Header */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none p-4 rounded-xl">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{task.title}</h1>
                <div className="flex items-center gap-3">
                  {getStatusBadge(task.status)}
                  {getPriorityBadge(task.priority)}
                  {isOverdue() && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                      <AlertTriangle className="w-4 h-4" />
                      متأخرة
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {task.description && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الوصف:</h3>
                <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  {task.description}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">تاريخ الاستحقاق</div>
                  <div className={`text-base font-semibold ${isOverdue() ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                    {formatDate(task.dueDate)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users2 className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">الفريق</div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {team ? (
                      <Link to={`/teams/${team.id}`} className="text-blue-600 hover:underline">
                        {team.name}
                      </Link>
                    ) : (
                      'غير محدد'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Related Client */}
        {client && (
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none p-4 rounded-xl">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Building className="w-4 h-4" />
              العميل المرتبط
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-gray-400" />
                <Link to={`/clients/${client.id}`} className="text-blue-600 dark:text-blue-300 hover:underline font-medium">
                  {client.name}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-3 h-3 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{client.company}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">المنصب:</span>
                <span className="text-gray-700 dark:text-gray-300">{client.position}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Related Deal */}
        {deal && (
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none p-4 rounded-xl">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              الصفقة المرتبطة
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-gray-400" />
                <Link to={`/deals/${deal.id}`} className="text-blue-600 dark:text-blue-300 hover:underline font-medium">
                  {deal.title}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {new Intl.NumberFormat('ar-SA', {
                    style: 'currency',
                    currency: 'SAR',
                    minimumFractionDigits: 0,
                  }).format(deal.amount)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">الحالة:</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  deal.status === 'won' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : deal.status === 'lost'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                }`}>
                  {deal.status === 'won' ? 'مكتملة' : deal.status === 'lost' ? 'فاشلة' : 'قيد الانتظار'}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Task Statistics */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none p-4 rounded-xl">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            إحصائيات المهمة
          </h3>
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">الأولوية</div>
            </div>
            <div className="text-center">
              <div className="text-base font-semibold text-gray-900 dark:text-white">
                {task.status === 'done' ? 'مكتملة' : 'قيد التنفيذ'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">الحالة</div>
            </div>
            {isOverdue() && (
              <div className="text-center">
                <div className="text-base font-semibold text-red-600 dark:text-red-400">
                  متأخرة
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">تجاوزت الموعد المحدد</div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Task Timeline */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none p-4 rounded-xl">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          جدول زمني للمهمة
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="text-xl text-blue-600 dark:text-blue-400">📝</div>
              <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600 mt-1"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-blue-600 dark:text-blue-400">إنشاء المهمة</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(task.dueDate)}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                تم إنشاء المهمة بواسطة {assignee?.name || 'غير محدد'}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className={`text-xl ${task.status === 'done' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {task.status === 'done' ? '✅' : '⏳'}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className={`font-medium ${task.status === 'done' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {task.status === 'done' ? 'إكمال المهمة' : 'قيد التنفيذ'}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {task.status === 'done' ? formatDate(task.dueDate) : 'حالياً'}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {task.status === 'done' 
                  ? 'تم إكمال المهمة بنجاح' 
                  : 'المهمة قيد التنفيذ حالياً'
                }
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="تعديل المهمة"
      >
        <div className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              المعلومات الأساسية
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان المهمة</label>
              <input
                type="text"
                defaultValue={task.title}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل عنوان المهمة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وصف المهمة</label>
              <textarea
                rows={3}
                defaultValue={task.description}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="أدخل وصف المهمة..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ الاستحقاق</label>
                <input
                  type="date"
                  defaultValue={task.dueDate}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الأولوية</label>
                <Select
                  value={task.priority}
                  onChange={(value) => console.log('Priority changed:', value)}
                  options={[
                    { value: 'low', label: 'منخفضة' },
                    { value: 'medium', label: 'متوسطة' },
                    { value: 'high', label: 'عالية' }
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحالة</label>
                <Select
                  value={task.status}
                  onChange={(value) => console.log('Status changed:', value)}
                  options={[
                    { value: 'pending', label: 'قيد التنفيذ' },
                    { value: 'done', label: 'مكتملة' }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Assignment Information - Only for managers and admins */}
          {(currentUser?.role === 'admin' || currentUser?.role === 'sales_manager') && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                تعيين المهمة
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المسؤول عن المهمة</label>
                <Select
                  value={task.assignee || ''}
                  onChange={(value) => console.log('Assignee changed:', value)}
                  options={[
                    { value: '', label: 'اختر المسؤول' },
                    ...mockUsers.filter(u => u.role === 'sales_representative' && u.isActive).map(user => {
                      const team = mockTeams.find(t => t.id === user.teamId);
                      return {
                        value: user.id,
                        label: `${user.name} (${team ? team.name : 'بدون فريق'})`
                      }
                    })
                  ]}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => handleSaveTask({})}>
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}; 