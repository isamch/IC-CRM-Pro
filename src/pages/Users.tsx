import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, User, Mail, Phone, Building, Shield, UserCheck, UserX } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { CanView, CanEdit } from '../components/auth/PermissionGuard';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers } from '../data/mockData';
import { User as UserType, UserRole } from '../types';
import { getPermissionsForRole } from '../utils/permissions';

const UserForm: React.FC<{
  user?: UserType;
  onSave: (user: Partial<UserType>) => void;
  onCancel: () => void;
}> = ({ user, onSave, onCancel }) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    role: user?.role || 'sales_representative' as UserRole,
    isActive: user?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // تحديد الأدوار المتاحة حسب صلاحيات المستخدم الحالي
  const getAvailableRoles = () => {
    if (currentUser?.role === 'admin') {
      return [
        { value: 'admin', label: 'مدير النظام' },
        { value: 'sales_manager', label: 'مدير المبيعات' },
        { value: 'sales_representative', label: 'مندوب المبيعات' }
      ];
    } else if (currentUser?.role === 'sales_manager') {
      return [
        { value: 'sales_representative', label: 'مندوب المبيعات' }
      ];
    }
    return [];
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
        options={getAvailableRoles()}
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
          المستخدم مفعل
        </label>
      </div>

      {/* ملاحظة للمدير */}
      {currentUser?.role === 'admin' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>ملاحظة:</strong> يمكنك إنشاء أي نوع من المستخدمين وتحديد صلاحياتهم.
          </p>
        </div>
      )}

      {/* ملاحظة لمدير المبيعات */}
      {currentUser?.role === 'sales_manager' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ <strong>تنبيه:</strong> يمكنك فقط إضافة مندوبي مبيعات لفريقك. 
            لا يمكنك إنشاء مدراء أو مديري مبيعات آخرين.
          </p>
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit">
          {user?.role === 'sales_manager'
            ? (user ? 'تحديث العضو' : 'إضافة العضو')
            : (user ? 'تحديث المستخدم' : 'إضافة المستخدم')
          }
        </Button>
      </div>
    </form>
  );
};

export const Users: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | undefined>();

  // تحميل المستخدمين حسب الصلاحيات
  useEffect(() => {
    if (user?.role === 'admin') {
      // المدير يرى جميع المستخدمين
      setUsers(mockUsers);
    } else if (user?.role === 'sales_manager') {
      // مدير المبيعات يرى فريقه فقط (مندوبي المبيعات)
      setUsers(mockUsers.filter(u => u.role === 'sales_representative'));
    } else {
      setUsers([]);
    }
  }, [user]);

  const filteredUsers = users.filter(userItem => {
    const matchesSearch = userItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (userItem.department?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    // تصفية الأدوار حسب صلاحيات المستخدم الحالي
    let matchesRole = true;
    if (user?.role === 'sales_manager') {
      // مدير المبيعات يرى فقط مندوبي المبيعات
      matchesRole = userItem.role === 'sales_representative';
    } else if (user?.role === 'admin') {
      // المدير يرى جميع الأدوار
      matchesRole = roleFilter === 'all' || userItem.role === roleFilter;
    }
    
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
        permissions: getPermissionsForRole(userData.role || 'sales_representative'),
        preferences: {
          theme: 'light',
          notifications: { email: true, push: true, desktop: true },
          language: 'ar',
          timezone: 'Asia/Riyadh'
        }
      };
      setUsers([...users, newUser]);
    }
    setShowModal(false);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const getRoleLabel = (role: UserRole) => {
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

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'sales_manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'sales_representative':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <CanView permission="users">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user?.role === 'sales_manager' 
                ? `إدارة الفريق (${filteredUsers.length})` 
                : `إدارة المستخدمين (${filteredUsers.length})`
              }
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {user?.role === 'sales_manager' 
                ? 'إدارة أعضاء فريق المبيعات وتعديل بياناتهم' 
                : 'إدارة جميع المستخدمين في النظام'
              }
            </p>
          </div>
          <CanEdit permission="users">
            <Button icon={Plus} onClick={handleAddUser}>
              {user?.role === 'sales_manager' ? 'إضافة عضو' : 'إضافة مستخدم'}
            </Button>
          </CanEdit>
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
              options={
                user?.role === 'admin' 
                  ? [
                      { value: 'all', label: 'جميع الأدوار' },
                      { value: 'admin', label: 'مدير النظام' },
                      { value: 'sales_manager', label: 'مدير المبيعات' },
                      { value: 'sales_representative', label: 'مندوب المبيعات' }
                    ]
                  : user?.role === 'sales_manager'
                  ? [
                      { value: 'all', label: 'جميع الأعضاء' },
                      { value: 'sales_representative', label: 'مندوب المبيعات' }
                    ]
                  : [
                      { value: 'all', label: 'جميع الأدوار' }
                    ]
              }
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
                <CanEdit permission="users">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    icon={Edit}
                    onClick={() => handleEditUser(user)}
                  />
                </CanEdit>
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
              {user?.role === 'sales_manager' 
                ? 'لم يتم العثور على أعضاء في الفريق' 
                : 'لم يتم العثور على مستخدمين'
              }
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || roleFilter !== 'all' 
                ? 'جرب تغيير معايير البحث' 
                : user?.role === 'sales_manager'
                ? 'ابدأ بإضافة أول عضو للفريق'
                : 'ابدأ بإضافة أول مستخدم'
              }
            </p>
            {!searchTerm && roleFilter === 'all' && (
              <CanEdit permission="users">
                <Button icon={Plus} onClick={handleAddUser}>
                  {user?.role === 'sales_manager' ? 'إضافة عضو' : 'إضافة مستخدم'}
                </Button>
              </CanEdit>
            )}
          </Card>
        )}

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            user?.role === 'sales_manager'
              ? (editingUser ? 'تعديل العضو' : 'إضافة عضو جديد')
              : (editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد')
          }
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