import React, { useState } from 'react';
import { Plus, Search, Filter, Mail, Phone, Building, Edit, Trash2, Users, UserPlus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { CanView, CanCreate, CanEdit, CanDelete } from '../components/auth/PermissionGuard';
import { useAuth } from '../contexts/AuthContext';
import { mockClients, mockUsers } from '../data/mockData';
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
    assignedTo: client?.assignedTo || user?.id || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clientData = {
      ...formData,
      assignedTo: formData.assignedTo || user?.id,
      createdBy: client?.createdBy || user?.id // الحفاظ على منشئ العميل الأصلي
    };
    onSave(clientData);
  };

  // المدير يمكنه تخصيص العملاء لأي مستخدم
  const canAssignUsers = user?.role === 'admin';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="الاسم الكامل"
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
      
      {/* تخصيص المستخدم - للمدير فقط */}
      {canAssignUsers && (
        <div className="space-y-2">
          <Select
            label="تخصيص للمستخدم"
            value={formData.assignedTo}
            onChange={(value) => setFormData({ ...formData, assignedTo: value })}
            options={mockUsers.map(user => ({
              value: user.id,
              label: `${user.name} (${
                user.role === 'admin' ? 'مدير النظام' :
                user.role === 'sales_manager' ? 'مدير المبيعات' :
                user.role === 'sales_representative' ? 'مندوب المبيعات' : 'غير محدد'
              })`
            }))}
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 يمكنك تخصيص العميل لأي مستخدم. هذا مفيد عند إعادة توزيع العمل أو تغيير المسؤوليات.
          </p>
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit">
          {client ? 'تحديث العميل' : 'إضافة عميل'}
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
    setClients(clients.filter(c => c.id !== clientId));
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
              إدارة علاقات العملاء
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
                  <CanEdit permission="clients">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      icon={Edit}
                      onClick={() => handleEditClient(client)}
                    />
                  </CanEdit>
                  <CanDelete permission="clients">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteClient(client.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    />
                  </CanDelete>
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
                {/* عرض المستخدم المخصص - للمدير فقط */}
                {user?.permissions.clients.viewAll && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <UserPlus className="w-4 h-4" />
                    <span>مخصص لـ: {getAssignedUserName(client.assignedTo)}</span>
                  </div>
                )}
                {/* عرض منشئ العميل - للمدير فقط */}
                {user?.permissions.clients.viewAll && (
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
      </div>
    </CanView>
  );
};