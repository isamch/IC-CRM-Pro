import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { mockDeals, mockClients, mockUsers, mockTeams, mockTasks } from '../data/mockData';
import { mockDealActivities, DealActivity } from '../data/mockData';
import { 
  Edit2, ArrowLeft, DollarSign, Calendar, User, Building, 
  TrendingUp, Activity, Users, MapPin, Phone, Mail, 
  CheckCircle, Clock, XCircle, FileText, Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Deal } from '../types';

export const DealDetails: React.FC = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const deal = mockDeals.find(d => d.id === dealId);
  const [editModal, setEditModal] = useState(false);

  if (!deal) {
    return <div className="p-8 text-center text-red-500">الصفقة غير موجودة</div>;
  }

  const client = mockClients.find(c => c.id === deal.clientId);
  const assignedUser = mockUsers.find(u => u.id === deal.assignedTo);
  const assignedUserTeam = assignedUser ? mockTeams.find(team => team.id === assignedUser.teamId) : null;
  const dealTasks = mockTasks.filter(task => task.dealId === deal.id);

  const getStatusBadge = (status: Deal['status']) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      won: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };

    const labels = {
      pending: 'قيد الانتظار',
      won: 'مكتملة',
      lost: 'فاشلة'
    };

    const icons = {
      pending: Clock,
      won: CheckCircle,
      lost: XCircle
    };

    const Icon = icons[status];

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
        <Icon className="w-4 h-4" />
        {labels[status]}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600 dark:text-green-400';
    if (probability >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Mock deal timeline/activities
  const dealActivities: DealActivity[] = mockDealActivities.filter(activity => activity.dealId === deal.id);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created': return '📝';
      case 'meeting': return '🤝';
      case 'proposal': return '📄';
      case 'followup': return '📞';
      case 'negotiation': return '💼';
      case 'contract_sent': return '📋';
      case 'contract_signed': return '✍️';
      case 'won': return '✅';
      case 'lost': return '❌';
      case 'note': return '📝';
      default: return '📋';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'created': return 'text-blue-600 dark:text-blue-400';
      case 'meeting': return 'text-green-600 dark:text-green-400';
      case 'proposal': return 'text-purple-600 dark:text-purple-400';
      case 'followup': return 'text-orange-600 dark:text-orange-400';
      case 'negotiation': return 'text-indigo-600 dark:text-indigo-400';
      case 'contract_sent': return 'text-yellow-600 dark:text-yellow-400';
      case 'contract_signed': return 'text-emerald-600 dark:text-emerald-400';
      case 'won': return 'text-green-600 dark:text-green-400';
      case 'lost': return 'text-red-600 dark:text-red-400';
      case 'note': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatActivityDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} ساعة و ${remainingMinutes} دقيقة` : `${hours} ساعة`;
  };

  const handleSaveDeal = (dealData: Partial<Deal>) => {
    // Here you would update the deal in your state/store/backend
    console.log('Saving deal data:', dealData);
    setEditModal(false);
  };

  return (
    <div className="p-4 max-w-full mx-auto space-y-6 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-200">
      <div className="flex items-center mb-6">
        <Button variant="ghost" icon={ArrowLeft} size="sm" onClick={() => navigate(-1)}>
          العودة
        </Button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white ml-4">تفاصيل الصفقة</h2>
        <div className="flex-1"></div>
        {(user?.role === 'admin' || user?.role === 'sales_manager' || deal.assignedTo === user?.id) && (
          <Button 
            variant="outline" 
            icon={Edit2} 
            size="sm" 
            onClick={() => setEditModal(true)}
          >
            تعديل الصفقة
          </Button>
        )}
      </div>

      {/* Deal Header */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none p-4 rounded-xl">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{deal.title}</h1>
                <div className="flex items-center gap-3">
                  {getStatusBadge(deal.status)}
                  {deal.probability && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${getProbabilityColor(deal.probability)}`}>
                      <Target className="w-4 h-4" />
                      {deal.probability}% نسبة نجاح
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">المبلغ</div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">{formatCurrency(deal.amount)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">تاريخ الإغلاق</div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {new Date(deal.date).toLocaleDateString('ar-EG', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Client Information */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none p-4 rounded-xl">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Building className="w-4 h-4" />
            معلومات العميل
          </h3>
          {client ? (
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
                <Mail className="w-3 h-3 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{client.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{client.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">المنصب:</span>
                <span className="text-gray-700 dark:text-gray-300">{client.position}</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">معلومات العميل غير متوفرة</div>
          )}
        </Card>

        {/* Assigned Representative */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none p-4 rounded-xl">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            المندوب المسؤول
          </h3>
          {assignedUser ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-gray-400" />
                <Link to={`/sales-reps/${assignedUser.id}`} className="text-blue-600 dark:text-blue-300 hover:underline font-medium">
                  {assignedUser.name}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{assignedUser.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{assignedUser.phone}</span>
              </div>
              {assignedUserTeam && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <Link to={`/teams/${assignedUserTeam.id}`} className="text-blue-600 dark:text-blue-300 hover:underline">
                    {assignedUserTeam.name}
                  </Link>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">المنطقة:</span>
                <span className="text-gray-700 dark:text-gray-300">{assignedUser.region}</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">لم يتم تعيين مندوب</div>
          )}
        </Card>

        {/* Deal Statistics */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none p-4 rounded-xl">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            إحصائيات الصفقة
          </h3>
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(deal.amount)}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">قيمة الصفقة</div>
            </div>
            {deal.probability && (
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-600 dark:text-gray-400">نسبة النجاح</span>
                  <span className={`font-medium ${getProbabilityColor(deal.probability)}`}>{deal.probability}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      deal.probability >= 80 ? 'bg-green-500' :
                      deal.probability >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${deal.probability}%` }}
                  ></div>
                </div>
              </div>
            )}
            <div className="text-center">
              <div className="text-base font-semibold text-gray-900 dark:text-white">{dealTasks.length}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">المهام المرتبطة</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Deal Timeline */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none p-4 rounded-xl">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          جدول زمني للصفقة ({dealActivities.length} نشاط)
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-blue">
          {dealActivities.map((activity, index) => (
            <div key={activity.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`text-xl ${getActivityColor(activity.type)}`}>{getActivityIcon(activity.type)}</div>
                {index < dealActivities.length - 1 && (
                  <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600 mt-1"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${getActivityColor(activity.type)}`}>{activity.title}</h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatActivityDate(activity.date)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{activity.description}</p>
                {activity.outcome && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">النتيجة:</span>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{activity.outcome}</p>
                  </div>
                )}
                {activity.location && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3 h-3" />
                    {activity.location}
                  </div>
                )}
                {activity.duration && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    {formatDuration(activity.duration)}
                  </div>
                )}
                {activity.attachments && activity.attachments.length > 0 && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <FileText className="w-3 h-3" />
                    <span>المرفقات: {activity.attachments.join(', ')}</span>
                  </div>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  بواسطة: {activity.userName}
                </div>
              </div>
            </div>
          ))}
          {dealActivities.length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>لا توجد أنشطة مسجلة لهذه الصفقة</p>
            </div>
          )}
        </div>
      </Card>

      {/* Related Tasks */}
      {dealTasks.length > 0 && (
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none p-4 rounded-xl">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            المهام المرتبطة ({dealTasks.length})
          </h3>
          <div className="space-y-2">
            {dealTasks.map(task => (
              <Link to={`/tasks/${task.id}`} key={task.id} className="block border border-gray-200 dark:border-gray-700 rounded-md p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      task.status === 'done' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                    }`}>
                      {task.status === 'done' ? 'مكتملة' : 'قيد التنفيذ'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(task.dueDate).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title="تعديل الصفقة"
      >
        <div className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              المعلومات الأساسية
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان الصفقة</label>
              <input
                type="text"
                defaultValue={deal.title}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل عنوان الصفقة"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المبلغ</label>
                <input
                  type="number"
                  defaultValue={deal.amount}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ الإغلاق</label>
                <input
                  type="date"
                  defaultValue={deal.date}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحالة</label>
                <Select
                  value={deal.status}
                  onChange={(value) => console.log('Status changed:', value)}
                  options={[
                    { value: 'pending', label: 'قيد الانتظار' },
                    { value: 'won', label: 'مكتملة' },
                    { value: 'lost', label: 'فاشلة' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نسبة النجاح (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={deal.probability || 0}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Assignment Information - Only for managers and admins */}
          {(user?.role === 'admin' || user?.role === 'sales_manager') && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                تعيين الصفقة
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العميل</label>
                <Select
                  value={deal.clientId || ''}
                  onChange={(value) => console.log('Client changed:', value)}
                  options={[
                    { value: '', label: 'اختر العميل' },
                    ...mockClients.map(client => ({
                      value: client.id,
                      label: `${client.name} (${client.company})`
                    }))
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المندوب المسؤول</label>
                <Select
                  value={deal.assignedTo || ''}
                  onChange={(value) => console.log('Assigned to changed:', value)}
                  options={[
                    { value: '', label: 'اختر المندوب' },
                    ...mockUsers.filter(u => u.role === 'sales_representative' && u.isActive).map(user => ({
                      value: user.id,
                      label: user.name
                    }))
                  ]}
                />
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              ملاحظات إضافية
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملاحظات الصفقة</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="أضف ملاحظات حول الصفقة..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={() => setEditModal(false)}>
              إلغاء
            </Button>
            <Button onClick={() => handleSaveDeal({})}>
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}; 