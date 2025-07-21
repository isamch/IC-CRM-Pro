import React, { useState } from 'react';
import { Plus, Edit, Trash2, DollarSign, Calendar, User, Search, Filter, Building2, Users } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { mockDeals, mockClients, mockUsers, mockTeams } from '../data/mockData';
import { Deal } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const StatusBadge: React.FC<{ status: Deal['status'] }> = ({ status }) => {
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  );
};

const DealForm: React.FC<{
  deal?: Deal;
  onSave: (deal: Partial<Deal>) => void;
  onCancel: () => void;
}> = ({ deal, onSave, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: deal?.title || '',
    amount: deal?.amount?.toString() || '',
    status: deal?.status || 'pending',
    date: deal?.date || '',
    clientId: deal?.clientId || '',
    probability: deal?.probability?.toString() || '50',
    assignedTo: deal?.assignedTo || (user?.role === 'sales_representative' ? user.id : '')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = mockClients.find(c => c.id === formData.clientId);
    
    // For sales representatives, auto-assign to themselves
    const finalAssignedTo = (user?.role === 'sales_representative' || (user?.role === 'admin' && !formData.assignedTo)) ? user.id : formData.assignedTo;
    
    onSave({
      ...formData,
      amount: parseFloat(formData.amount),
      probability: parseInt(formData.probability),
      clientName: client?.name || '',
      assignedTo: finalAssignedTo
    });
  };

  // Get available users for assignment
  let availableUsers: typeof mockUsers = [];
  if (user?.role === 'admin') {
    availableUsers = mockUsers.filter(u => u.role === 'sales_representative' && u.isActive);
  } else if (user?.role === 'sales_manager') {
    availableUsers = mockUsers.filter(u => u.role === 'sales_representative' && u.teamId === user.teamId && u.isActive);
  }

  const userOptions = availableUsers.map(user => {
    const team = mockTeams.find(t => t.id === user.teamId);
    return {
      value: user.id,
      label: `${user.name} (${team ? team.name : 'بدون فريق'})`
    };
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Role-based information */}
      {user?.role === 'sales_representative' && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>ملاحظة:</strong> ستتم إضافة هذه الصفقة تلقائياً إلى قائمة صفقاتك
          </p>
        </div>
      )}

      <Input
        label="عنوان الصفقة"
        value={formData.title}
        onChange={(value) => setFormData({ ...formData, title: value })}
        placeholder="أدخل عنوان الصفقة"
        required
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="المبلغ"
          type="number"
          value={formData.amount}
          onChange={(value) => setFormData({ ...formData, amount: value })}
          placeholder="0"
          required
        />
        <Input
          label="نسبة النجاح (%)"
          type="number"
          value={formData.probability}
          onChange={(value) => setFormData({ ...formData, probability: value })}
          placeholder="50"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="الحالة"
          value={formData.status}
          onChange={(value) => setFormData({ ...formData, status: value as Deal['status'] })}
          options={[
            { value: 'pending', label: 'قيد الانتظار' },
            { value: 'won', label: 'مكتملة' },
            { value: 'lost', label: 'فاشلة' }
          ]}
          required
        />
        <Input
          label="تاريخ الإغلاق"
          type="date"
          value={formData.date}
          onChange={(value) => setFormData({ ...formData, date: value })}
          required
        />
      </div>
      
      <Select
        label="العميل"
        value={formData.clientId}
        onChange={(value) => setFormData({ ...formData, clientId: value })}
        options={mockClients.map(client => ({
          value: client.id,
          label: `${client.name} (${client.company})`
        }))}
        placeholder="اختر العميل"
        required
      />

      {/* Only show assignment field for managers and admins */}
      {(user?.role === 'admin' || user?.role === 'sales_manager') && (
        <Select
          label="المندوب المسؤول"
          value={formData.assignedTo}
          onChange={(value) => setFormData({ ...formData, assignedTo: value })}
          options={userOptions}
          placeholder="اختر المندوب"
          required
        />
      )}
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit">
          {deal ? 'تحديث الصفقة' : 'إضافة صفقة'}
        </Button>
      </div>
    </form>
  );
};

export const Deals: React.FC = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState(mockDeals);
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | undefined>();
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  // Filter deals based on user permissions
  const visibleDeals = user?.role === 'admin' 
    ? deals 
    : deals.filter(deal => {
        // For non-admin users, only show deals assigned to sales representatives
        if (user?.role === 'sales_manager') {
          // Sales managers can see deals assigned to their team members
          const teamMembers = mockUsers.filter(u => u.teamId === user.teamId && u.role === 'sales_representative');
          return teamMembers.some(member => member.id === deal.assignedTo);
        } else if (user?.role === 'sales_representative') {
          // Sales representatives can only see their own deals
          return deal.assignedTo === user?.id;
        }
        return false;
      });

  const filteredDeals = visibleDeals.filter(deal => {
    const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
    const matchesClient = !clientFilter || deal.clientId === clientFilter;
    const matchesAssigned = !assignedFilter || deal.assignedTo === assignedFilter;
    const matchesTeam = !teamFilter || (() => {
      const assignedUser = mockUsers.find(u => u.id === deal.assignedTo);
      return assignedUser?.teamId === teamFilter;
    })();
    const matchesSearch = !searchTerm || 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesClient && matchesAssigned && matchesTeam && matchesSearch;
  });

  // Group deals by teams
  const groupDealsByTeams = () => {
    const teamsMap = new Map<string, { team: import('../types').Team; deals: Deal[]; totalValue: number; wonValue: number }>();
    
    filteredDeals.forEach(deal => {
      const assignedUser = mockUsers.find(u => u.id === deal.assignedTo);
      if (assignedUser?.teamId) {
        const team = mockTeams.find(t => t.id === assignedUser.teamId);
        if (team) {
          if (!teamsMap.has(team.id)) {
            teamsMap.set(team.id, {
              team,
              deals: [],
              totalValue: 0,
              wonValue: 0
            });
          }
          const teamData = teamsMap.get(team.id)!;
          teamData.deals.push(deal);
          teamData.totalValue += deal.amount;
          if (deal.status === 'won') {
            teamData.wonValue += deal.amount;
          }
        }
      }
    });
    
    return Array.from(teamsMap.values()).sort((a, b) => a.team.name.localeCompare(b.team.name));
  };

  const teamsWithDeals = groupDealsByTeams();

  const handleAddDeal = () => {
    setEditingDeal(undefined);
    setShowModal(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setShowModal(true);
  };

  const handleSaveDeal = (dealData: Partial<Deal>) => {
    if (editingDeal) {
      setDeals(deals.map(d => 
        d.id === editingDeal.id ? { ...d, ...dealData } : d
      ));
    } else {
      const newDeal: Deal = {
        id: Date.now().toString(),
        ...dealData as Omit<Deal, 'id'>,
      };
      setDeals([...deals, newDeal]);
    }
    setShowModal(false);
  };

  const handleDeleteDeal = (dealId: string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'هل أنت متأكد من حذف هذه الصفقة؟ لا يمكن التراجع عن هذه العملية.',
      onConfirm: () => {
    setDeals(deals.filter(d => d.id !== dealId));
        setConfirmDialog(d => ({ ...d, isOpen: false }));
      }
    });
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

  const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.amount, 0);
  const wonValue = filteredDeals.filter(d => d.status === 'won').reduce((sum, deal) => sum + deal.amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            الصفقات ({filteredDeals.length})
          </h2>
          <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>إجمالي القيمة: {formatCurrency(totalValue)}</span>
            <span>الصفقات المكتملة: {formatCurrency(wonValue)}</span>
          </div>
        </div>
        {/* Only sales representatives can create deals */}
        {user?.role === 'sales_representative' && (
        <Button icon={Plus} onClick={handleAddDeal}>
            إضافة صفقة
        </Button>
        )}
        {/* Managers and admins can see info about deal creation restrictions */}
        {user?.role === 'sales_manager' && (
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            <p>المدراء لا يمكنهم إنشاء صفقات</p>
            <p className="text-xs">يمكنهم فقط تعيين الصفقات للمندوبين</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            فلاتر البحث
          </h3>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
              <Search className="w-3 h-3" />
              البحث النصي
            </label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="البحث في الصفقات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              حالة الصفقة
            </label>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
                { value: 'all', label: 'كل الحالات' },
                { value: 'pending', label: 'قيد الانتظار' },
                { value: 'won', label: 'مكتملة' },
                { value: 'lost', label: 'فاشلة' }
              ]}
              className="min-w-[140px]"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
              <User className="w-3 h-3" />
              العميل
            </label>
            <Select
              value={clientFilter}
              onChange={setClientFilter}
              options={[
                { value: '', label: 'كل العملاء' },
                ...mockClients.map(client => ({
                  value: client.id,
                  label: client.name
                }))
              ]}
              className="min-w-[140px]"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
              <Users className="w-3 h-3" />
              المندوب المسؤول
            </label>
            <Select
              value={assignedFilter}
              onChange={setAssignedFilter}
              options={[
                { value: '', label: 'كل المندوبين' },
                ...mockUsers.filter(u => u.role === 'sales_representative' && u.isActive).map(user => {
                  const team = mockTeams.find(t => t.id === user.teamId);
                  return {
                    value: user.id,
                    label: `${user.name} (${team ? team.name : 'بدون فريق'})`
                  }
                })
              ]}
              className="min-w-[140px]"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              الفريق
            </label>
            <Select
              value={teamFilter}
              onChange={setTeamFilter}
              options={[
                { value: '', label: 'كل الفرق' },
                ...mockTeams.map(team => ({
                  value: team.id,
                  label: team.name
                }))
              ]}
              className="min-w-[140px]"
            />
          </div>
        </div>
      </Card>

      {/* Deals Grouped by Teams */}
      <div className="space-y-6">
        {teamsWithDeals.map(({ team, deals: teamDeals, totalValue: teamTotalValue, wonValue: teamWonValue }) => (
          <Card key={team.id} padding="sm" className="overflow-hidden">
            {/* Team Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {team.name} ({teamDeals.length} صفقة)
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{team.region}</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-gray-900 dark:text-white">{formatCurrency(teamTotalValue)}</div>
                    <div className="text-gray-600 dark:text-gray-400">إجمالي القيمة</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-600 dark:text-green-400">{formatCurrency(teamWonValue)}</div>
                    <div className="text-gray-600 dark:text-gray-400">الصفقات المكتملة</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Deals Table */}
            <div className="overflow-x-auto table-scrollbar">
              <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">الصفقة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">العميل</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">المبلغ</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">المندوب المسؤول</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">الحالة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">تاريخ الإغلاق</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
                  {teamDeals.map((deal, index) => (
                <tr 
                  key={deal.id} 
                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-700/50'
                  }`}
                >
                      <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                            <Link to={`/deals/${deal.id}`} className="hover:text-blue-600 dark:hover:text-blue-300">
                        {deal.title}
                            </Link>
                      </div>
                      {deal.probability && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {deal.probability}% نسبة نجاح
                        </div>
                      )}
                    </div>
                  </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                          <Link 
                            to={`/clients/${deal.clientId}`} 
                            className="text-blue-600 dark:text-blue-300 hover:underline text-gray-900 dark:text-white"
                          >
                            {deal.clientName}
                          </Link>
                    </div>
                  </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(deal.amount)}
                      </span>
                    </div>
                  </td>
                      <td className="py-3 px-4">
                        {getAssignedUserName(deal.assignedTo)}
                      </td>
                      <td className="py-3 px-4">
                    <StatusBadge status={deal.status} />
                  </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                            {new Date(deal.date).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Link to={`/deals/${deal.id}`}>
                            <Button variant="ghost" size="sm">
                              عرض
                            </Button>
                          </Link>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        icon={Edit}
                        onClick={() => handleEditDeal(deal)}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteDeal(deal.id)}
                        className="text-red-600 hover:text-red-700"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          </Card>
        ))}

        {teamsWithDeals.length === 0 && (
          <Card padding="sm">
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لم يتم العثور على صفقات
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
                {statusFilter !== 'all' || searchTerm ? 'جرب تغيير معايير البحث' : 
                  user?.role === 'sales_representative' ? 'ابدأ بإضافة أول صفقة' : 'لا توجد صفقات متاحة'}
            </p>
              {(statusFilter === 'all' && !searchTerm && (user?.role === 'sales_representative' || user?.role === 'admin')) && (
              <Button icon={Plus} onClick={handleAddDeal}>
                  إضافة صفقة
              </Button>
            )}
              {statusFilter === 'all' && !searchTerm && user?.role === 'sales_manager' && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>المدراء لا يمكنهم إنشاء صفقات</p>
                  <p className="text-xs">يمكنهم فقط تعيين الصفقات للمندوبين</p>
                </div>
              )}
          </div>
          </Card>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingDeal ? 'تعديل الصفقة' : 'إضافة صفقة جديدة'}
      >
        <DealForm
          deal={editingDeal}
          onSave={handleSaveDeal}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(d => ({ ...d, isOpen: false }))}
      />
    </div>
  );
};