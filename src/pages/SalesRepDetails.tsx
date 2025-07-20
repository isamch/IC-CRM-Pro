import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { mockUsers, mockClients, mockTeams } from '../data/mockData';
import { ArrowLeft, Mail, Phone, Building, Users, Edit2, Eye } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';

export const SalesRepDetails: React.FC = () => {
  const { repId } = useParams<{ repId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  // Assignment modal state
  const [assignModal, setAssignModal] = useState<{ open: boolean; clientId?: string }>({ open: false });
  const [assignTo, setAssignTo] = useState('');

  const rep = mockUsers.find(u => u.id === repId);
  if (!rep) {
    return <div className="p-6 text-center text-red-500">المندوب غير موجود</div>;
  }
  const team = rep.teamId ? mockTeams.find(t => t.id === rep.teamId) : undefined;
  const assignedClients = mockClients.filter(c => c.assignedTo === rep.id);

  // Get available reps for assignment (same logic as Clients page)
  let availableReps: typeof mockUsers = [];
  if (user?.role === 'admin') {
    availableReps = mockUsers.filter(u => u.role === 'sales_representative' || u.role === 'sales_manager');
  } else if (user?.role === 'sales_manager') {
    const managedTeamIds = mockTeams.filter(team => team.managerId === user.id).map(team => team.id);
    availableReps = mockUsers.filter(u => u.role === 'sales_representative' && managedTeamIds.includes(u.teamId || ''));
    if (!availableReps.some(u => u.id === user.id)) {
      availableReps = [user, ...availableReps];
    }
  } else if (user?.role === 'sales_representative') {
    availableReps = [user];
  }

  // Handle open/close assign modal
  const handleOpenAssign = (clientId: string, currentAssigned: string) => {
    setAssignModal({ open: true, clientId });
    setAssignTo(currentAssigned);
  };
  const handleAssign = () => {
    // Here you would update the assignment in your state/store/backend
    setAssignModal({ open: false });
  };

  return (
    <div className="p-4 max-w-full mx-auto space-y-6 bg-gray-50 dark:bg-gray-950 transition-colors duration-200 min-h-screen">
      <div className="flex items-center mb-4">
        <Button variant="ghost" icon={ArrowLeft} size="sm" onClick={() => navigate(-1)}>
          العودة
        </Button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white ml-4">تفاصيل المندوب</h2>
      </div>
      <Card className="space-y-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{rep.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{rep.email}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500">{team ? team.name : 'بدون فريق'}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1"><Mail className="w-4 h-4" /> {rep.email}</div>
          <div className="flex items-center gap-1"><Phone className="w-4 h-4" /> {rep.phone}</div>
          <div className="flex items-center gap-1"><Building className="w-4 h-4" /> {rep.department}</div>
        </div>
      </Card>
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">العملاء المخصصون لهذا المندوب</h3>
        {assignedClients.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-6">لا يوجد عملاء مخصصون لهذا المندوب.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm rounded-lg overflow-hidden bg-white dark:bg-gray-900">
              <thead className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">الصورة</th>
                  <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">اسم العميل</th>
                  <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">البريد الإلكتروني</th>
                  <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">الشركة</th>
                  <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">الحالة</th>
                  {(user?.role === 'admin' || user?.role === 'sales_manager') && (
                    <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">تعديل التعيين</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {assignedClients.map(client => (
                  <tr key={client.id} className="hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-base font-bold text-white">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <Link to={`/clients/${client.id}`} className="font-semibold text-blue-600 dark:text-blue-300 hover:underline">
                        {client.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{client.email}</td>
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{client.company}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        client.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        client.status === 'inactive' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        client.status === 'prospect' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {client.status === 'active' ? 'نشط' : client.status === 'inactive' ? 'غير نشط' : client.status === 'prospect' ? 'عميل محتمل' : 'عميل رائد'}
                      </span>
                    </td>
                    {(user?.role === 'admin' || user?.role === 'sales_manager') && (
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="تغيير المندوب المكلف"
                            onClick={() => handleOpenAssign(client.id, client.assignedTo || '')}
                          >
                            <Edit2 className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="عرض تفاصيل العميل"
                            onClick={() => navigate(`/clients/${client.id}`)}
                          >
                            <Eye className="w-4 h-4 text-gray-500 dark:text-gray-200" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {/* Assign Modal */}
      <Modal
        isOpen={assignModal.open}
        onClose={() => setAssignModal({ open: false })}
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
              <Button variant="outline" onClick={() => setAssignModal({ open: false })}>
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