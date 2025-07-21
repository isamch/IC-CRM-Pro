import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { mockClients, mockUsers, mockTeams, mockDeals, mockTasks } from '../data/mockData';
import { Edit2, ArrowLeft, Mail, Phone, Building, UserPlus, Users, Activity, MapPin, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UnauthorizedPage } from '../components/auth/UnauthorizedPage';

export const ClientDetails: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const client = mockClients.find(c => c.id === clientId);
  const [assignModal, setAssignModal] = useState(false);
  const [assignTo, setAssignTo] = useState(client ? client.assignedTo || '' : '');

  useEffect(() => {
    if (client) setAssignTo(client.assignedTo || '');
  }, [client?.assignedTo]);

  if (!client) {
    return <div className="p-8 text-center text-red-500">العميل غير موجود</div>;
  }
  const assignedUser = mockUsers.find(u => u.id === client.assignedTo);
  const assignedUserTeam = assignedUser ? mockTeams.find(team => team.id === assignedUser.teamId) : null;
  // Access control
  const isAdmin = user?.role === 'admin';
  const isAssignedRep = user?.id === client.assignedTo;
  let isManagerOfRep = false;
  if (user?.role === 'sales_manager' && assignedUser && assignedUser.teamId) {
    const managedTeams = mockTeams.filter(team => team.managerId === user.id).map(team => team.id);
    isManagerOfRep = managedTeams.includes(assignedUser.teamId);
  }
  if (!isAdmin && !isAssignedRep && !isManagerOfRep) {
    return <UnauthorizedPage message="لا يمكنك عرض تفاصيل هذا العميل." />;
  }

  // Get client's deals
  const clientDeals = mockDeals.filter(deal => deal.clientId === client.id);
  
  // Get client's tasks
  const clientTasks = mockTasks.filter(task => task.clientId === client.id);
  
  // Get assigned user's team
  const relatedTeams = mockTeams.filter(team => {
    const teamMembers = mockUsers.filter(u => u.teamId === team.id);
    return teamMembers.some(member => member.id === client.assignedTo);
  });
  
  // Mock events/activities for the client
  const clientEvents = [
    {
      id: '1',
      type: 'call',
      title: 'مكالمة هاتفية',
      description: 'متابعة عرض السعر الجديد',
      date: '2024-01-20',
      user: assignedUser?.name || 'غير محدد'
    },
    {
      id: '2',
      type: 'meeting',
      title: 'اجتماع',
      description: 'عرض المنتجات الجديدة',
      date: '2024-01-18',
      user: assignedUser?.name || 'غير محدد'
    },
    {
      id: '3',
      type: 'email',
      title: 'بريد إلكتروني',
      description: 'إرسال الكتالوج المحدث',
      date: '2024-01-15',
      user: assignedUser?.name || 'غير محدد'
    }
  ];

  // Get available reps for assignment
  let availableReps: typeof mockUsers = [];
  if (user?.role === 'admin') {
    availableReps = mockUsers.filter(u => u.role === 'sales_representative' && u.isActive);
  } else if (user?.role === 'sales_manager') {
    availableReps = mockUsers.filter(u => u.role === 'sales_representative' && u.teamId === user.teamId && u.isActive);
  }

  const handleAssign = () => {
    // Here you would update the assignment in your state/store/backend
    setAssignModal(false);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'call': return '📞';
      case 'meeting': return '🤝';
      case 'email': return '📧';
      default: return '📝';
    }
  };

  const getDealStatusBadge = (status: string) => {
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

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
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

  const getAssignedUserName = (assignedTo?: string) => {
    if (!assignedTo) return 'غير محدد';
    const assignedUser = mockUsers.find(u => u.id === assignedTo && u.role === 'sales_representative');
    if (!assignedUser) return 'غير محدد';
    
    return (
      <Link 
        to={`/sales-reps/${assignedUser.id}`} 
        className="text-blue-600 dark:text-blue-300 hover:underline"
      >
        {assignedUser.name}
      </Link>
    );
  };

  return (
    <div className="p-4 max-w-full mx-auto space-y-8 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-200">
      <div className="flex items-center mb-6">
        <Button variant="ghost" icon={ArrowLeft} size="sm" onClick={() => navigate(-1)}>
          العودة
        </Button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white ml-4">تفاصيل العميل</h2>
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <Card className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none p-4 rounded-xl flex flex-col md:flex-row items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-2 w-full md:w-1/4">
            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow">
              {client.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="text-center md:text-right">
              <div className="text-base font-semibold text-gray-900 dark:text-white mb-0.5">{client.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{client.email}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">{client.company}</div>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium mb-1 ${
                client.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                client.status === 'inactive' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                client.status === 'prospect' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                {client.status === 'active' ? 'نشط' : client.status === 'inactive' ? 'غير نشط' : client.status === 'prospect' ? 'عميل محتمل' : 'عميل رائد'}
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                <span className="font-medium">تاريخ الإضافة:</span>
                {client.createdAt ? ` ${new Date(client.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}` : ' -'}
              </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
              <Mail className="w-4 h-4" /> {client.email}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
              <Phone className="w-4 h-4" /> {client.phone}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
              <Building className="w-4 h-4" /> {client.company}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
              <UserPlus className="w-4 h-4" />
              <span>مخصص لـ: {assignedUser ? (
                <Link to={`/sales-reps/${assignedUser.id}`} className="text-blue-600 dark:text-blue-300 hover:underline">
                  {assignedUser.name}
                </Link>
              ) : 'غير محدد'}</span>
              {(user?.role === 'admin' || user?.role === 'sales_manager') && (
                <button
                  className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="تغيير المندوب المكلف"
                  onClick={() => setAssignModal(true)}
                >
                  <Edit2 className="w-4 h-4 text-blue-500" />
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Assigned People Section */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          الأشخاص المسؤولون
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">المندوب المسؤول:</span>
              {assignedUser ? (
                <Link to={`/sales-reps/${assignedUser.id}`} className="text-blue-600 dark:text-blue-300 hover:underline font-medium">
                  {assignedUser.name}
                </Link>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">غير محدد</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">الفريق:</span>
              {assignedUserTeam ? (
                <Link to={`/teams/${assignedUserTeam.id}`} className="text-blue-600 dark:text-blue-300 hover:underline font-medium">
                  {assignedUserTeam.name}
                </Link>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">غير محدد</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">المنطقة:</span>
              <span className="text-gray-700 dark:text-gray-300">{assignedUser?.region || 'غير محدد'}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">عدد الصفقات:</span>
              <span className="text-gray-700 dark:text-gray-300">{clientDeals.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">عدد المهام:</span>
              <span className="text-gray-700 dark:text-gray-300">{clientTasks.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">آخر تواصل:</span>
              <span className="text-gray-700 dark:text-gray-300">
                {client.lastContact ? new Date(client.lastContact).toLocaleDateString('ar-EG') : 'غير محدد'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Client Deals Section */}
      {clientDeals.length > 0 && (
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            صفقات العميل ({clientDeals.length})
          </h3>
          <div className="space-y-4">
            {clientDeals.map(deal => (
              <div key={deal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-lg">{deal.title}</h4>
                      {getDealStatusBadge(deal.status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">المبلغ:</span> {formatCurrency(deal.amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">تاريخ الإغلاق:</span> {new Date(deal.date).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">المندوب المسؤول:</span> {getAssignedUserName(deal.assignedTo)}
                        </span>
                      </div>
                    </div>
                    {deal.probability && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">نسبة النجاح:</span>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                deal.probability >= 80 ? 'bg-green-500' :
                                deal.probability >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${deal.probability}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{deal.probability}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/deals/${deal.id}`}>
                      <Button variant="outline" size="sm">
                        عرض التفاصيل
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(clientDeals.reduce((sum, deal) => sum + deal.amount, 0))}
                </div>
                <div className="text-gray-600 dark:text-gray-400">إجمالي قيمة الصفقات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(clientDeals.filter(d => d.status === 'won').reduce((sum, deal) => sum + deal.amount, 0))}
                </div>
                <div className="text-gray-600 dark:text-gray-400">الصفقات المكتملة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {clientDeals.filter(d => d.status === 'pending').length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">الصفقات قيد الانتظار</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Related Teams Section */}
      {relatedTeams.length > 0 && (
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            الفرق المرتبطة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedTeams.map(team => (
              <div key={team.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <Link to={`/teams/${team.id}`} className="text-blue-600 dark:text-blue-300 hover:underline font-medium">
                  {team.name}
                </Link>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{team.region}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {team.isActive ? 'نشط' : 'غير نشط'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Events/Activities Section */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          الأحداث والأنشطة
        </h3>
        <div className="space-y-3">
          {clientEvents.map(event => (
            <div key={event.id} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="text-2xl">{getEventIcon(event.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(event.date).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{event.description}</p>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  بواسطة: {event.user}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {client.notes && (
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none p-6 rounded-2xl">
          <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">ملاحظات</div>
          <div className="text-base text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded p-3 min-h-[40px]">
            {client.notes}
          </div>
        </Card>
      )}
      {/* Assign Modal */}
      <Modal
        isOpen={assignModal}
        onClose={() => setAssignModal(false)}
        title="تغيير المندوب المكلف بالعميل"
      >
        {availableReps.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-6">لا يوجد مندوبي مبيعات متاحين في فرقك.</div>
        ) : (
          <form
            onSubmit={e => {
              e.preventDefault();
              handleAssign();
            }}
            className="space-y-4"
          >
            <Select
              label="اختر المندوب المكلف"
              value={assignTo}
              onChange={setAssignTo}
              options={availableReps.map(rep => {
                const team = mockTeams.find(t => t.id === rep.teamId);
                const label = rep.id === user?.id 
                  ? `${rep.name} (أنت)` 
                  : `${rep.name} (${team ? team.name : 'بدون فريق'})`;
                return {
                  value: rep.id,
                  label: label
                }
              })}
              required
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setAssignModal(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={!assignTo}>
                تأكيد التعيين
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}; 