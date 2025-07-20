import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { mockUsers, mockTeams, mockClients, mockDeals, mockTasks } from '../data/mockData';
import { ArrowLeft, Users, Calendar } from 'lucide-react';

export const SalesManagerDetails: React.FC = () => {
  const { managerId } = useParams<{ managerId: string }>();
  const navigate = useNavigate();
  const manager = mockUsers.find(u => u.id === managerId && u.role === 'sales_manager');
  if (!manager) {
    return <div className="p-8 text-center text-red-500">مدير المبيعات غير موجود</div>;
  }
  const salesReps = mockUsers.filter(u => u.managerId === manager.id && u.role === 'sales_representative');
  const clients = mockClients.filter(c => {
    // العملاء المخصصون لأي مندوب أو المدير نفسه تحت هذا المدير
    return [manager.id, ...salesReps.map(r => r.id)].includes(c.assignedTo || '');
  });

  // --- Analytics ---
  // جميع الفرق الحالية لهذا المدير
  const currentTeams = mockTeams.filter(t => t.managerId === manager.id);
  // الفرق القديمة (placeholder)
  // في النظام الحقيقي، يجب حفظ سجل الفرق السابقة للمدير في قاعدة البيانات
  const previousTeams: { id: string; name: string }[] = [];
  // مثال: previousTeams = [{ id: '2', name: 'فريق جدة' }];
  // جميع العملاء تحت الإدارة
  const allRepIds = [manager.id, ...salesReps.map(r => r.id)];
  const managerDeals = mockDeals.filter(d => allRepIds.includes(d.assignedTo || ''));
  const managerTasks = mockTasks.filter(t => allRepIds.includes(t.assignee || ''));
  const revenue = managerDeals.filter(d => d.status === 'won').reduce((sum, d) => sum + d.amount, 0);
  const totalDeals = managerDeals.length;
  const wonDeals = managerDeals.filter(d => d.status === 'won').length;
  const successRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0;
  const activeClients = clients.filter(c => c.status === 'active').length;
  // أحدث المهام (recent activity)
  const recentTasks = managerTasks.slice(0, 5);

  // --- Teams Table ---
  const teamsTable = currentTeams.length > 0 && (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none p-6 rounded-2xl">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Users className="w-5 h-5" /> الفرق تحت الإدارة</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm rounded-lg overflow-hidden bg-white dark:bg-gray-900">
          <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">اسم الفريق</th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">عدد المندوبين</th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">عدد العملاء</th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">رابط الفريق</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {currentTeams.map(team => {
              const reps = mockUsers.filter(u => u.teamId === team.id && u.role === 'sales_representative');
              const teamClients = mockClients.filter(c => reps.map(r => r.id).includes(c.assignedTo || ''));
              return (
                <tr key={team.id}>
                  <td className="px-4 py-2 font-semibold text-blue-600 dark:text-blue-300">
                    <Link to={`/teams/${team.id}`}>{team.name}</Link>
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{reps.length}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{teamClients.length}</td>
                  <td className="px-4 py-2">
                    <Link to={`/teams/${team.id}`} className="text-blue-500 dark:text-blue-300 hover:underline">عرض التفاصيل</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );

  // --- Sales Reps Table ---
  const repsTable = salesReps.length > 0 && (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none p-6 rounded-2xl">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Users className="w-5 h-5" /> مندوبي المبيعات تحت الإدارة</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm rounded-lg overflow-hidden bg-white dark:bg-gray-900">
          <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">اسم المندوب</th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">الفريق</th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">عدد العملاء</th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">الحالة</th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">رابط المندوب</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {salesReps.map(rep => {
              const repTeam = mockTeams.find(t => t.id === rep.teamId);
              const repClients = mockClients.filter(c => c.assignedTo === rep.id);
              return (
                <tr key={rep.id}>
                  <td className="px-4 py-2 font-semibold text-blue-600 dark:text-blue-300">
                    <Link to={`/sales-reps/${rep.id}`}>{rep.name}</Link>
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{repTeam ? repTeam.name : 'بدون فريق'}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{repClients.length}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      rep.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {rep.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <Link to={`/sales-reps/${rep.id}`} className="text-blue-500 dark:text-blue-300 hover:underline">عرض التفاصيل</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );

  // --- Clients Table ---
  const clientsTable = clients.length > 0 && (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none p-6 rounded-2xl">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Users className="w-5 h-5" /> العملاء تحت الإدارة</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm rounded-lg overflow-hidden bg-white dark:bg-gray-900">
          <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">اسم العميل</th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">البريد الإلكتروني</th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">الشركة</th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">المندوب المكلف</th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">الحالة</th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">رابط العميل</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {clients.map(client => {
              const assignedRep = mockUsers.find(u => u.id === client.assignedTo);
              return (
                <tr key={client.id}>
                  <td className="px-4 py-2 font-semibold text-blue-600 dark:text-blue-300">
                    <Link to={`/clients/${client.id}`}>{client.name}</Link>
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{client.email}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{client.company}</td>
                  <td className="px-4 py-2">
                    {assignedRep ? (
                      <Link to={`/sales-reps/${assignedRep.id}`} className="text-blue-600 dark:text-blue-300 hover:underline">{assignedRep.name}</Link>
                    ) : 'غير محدد'}
                  </td>
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
                  <td className="px-4 py-2">
                    <Link to={`/clients/${client.id}`} className="text-blue-500 dark:text-blue-300 hover:underline">عرض التفاصيل</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );

  return (
    <div className="p-4 max-w-full mx-auto space-y-6 bg-gray-50 dark:bg-gray-950 transition-colors duration-200 min-h-screen">
      <div className="flex items-center mb-4">
        <Button variant="ghost" icon={ArrowLeft} size="sm" onClick={() => navigate(-1)}>
          العودة
        </Button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white ml-4">تفاصيل مدير المبيعات</h2>
      </div>
      {/* بيانات المدير والفرق */}
      <Card className="space-y-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{manager.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{manager.email}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500">{manager.region}</div>
            {/* الفرق الحالية */}
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              الفرق الحالية: {currentTeams.length > 0 ? currentTeams.map(t => (
                <Link key={t.id} to={`/teams/${t.id}`} className="text-blue-600 dark:text-blue-300 hover:underline mr-2">{t.name}</Link>
              )) : 'لا يوجد فريق حالي'}
            </div>
            {/* الفرق القديمة */}
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              الفرق القديمة: {previousTeams.length > 0 ? previousTeams.map(t => (
                <Link key={t.id} to={`/teams/${t.id}`} className="text-blue-600 dark:text-blue-300 hover:underline mr-2">{t.name}</Link>
              )) : 'لا يوجد سجل'}
            </div>
          </div>
        </div>
      </Card>
      {/* Analytics Card */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">تحليلات المدير</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">{clients.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">إجمالي العملاء</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-300">{managerDeals.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">العقود</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">{managerTasks.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">المهام</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-300">{revenue.toLocaleString()} ريال</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">إجمالي الإيرادات</div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-4">
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-300">{activeClients}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">عملاء نشطون</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">{successRate}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">معدل النجاح (العقود)</div>
          </div>
        </div>
      </Card>
      {/* Recent Activity */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Calendar className="w-5 h-5" /> أحدث المهام</h3>
        {recentTasks.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-6">لا يوجد مهام حديثة.</div>
        ) : (
          <div className="space-y-3">
            {recentTasks.map(task => (
              <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  task.status === 'done' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">{task.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {mockUsers.find(u => u.id === task.assignee)?.name} • {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'done' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                }`}>
                  {task.status === 'done' ? 'مكتملة' : 'قيد التنفيذ'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
      {teamsTable}
      {repsTable}
      {clientsTable}
    </div>
  );
}; 