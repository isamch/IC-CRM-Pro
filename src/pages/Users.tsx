import React, { useState } from 'react';
import { User, Trash2, Eye, UserCheck, Plus, Search, Ban, UserMinus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers, mockTeams } from '../data/mockData';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CanView } from '../components/auth/PermissionGuard';
import { User as UserType, UserRole } from '../types';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Link } from 'react-router-dom';
import { getPermissionsForRole } from '../utils/permissions';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { CanCreate } from '../components/auth/PermissionGuard';
import { useEffect } from 'react';
import { UnauthorizedPage } from '../components/auth/UnauthorizedPage';

const UserForm: React.FC<{
  onSave: (user: Partial<UserType>) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Sales',
    role: 'sales_representative',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser: Partial<UserType> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      role: formData.role as UserRole,
      teamId: undefined,
      // In a real app, password would be hashed.
      // For mock data, we are not implementing authentication logic with the password.
      joinDate: new Date().toISOString().split('T')[0],
      isActive: true,
      permissions: getPermissionsForRole(formData.role as UserRole),
      managerId: undefined,
      region: undefined,
      preferences: {
        theme: 'light',
        notifications: { email: true, push: true, desktop: true },
        language: 'ar',
        timezone: 'Asia/Riyadh'
      }
    };
    onSave(newUser);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        value={formData.name}
        onChange={value => setFormData({ ...formData, name: value })}
        required
      />
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={value => setFormData({ ...formData, email: value })}
        required
      />
      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={value => setFormData({ ...formData, password: value })}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Phone"
          value={formData.phone}
          onChange={value => setFormData({ ...formData, phone: value })}
        />
        <Input
          label="Department"
          value={formData.department}
          onChange={value => setFormData({ ...formData, department: value })}
        />
        <Select
          label="Role"
          value={formData.role}
          onChange={value => setFormData({ ...formData, role: value })}
          options={[
            { value: 'sales_representative', label: 'Sales Representative' },
            { value: 'sales_manager', label: 'Sales Manager' },
          ]}
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Create User</Button>
      </div>
    </form>
  );
};

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  if (currentUser?.role !== 'admin') {
    return <UnauthorizedPage message="هذه الصفحة متاحة فقط للمدير (الأدمن)." />;
  }
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isRemoveFromTeamModalOpen, setIsRemoveFromTeamModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });
  const [passwordDialog, setPasswordDialog] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    errorMessage: '',
    requirePassword: false,
  });

  // Local state for users, teams, and clients (mock)
  const [localUsers, setLocalUsers] = useState(mockUsers);
  const [localTeams, setLocalTeams] = useState(mockTeams);
  // const [localClients, setLocalClients] = useState(mockClients); // removed because it's not used directly in this file

  // Helper to check password (mock: use currentUser?.password or a fixed value for demo)
  const checkPassword = (input: string) => {
    // For demo, accept 'demo123' as the password
    return input === 'demo123';
  };

  const handleSaveUser = (userData: Partial<UserType>) => {
    const newUser = {
      id: Date.now().toString(),
      ...userData,
    } as UserType;

    setLocalUsers(prev => [...prev, newUser]);

    if (newUser.role === 'sales_manager' && newUser.teamId) {
      setLocalTeams(prev => prev.map(team => 
        team.id === newUser.teamId ? { ...team, managerId: newUser.id } : team
      ));
    }

    setIsAddUserModalOpen(false);
  };

  // تصفية المستخدمين حسب دور المستخدم الحالي
  const getFilteredUsers = () => {
    let filteredUsers = localUsers;

    // إذا كان المستخدم الحالي مدير مبيعات، اعرض فقط مندوبي المبيعات
    if (currentUser?.role === 'sales_manager') {
      filteredUsers = localUsers.filter(user => user.role === 'sales_representative');
    }

    // تطبيق البحث
    if (searchTerm) {
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone || '').includes(searchTerm)
      );
    }

    return filteredUsers;
  };

  const filteredUsers = getFilteredUsers();

  // الحصول على اسم الفريق
  const getTeamName = (teamId?: string) => {
    if (!teamId) return 'No Team';
    const team = localTeams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  // التحقق من إمكانية التعديل على المستخدم
  const canEditUser = (user: UserType) => {
    if (currentUser?.id === user.id) return false; // لا يمكن التعديل على نفسه
    if (currentUser?.role === 'admin') return true;
    if (currentUser?.role === 'sales_manager') {
      // يمكن لمدير المبيعات التعديل فقط على أعضاء فريقه
      return user.teamId === currentUser.teamId && user.role === 'sales_representative';
    }
    return false;
  };

  const handleViewUser = (user: UserType) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  // حذف المستخدم مع منطق احترافي
  const handleDeleteUser = (user: UserType) => {
    if (!canEditUser(user)) return;
    setSelectedUser(user);
    setPasswordDialog({
      isOpen: true,
      message: `لحذف المستخدم ${user.name}، أدخل كلمة المرور للتأكيد. لا يمكن التراجع عن هذه العملية.`,
      requirePassword: true,
      errorMessage: '',
      onConfirm: (password?: string) => {
        if (!password || !checkPassword(password)) {
          setPasswordDialog(d => ({ ...d, errorMessage: 'كلمة المرور غير صحيحة.' }));
          return;
        }
        // --- BUSINESS LOGIC ---
        if (user.role === 'sales_manager') {
          // 1. اجعل جميع الفرق التي يديرها هذا المدير بدون مدير
          setLocalTeams(prevTeams => prevTeams.map(team =>
            team.managerId === user.id ? { ...team, managerId: undefined } : team
          ));
          // 2. اجعل جميع مندوبي المبيعات الذين يديرهم هذا المدير بدون مدير
          setLocalUsers(prevUsers => prevUsers.map(u =>
            u.managerId === user.id ? { ...u, managerId: undefined } : u
          ));
          // 3. اجعل جميع العملاء المخصصين لهذا المدير بدون مندوب
          // setLocalClients(prevClients => prevClients.map(c =>
          //   c.assignedTo === user.id ? { ...c, assignedTo: undefined } : c
          // ));
        } else if (user.role === 'sales_representative') {
          // 1. اجعل جميع العملاء المخصصين لهذا المندوب بدون مندوب
          // setLocalClients(prevClients => prevClients.map(c =>
          //   c.assignedTo === user.id ? { ...c, assignedTo: undefined } : c
          // ));
        }
        // 4. احذف المستخدم من القائمة
        setLocalUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
        setPasswordDialog(d => ({ ...d, isOpen: false }));
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        setConfirmDialog(d => ({ ...d, isOpen: false }));
      },
    });
  };

  const handleSuspendUser = (user: UserType) => {
    if (!canEditUser(user)) return;
    setSelectedUser(user);
    setPasswordDialog({
      isOpen: true,
      message: `لتأكيد ${user.isActive ? 'إيقاف' : 'تفعيل'} المستخدم ${user.name}، أدخل كلمة المرور.`,
      requirePassword: true,
      errorMessage: '',
      onConfirm: (password?: string) => {
        if (!password || !checkPassword(password)) {
          setPasswordDialog(d => ({ ...d, errorMessage: 'كلمة المرور غير صحيحة.' }));
          return;
        }
        // إيقاف/تفعيل المستخدم
        setPasswordDialog(d => ({ ...d, isOpen: false }));
        setIsSuspendModalOpen(false);
        setSelectedUser(null);
        setConfirmDialog(d => ({ ...d, isOpen: false }));
        // ... تنفيذ الإيقاف/التفعيل هنا
      },
    });
  };

  const handleRemoveFromTeam = (user: UserType) => {
    if (!canEditUser(user)) return;
    setSelectedUser(user);
    setPasswordDialog({
      isOpen: true,
      message: `لتأكيد إزالة المستخدم ${user.name} من الفريق، أدخل كلمة المرور.`,
      requirePassword: true,
      errorMessage: '',
      onConfirm: (password?: string) => {
        if (!password || !checkPassword(password)) {
          setPasswordDialog(d => ({ ...d, errorMessage: 'كلمة المرور غير صحيحة.' }));
          return;
        }
        // إزالة المستخدم من الفريق
        setPasswordDialog(d => ({ ...d, isOpen: false }));
        setIsRemoveFromTeamModalOpen(false);
        setSelectedUser(null);
        setConfirmDialog(d => ({ ...d, isOpen: false }));
        // ... تنفيذ الإزالة هنا
      },
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Users Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {currentUser?.role === 'sales_manager' 
            ? 'Manage your team members and sales representatives'
            : 'Manage all users in the system'
          }
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <CanCreate permission="users">
          <Button className="flex items-center gap-2" onClick={() => setIsAddUserModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </CanCreate>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.role === 'sales_representative' ? (
                            <Link to={`/sales-reps/${user.id}`} className="text-blue-600 dark:text-blue-300 hover:underline">
                              {user.name}
                            </Link>
                          ) : user.role === 'sales_manager' ? (
                            <Link to={`/sales-managers/${user.id}`} className="text-blue-600 dark:text-blue-300 hover:underline">
                              {user.name}
                            </Link>
                          ) : user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : user.role === 'sales_manager'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 
                       user.role === 'sales_manager' ? 'Sales Manager' : 
                       'Sales Representative'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {getTeamName(user.teamId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {/* View User Button */}
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          View Details
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                      
                      {canEditUser(user) && (
                        <>
                          {/* Remove from Team Button */}
                          {user.teamId && currentUser?.role === 'sales_manager' && (
                            <div className="relative group">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFromTeam(user)}
                                className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                              >
                                <UserMinus className="w-4 h-4" />
                              </Button>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                Remove from Team
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          )}
                          
                          {/* Suspend/Activate Button */}
                          <div className="relative group">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSuspendUser(user)}
                              className={`${
                                user.isActive 
                                  ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                                  : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                              }`}
                            >
                              {user.isActive ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              {user.isActive ? 'Suspend User' : 'Activate User'}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                          
                          {/* Delete User Button (Admin Only) */}
                          {currentUser?.role === 'admin' && (
                            <div className="relative group">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                Delete User
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new user.'}
            </p>
          </div>
        )}
      </div>

      {/* View User Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedUser.role === 'sales_representative' ? (
                        <Link to={`/sales-reps/${selectedUser.id}`} className="text-blue-600 dark:text-blue-300 hover:underline">
                          {selectedUser.name}
                        </Link>
                      ) : selectedUser.role === 'sales_manager' ? (
                        <Link to={`/sales-managers/${selectedUser.id}`} className="text-blue-600 dark:text-blue-300 hover:underline">
                          {selectedUser.name}
                        </Link>
                      ) : selectedUser.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedUser.department}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Work Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedUser.role === 'admin' ? 'Admin' : 
                       selectedUser.role === 'sales_manager' ? 'Sales Manager' : 
                       'Sales Representative'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Team</label>
                    <p className="text-sm text-gray-900 dark:text-white">{getTeamName(selectedUser.teamId)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Region</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedUser.region || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Join Date</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedUser.joinDate}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Status & Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedUser.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Suspend User Modal */}
      <Modal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        title={selectedUser?.isActive ? "Suspend User" : "Activate User"}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to {selectedUser?.isActive ? 'suspend' : 'activate'} <strong>{selectedUser?.name}</strong>?
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsSuspendModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // هنا سيتم إيقاف/تفعيل المستخدم
              console.log('Suspending user:', selectedUser?.name);
              setIsSuspendModalOpen(false);
              setSelectedUser(null);
            }} className="bg-yellow-600 hover:bg-yellow-700">
              {selectedUser?.isActive ? 'Suspend' : 'Activate'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove from Team Modal */}
      <Modal
        isOpen={isRemoveFromTeamModalOpen}
        onClose={() => setIsRemoveFromTeamModalOpen(false)}
        title="Remove from Team"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to remove <strong>{selectedUser?.name}</strong> from the team?
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsRemoveFromTeamModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // هنا سيتم إزالة المستخدم من الفريق
              console.log('Removing user from team:', selectedUser?.name);
              setIsRemoveFromTeamModalOpen(false);
              setSelectedUser(null);
            }} className="bg-orange-600 hover:bg-orange-700">
              Remove from Team
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // هنا سيتم حذف المستخدم
              console.log('Deleting user:', selectedUser?.name);
              setIsDeleteModalOpen(false);
              setSelectedUser(null);
            }} className="bg-red-600 hover:bg-red-700">
              Delete User
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(d => ({ ...d, isOpen: false }))}
      />
      <ConfirmDialog
        isOpen={passwordDialog.isOpen}
        message={passwordDialog.message}
        onConfirm={passwordDialog.onConfirm}
        onCancel={() => setPasswordDialog(d => ({ ...d, isOpen: false, errorMessage: '' }))}
        requirePassword={passwordDialog.requirePassword}
        errorMessage={passwordDialog.errorMessage}
      />
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Create New User"
      >
        <UserForm 
          onSave={handleSaveUser}
          onCancel={() => setIsAddUserModalOpen(false)}
        />
      </Modal>
    </div>
  );
}; 