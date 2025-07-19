import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, User, Mail, Phone, Building, Shield, UserCheck, UserX } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { CanView, CanCreate, CanEdit, CanDelete } from '../components/auth/PermissionGuard';
import { mockUsers } from '../data/mockData';
import { User as UserType, UserRole } from '../types';
import { getPermissionsForRole } from '../utils/permissions';

const UserForm: React.FC<{
  user?: UserType;
  onSave: (user: Partial<UserType>) => void;
  onCancel: () => void;
}> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    role: user?.role || 'sales_manager' as UserRole,
    isActive: user?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userData = {
      ...formData,
      permissions: getPermissionsForRole(formData.role)
    };
    onSave(userData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="الاسم الكامل"
        value={formData.name}
        onChange={(value) => setFormData({ ...formData, name: value })}
        placeholder="أدخل الاسم الكامل"
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
        label="القسم"
        value={formData.department}
        onChange={(value) => setFormData({ ...formData, department: value })}
        placeholder="أدخل القسم"
        required
      />
      
      <Select
        label="الدور"
        value={formData.role}
        onChange={(value) => setFormData({ ...formData, role: value as UserRole })}
        options={[
          { value: 'admin', label: 'مدير النظام' },
          { value: 'sales_manager', label: 'مدير المبيعات' }
        ]}
        required
      />
      
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          الحساب مفعل
        </label>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit">
          {user ? 'تحديث المستخدم' : 'إضافة مستخدم'}
        </Button>
      </div>
    </form>
  );
};

export const Users: React.FC = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | undefined>();

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.department?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    setEditingUser(undefined);
    setShowModal(true);
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSaveUser = (userData: Partial<UserType>) => {
    if (editingUser) {
      setUsers(users.map(u => 
        u.id === editingUser.id ? { ...u, ...userData } : u
      ));
    } else {
      const newUser: UserType = {
        id: Date.now().toString(),
        ...userData as Omit<UserType, 'id'>,
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString(),
      };
      setUsers([...users, newUser]);
    }
    setShowModal(false);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const getRoleLabel = (role: UserRole) => {
    return role === 'admin' ? 'مدير النظام' : 'مدير المبيعات';
  };

  const getRoleColor = (role: UserRole) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  };

  return (
    <CanView permission="users">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              إدارة المستخدمين ({users.length})
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              إدارة حسابات المستخدمين وأدوارهم
            </p>
          </div>
          <CanCreate permission="users">
            <Button icon={Plus} onClick={handleAddUser}>
              إضافة مستخدم
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
                placeholder="البحث في المستخدمين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: 'all', label: 'جميع الأدوار' },
                { value: 'admin', label: 'مدير النظام' },
                { value: 'sales_manager', label: 'مدير المبيعات' }
              ]}
              className="sm:w-48"
            />
          </div>
        </Card>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.department}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <CanEdit permission="users">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      icon={Edit}
                      onClick={() => handleEditUser(user)}
                    />
                  </CanEdit>
                  <CanDelete permission="users">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    />
                  </CanDelete>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building className="w-4 h-4" />
                  <span>{user.department}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {user.isActive ? (
                    <UserCheck className="w-4 h-4 text-green-500" />
                  ) : (
                    <UserX className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-xs ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {user.isActive ? 'مفعل' : 'معطل'}
                  </span>
                </div>
                <CanEdit permission="users">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleUserStatus(user.id)}
                    className={user.isActive ? 'text-red-600' : 'text-green-600'}
                  >
                    {user.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                  </Button>
                </CanEdit>
              </div>
            </Card>
          ))}
        </div>

        {/* No results */}
        {filteredUsers.length === 0 && (
          <Card className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لم يتم العثور على مستخدمين
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || roleFilter !== 'all' ? 'جرب تغيير معايير البحث' : 'ابدأ بإضافة أول مستخدم'}
            </p>
            {!searchTerm && roleFilter === 'all' && (
              <CanCreate permission="users">
                <Button icon={Plus} onClick={handleAddUser}>
                  إضافة مستخدم
                </Button>
              </CanCreate>
            )}
          </Card>
        )}

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
        >
          <UserForm
            user={editingUser}
            onSave={handleSaveUser}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      </div>
    </CanView>
  );
}; 