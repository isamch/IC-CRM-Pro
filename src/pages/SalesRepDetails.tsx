import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { mockUsers, mockClients, mockTeams } from '../data/mockData';
import { ArrowLeft, Mail, Phone, Building, Users } from 'lucide-react';

export const SalesRepDetails: React.FC = () => {
  const { repId } = useParams<{ repId: string }>();
  const navigate = useNavigate();

  const rep = mockUsers.find(u => u.id === repId);
  if (!rep) {
    return <div className="p-6 text-center text-red-500">المندوب غير موجود</div>;
  }
  const team = rep.teamId ? mockTeams.find(t => t.id === rep.teamId) : undefined;
  const assignedClients = mockClients.filter(c => c.assignedTo === rep.id);

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="ghost" icon={ArrowLeft} size="sm" onClick={() => navigate(-1)}>
          العودة
        </Button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white ml-4">تفاصيل المندوب</h2>
      </div>
      <Card className="space-y-2">
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
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">العملاء المخصصون لهذا المندوب</h3>
        {assignedClients.length === 0 ? (
          <div className="text-center text-gray-500 py-6">لا يوجد عملاء مخصصون لهذا المندوب.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-right">اسم العميل</th>
                  <th className="px-4 py-2 text-right">البريد الإلكتروني</th>
                  <th className="px-4 py-2 text-right">الشركة</th>
                  <th className="px-4 py-2 text-right">الحالة</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {assignedClients.map(client => (
                  <tr key={client.id}>
                    <td className="px-4 py-2">{client.name}</td>
                    <td className="px-4 py-2">{client.email}</td>
                    <td className="px-4 py-2">{client.company}</td>
                    <td className="px-4 py-2">{client.status === 'active' ? 'نشط' : client.status === 'inactive' ? 'غير نشط' : client.status === 'prospect' ? 'عميل محتمل' : 'عميل رائد'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}; 