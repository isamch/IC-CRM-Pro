import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { mockClients, mockUsers } from '../data/mockData';
import { Edit2, ArrowLeft, Mail, Phone, Building, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

  // Get available reps for assignment (same logic as Clients page)
  let availableReps: typeof mockUsers = [];
  if (user?.role === 'admin') {
    availableReps = mockUsers.filter(u => u.role === 'sales_representative' || u.role === 'sales_manager');
  } else if (user?.role === 'sales_manager') {
    const managedTeamIds = mockUsers.filter(u => u.role === 'sales_manager' && u.id === user.id).map(u => u.teamId).filter(Boolean);
    availableReps = mockUsers.filter(u => u.role === 'sales_representative' && managedTeamIds.includes(u.teamId || ''));
    if (!availableReps.some(u => u.id === user.id)) {
      availableReps = [user, ...availableReps];
    }
  } else if (user?.role === 'sales_representative') {
    availableReps = [user];
  }

  const handleAssign = () => {
    // Here you would update the assignment in your state/store/backend
    setAssignModal(false);
  };

  return (
    <div className="p-4 max-w-full mx-auto space-y-8 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-200">
      <div className="flex items-center mb-6">
        <Button variant="ghost" icon={ArrowLeft} size="sm" onClick={() => navigate(-1)}>
          العودة
        </Button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white ml-4">تفاصيل العميل</h2>
      </div>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <Card className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4 w-full md:w-1/3">
            <div className="w-28 h-28 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg">
              {client.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="text-center md:text-right">
              <div className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{client.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{client.email}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">{client.company}</div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                client.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                client.status === 'inactive' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                client.status === 'prospect' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                {client.status === 'active' ? 'نشط' : client.status === 'inactive' ? 'غير نشط' : client.status === 'prospect' ? 'عميل محتمل' : 'عميل رائد'}
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span className="font-medium">تاريخ الإضافة:</span>
                {client.createdAt ? ` ${new Date(client.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}` : ' -'}
              </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            <div className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-300">
              <Mail className="w-5 h-5" /> {client.email}
            </div>
            <div className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-300">
              <Phone className="w-5 h-5" /> {client.phone}
            </div>
            <div className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-300">
              <Building className="w-5 h-5" /> {client.company}
            </div>
            <div className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-300">
              <UserPlus className="w-5 h-5" />
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
                  <Edit2 className="w-5 h-5 text-blue-500" />
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>
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
              options={availableReps.map(rep => ({
                value: rep.id,
                label: rep.id === user?.id ? `${rep.name} (أنت)` : rep.name
              }))}
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