import React, { useState } from 'react';
import { Plus, Search, Filter, Mail, Phone, Building, Edit, Trash2, Users, UserPlus, Edit2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { CanView, CanCreate } from '../components/auth/PermissionGuard';
import { useAuth } from '../contexts/AuthContext';
import { mockClients, mockUsers, mockTeams } from '../data/mockData';
import { Client } from '../types';

const ClientForm: React.FC<{
  client?: Client;
  onSave: (client: Partial<Client>) => void;
  onCancel: () => void;
}> = ({ client, onSave, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    company: client?.company || '',
    position: client?.position || '',
    assignedTo: client?.assignedTo || user?.id || '',
    status: client?.status || 'active',
    notes: client?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clientData = {
      ...formData,
      createdBy: client?.createdBy || user?.id, // منشئ العميل
      assignedTo: formData.assignedTo || user?.id // المخصص له العميل
    };
    onSave(clientData);
  };

  // Helper: get all sales reps from teams managed by this sales manager
  let availableUsers: typeof mockUsers = [];
  if (user?.role === 'admin') {
    availableUsers = mockUsers.filter(u => u.role === 'sales_representative' || u.role === 'sales_manager');
  } else if (user?.role === 'sales_manager') {
    // Get all team ids managed by this sales manager
    const managedTeamIds = mockTeams.filter(team => team.managerId === user.id).map(team => team.id);
    // Get all sales reps in those teams
    availableUsers = mockUsers.filter(u => u.role === 'sales_representative' && managedTeamIds.includes(u.teamId || ''));
  } else if (user?.role === 'sales_representative') {
    availableUsers = [user];
  }

  // الحصول على اسم المنصب بناءً على الدور
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدير النظام';
      case 'sales_manager':
        return 'مدير المبيعات';
      case 'sales_representative':
        return 'مندوب المبيعات';
      default:
        return 'غير محدد';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-lg mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="اسم العميل"
          value={formData.name}
          onChange={(value) => setFormData({ ...formData, name: value })}
          placeholder="أدخل اسم العميل"
          required
        />
        <Input
          label="البريد الإلكتروني"
          type="email"
          value={formData.email}
          onChange={(value) => setFormData({ ...formData, email: value })}
          placeholder="أدخل البريد الإلكتروني"
          required
        />
        <Input
          label="رقم الهاتف"
          type="tel"
          value={formData.phone}
          onChange={(value) => setFormData({ ...formData, phone: value })}
          placeholder="أدخل رقم الهاتف"
        />
        <Input
          label="الشركة"
          value={formData.company}
          onChange={(value) => setFormData({ ...formData, company: value })}
          placeholder="أدخل اسم الشركة"
          required
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="المنصب"
          value={formData.position}
          onChange={(value) => setFormData({ ...formData, position: value })}
          placeholder="أدخل المنصب الوظيفي"
        />
        {(user?.role === 'admin' || user?.role === 'sales_manager') && (
          <Select
            label="تخصيص العميل"
            value={formData.assignedTo}
            onChange={(value) => setFormData({ ...formData, assignedTo: value })}
            options={availableUsers.map(user => ({
              value: user.id,
              label: `${user.name} (${getRoleLabel(user.role)})`
            }))}
            required
          />
        )}
      </div>
      <Select
        label="حالة العميل"
        value={formData.status}
        onChange={(value) => setFormData({ ...formData, status: value as any })}
        options={[
          { value: 'active', label: 'نشط' },
          { value: 'inactive', label: 'غير نشط' },
          { value: 'prospect', label: 'عميل محتمل' },
          { value: 'lead', label: 'عميل رائد' }
        ]}
        required
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          ملاحظات
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="أدخل أي ملاحظات إضافية..."
          rows={2}
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 dark:text-white"
        />
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" onClick={onCancel} size="sm">
          إلغاء
        </Button>
        <Button type="submit" size="sm">
          {client ? 'تحديث العميل' : 'إضافة العميل'}
        </Button>
      </div>
    </form>
  );
};

export const Clients: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });
  const [assignModal, setAssignModal] = useState<{ open: boolean; client?: Client }>({ open: false });
  const [assignTo, setAssignTo] = useState('');

  // تصفية العملاء حسب الصلاحيات
  const visibleClients = user?.permissions.clients.viewAll 
    ? clients 
    : clients.filter(client => client.assignedTo === user?.id);

  const filteredClients = visibleClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = () => {
    setEditingClient(undefined);
    setShowModal(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleSaveClient = (clientData: Partial<Client>) => {
    if (editingClient) {
      setClients(clients.map(c => 
        c.id === editingClient.id ? { ...c, ...clientData } : c
      ));
    } else {
      const newClient: Client = {
        id: Date.now().toString(),
        ...clientData as Omit<Client, 'id'>,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setClients([...clients, newClient]);
    }
    setShowModal(false);
  };

  const handleDeleteClient = (clientId: string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذه العملية.',
      onConfirm: () => {
        setClients(clients.filter(c => c.id !== clientId));
        setConfirmDialog(d => ({ ...d, isOpen: false }));
      }
    });
  };

  // Helper: get all sales reps from teams managed by this sales manager
  let availableReps: typeof mockUsers = [];
  if (user?.role === 'admin') {
    availableReps = mockUsers.filter(u => u.role === 'sales_representative' || u.role === 'sales_manager');
  } else if (user?.role === 'sales_manager') {
    const managedTeamIds = mockTeams.filter(team => team.managerId === user.id).map(team => team.id);
    availableReps = mockUsers.filter(u => u.role === 'sales_representative' && managedTeamIds.includes(u.teamId || ''));
    // Add the sales manager himself if not already in the list
    if (!availableReps.some(u => u.id === user.id)) {
      availableReps = [user, ...availableReps];
    }
  } else if (user?.role === 'sales_representative') {
    availableReps = [user];
  }

  const handleOpenAssign = (client: Client) => {
    setAssignModal({ open: true, client });
    setAssignTo(client.assignedTo || '');
  };
  const handleAssign = () => {
    if (!assignModal.client) return;
    setClients(prev => prev.map(c => c.id === assignModal.client!.id ? { ...c, assignedTo: assignTo } : c));
    setAssignModal({ open: false });
  };

  // الحصول على اسم المستخدم المخصص له العميل
  const getAssignedUserName = (assignedTo?: string) => {
    if (!assignedTo) return 'غير محدد';
    const assignedUser = mockUsers.find(u => u.id === assignedTo);
    return assignedUser ? assignedUser.name : 'غير محدد';
  };

  // الحصول على اسم منشئ العميل
  const getCreatedByUserName = (createdBy?: string) => {
    if (!createdBy) return 'غير محدد';
    const createdUser = mockUsers.find(u => u.id === createdBy);
    return createdUser ? createdUser.name : 'غير محدد';
  };

  // التحقق من إمكانية التعديل
  const canEditClient = (client: Client) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'sales_manager') {
      // Get all team ids managed by this sales manager
      const managedTeamIds = mockTeams.filter(team => team.managerId === user.id).map(team => team.id);
      // Get all reps in those teams
      const repsIds = mockUsers.filter(u => u.role === 'sales_representative' && managedTeamIds.includes(u.teamId || '')).map(u => u.id);
      // Can edit if assignedTo is one of his reps or himself
      return repsIds.includes(client.assignedTo || '') || client.assignedTo === user.id;
    }
    if (user?.role === 'sales_representative' && client.assignedTo === user?.id) return true;
    return false;
  };

  // التحقق من إمكانية الحذف
  const canDeleteClient = (client: Client) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'sales_representative' && client.assignedTo === user?.id) return true;
    return false;
  };

  return (
    <CanView permission="clients">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              العملاء ({filteredClients.length})
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {user?.role === 'sales_manager' 
                ? 'مراقبة عملاء فريق المبيعات' 
                : 'إدارة علاقات العملاء'
              }
            </p>
          </div>
          <CanCreate permission="clients">
            <Button icon={Plus} onClick={handleAddClient}>
              إضافة عميل
            </Button>
          </CanCreate>
        </div>

        {/* Search and Filters */}
        <Card padding="sm">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="البحث في العملاء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <Button variant="outline" icon={Filter} size="sm">
              تصفية
            </Button>
          </div>
        </Card>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {client.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {client.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {client.company}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {canEditClient(client) && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      icon={Edit}
                      onClick={() => handleEditClient(client)}
                    />
                  )}
                  {canDeleteClient(client) && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteClient(client.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    />
                  )}
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building className="w-4 h-4" />
                  <span>{client.company}</span>
                </div>
                {/* عرض المستخدم المخصص - للمدير ومدير المبيعات */}
                {user?.permissions.clients.viewAll && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <UserPlus className="w-4 h-4" />
                    <span>مخصص لـ: {getAssignedUserName(client.assignedTo)}</span>
                    {user?.role === 'sales_manager' && availableReps.length > 0 && (
                      <button
                        className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="تغيير المندوب المكلف"
                        onClick={() => handleOpenAssign(client)}
                      >
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </button>
                    )}
                  </div>
                )}
                {/* عرض منشئ العميل - للمدير فقط */}
                {user?.role === 'admin' && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>أنشأه: {getCreatedByUserName(client.createdBy)}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  تم الإضافة: {new Date(client.createdAt).toLocaleDateString('ar-SA')}
                </p>
                {client.lastContact && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    آخر تواصل: {new Date(client.lastContact).toLocaleDateString('ar-SA')}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* No results */}
        {filteredClients.length === 0 && (
          <Card className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لم يتم العثور على عملاء
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm ? 'جرب تغيير معايير البحث' : 'ابدأ بإضافة أول عميل'}
            </p>
            {!searchTerm && (
              <CanCreate permission="clients">
                <Button icon={Plus} onClick={handleAddClient}>
                  إضافة عميل
                </Button>
              </CanCreate>
            )}
          </Card>
        )}

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingClient ? 'تعديل العميل' : 'إضافة عميل جديد'}
        >
          <ClientForm
            client={editingClient}
            onSave={handleSaveClient}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(d => ({ ...d, isOpen: false }))}
        />
        {/* Assign Modal */}
        <Modal
          isOpen={assignModal.open}
          onClose={() => setAssignModal({ open: false })}
          title="تغيير المندوب المكلف بالعميل"
        >
          {availableReps.length === 0 ? (
            <div className="text-center text-gray-500 py-6">لا يوجد مندوبي مبيعات متاحين في فرقك.</div>
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
    </CanView>
  );
};