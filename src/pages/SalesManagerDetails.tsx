import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { mockUsers, mockTeams, mockClients } from '../data/mockData';
import { ArrowLeft, Mail, Phone, Building2, Users, Calendar, User } from 'lucide-react';

export const SalesManagerDetails: React.FC = () => {
  const { managerId } = useParams<{ managerId: string }>();
  const navigate = useNavigate();
  const manager = mockUsers.find(u => u.id === managerId && u.role === 'sales_manager');
  if (!manager) {
    return <div className="p-8 text-center text-red-500">مدير المبيعات غير موجود</div>;
  }
  const team = manager.teamId ? mockTeams.find(t => t.id === manager.teamId) : undefined;
  const salesReps = mockUsers.filter(u => u.managerId === manager.id && u.role === 'sales_representative');
  const clients = mockClients.filter(c => {
    // العملاء المخصصون لأي مندوب أو المدير نفسه تحت هذا المدير
    return [manager.id, ...salesReps.map(r => r.id)].includes(c.assignedTo || '');
  });

  return (
    <div className="p-4 max-w-full mx-auto space-y-8 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-200">
      <div className="flex items-center mb-6">
        <Button variant="ghost" icon={ArrowLeft} size="sm" onClick={() => navigate(-1)}>
          العودة
        </Button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white ml-4">تفاصيل مدير المبيعات</h2>
      </div>
      <Card className="flex flex-col md:flex-row gap-8 items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none p-8 rounded-2xl">
        <div className="flex flex-col items-center md:items-start gap-4 w-full md:w-1/3">
          <div className="w-28 h-28 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg">
            {manager.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="text-center md:text-right">
            <div className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{manager.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{manager.email}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">{manager.region} • {team?.name}</div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">مدير المبيعات</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          <div className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-300">
            <Mail className="w-5 h-5" /> {manager.email}
          </div>
          <div className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-300">
            <Phone className="w-5 h-5" /> {manager.phone}
          </div>
          <div className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-300">
            <Building2 className="w-5 h-5" /> {team?.name || 'بدون فريق'}
          </div>
          <div className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-300">
            <Calendar className="w-5 h-5" /> انضم: {manager.joinDate}
          </div>
          <div className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-300">
            <User className="w-5 h-5" /> آخر دخول: {manager.lastLogin ? new Date(manager.lastLogin).toLocaleString('ar-SA') : 'غير متوفر'}
          </div>
        </div>
      </Card>
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none p-6 rounded-2xl">
        <div className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5" /> مندوبي المبيعات تحت الإدارة</div>
        {salesReps.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-6">لا يوجد مندوبي مبيعات تحت هذا المدير.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salesReps.map(rep => (
              <Link to={`/sales-reps/${rep.id}`} key={rep.id} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-lg font-bold text-white">
                  {rep.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{rep.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{rep.email}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">{rep.phone}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none p-6 rounded-2xl">
        <div className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5" /> العملاء تحت الإدارة</div>
        {clients.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-6">لا يوجد عملاء تحت هذا المدير.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map(client => (
              <Link to={`/clients/${client.id}`} key={client.id} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-lg font-bold text-white">
                  {client.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{client.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{client.email}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">{client.company}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}; 