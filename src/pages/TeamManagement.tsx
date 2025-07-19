import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Phone, 
  Mail, 
  TrendingUp, 
  Calendar, 
  Target, 
  Search,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { CanView, CanEdit } from '../components/auth/PermissionGuard';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers, mockClients, mockDeals, mockTasks } from '../data/mockData';
import { User as UserType, UserRole } from '../types';
import { getPermissionsForRole } from '../utils/permissions';

const TeamMemberForm: React.FC<{
  member?: UserType;
  onSave: (member: Partial<UserType>) => void;
  onCancel: () => void;
}> = ({ member, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    email: member?.email || '',
    phone: member?.phone || '',
    department: member?.department || '',
    role: member?.role || 'sales_representative' as UserRole,
    isActive: member?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
          { value: 'sales_representative', label: 'مندوب المبيعات' }
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
          العضو مفعل
        </label>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit">
          {member ? 'تحديث العضو' : 'إضافة عضو'}
        </Button>
      </div>
    </form>
  );
};

const TeamMemberDetails: React.FC<{
  member: UserType;
  onClose: () => void;
}> = ({ member, onClose }) => {
  // الحصول على إحصائيات العضو
  const getMemberStats = (memberId: string) => {
    const clients = mockClients.filter(c => c.assignedTo === memberId).length;
    const deals = mockDeals.filter(d => d.assignedTo === memberId).length;
    const tasks = mockTasks.filter(t => t.assignee === memberId).length;
    const completedTasks = mockTasks.filter(t => t.assignee === memberId && t.status === 'done').length;
    const pendingTasks = mockTasks.filter(t => t.assignee === memberId && t.status === 'pending').length;
    
    return { clients, deals, tasks, completedTasks, pendingTasks };
  };

  const stats = getMemberStats(member.id);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
          <Users className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {member.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {member.department} • {getRoleLabel(member.role)}
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">{member.email}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">{member.phone}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">
              انضم: {new Date(member.joinDate).toLocaleDateString('ar-SA')}
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(member.role)}`}>
              {getRoleLabel(member.role)}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              member.isActive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}>
              {member.isActive ? 'نشط' : 'غير نشط'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">
              آخر دخول: {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString('ar-SA') : 'غير محدد'}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">إحصائيات الأداء</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.clients}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">العملاء</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.deals}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">العقود</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.tasks}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">المهام</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedTasks}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">مكتملة</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          إغلاق
        </Button>
        <Button icon={MessageSquare}>
          إرسال رسالة
        </Button>
      </div>
    </div>
  );
};

export const TeamManagement: React.FC = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingMember, setEditingMember] = useState<UserType | undefined>();
  const [selectedMember, setSelectedMember] = useState<UserType | undefined>();

  // تحميل أعضاء الفريق حسب دور المستخدم
  useEffect(() => {
    if (user?.role === 'admin') {
      // المدير يرى جميع مندوبي المبيعات
      setTeamMembers(mockUsers.filter(u => u.role === 'sales_representative'));
    } else if (user?.role === 'sales_manager') {
      // مدير المبيعات يرى فريقه فقط (مندوبي المبيعات)
      setTeamMembers(mockUsers.filter(u => u.role === 'sales_representative'));
    } else {
      setTeamMembers([]);
    }
  }, [user]);

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && member.isActive) ||
                         (statusFilter === 'inactive' && !member.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleAddMember = () => {
    setEditingMember(undefined);
    setShowModal(true);
  };

  const handleEditMember = (member: UserType) => {
    setEditingMember(member);
    setShowModal(true);
  };

  const handleViewDetails = (member: UserType) => {
    setSelectedMember(member);
    setShowDetailsModal(true);
  };

  const handleSaveMember = (memberData: Partial<UserType>) => {
    if (editingMember) {
      setTeamMembers(teamMembers.map(m => 
        m.id === editingMember.id ? { ...m, ...memberData } : m
      ));
    } else {
      const newMember: UserType = {
        id: Date.now().toString(),
        ...memberData as Omit<UserType, 'id'>,
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString(),
        permissions: getPermissionsForRole('sales_representative'),
        preferences: {
          theme: 'light',
          notifications: { email: true, push: true, desktop: true },
          language: 'ar',
          timezone: 'Asia/Riyadh'
        }
      };
      setTeamMembers([...teamMembers, newMember]);
    }
    setShowModal(false);
  };

  // الحصول على إحصائيات العضو
  const getMemberStats = (memberId: string) => {
    const clients = mockClients.filter(c => c.assignedTo === memberId).length;
    const deals = mockDeals.filter(d => d.assignedTo === memberId).length;
    const tasks = mockTasks.filter(t => t.assignee === memberId).length;
    const completedTasks = mockTasks.filter(t => t.assignee === memberId && t.status === 'done').length;
    
    return { clients, deals, tasks, completedTasks };
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
              إدارة الفريق ({teamMembers.length})
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              إدارة أعضاء فريق المبيعات ومتابعة أدائهم
            </p>
          </div>
          <CanEdit permission="users">
            <Button icon={UserPlus} onClick={handleAddMember}>
              إضافة عضو
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
                placeholder="البحث في أعضاء الفريق..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'جميع الأعضاء' },
                { value: 'active', label: 'نشط' },
                { value: 'inactive', label: 'غير نشط' }
              ]}
            />
          </div>
        </Card>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const stats = getMemberStats(member.id);
            return (
              <Card key={member.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {member.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {member.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      icon={Eye}
                      onClick={() => handleViewDetails(member)}
                    />
                    <CanEdit permission="users">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        icon={Edit}
                        onClick={() => handleEditMember(member)}
                      />
                    </CanEdit>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                      {getRoleLabel(member.role)}
                    </span>
                  </div>
                </div>
                
                {/* Performance Stats */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">إحصائيات الأداء</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.clients}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">العملاء</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Target className="w-4 h-4 text-green-500" />
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.deals}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">العقود</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.tasks}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">المهام</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.completedTasks}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">مكتملة</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      member.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {member.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    انضم: {new Date(member.joinDate).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* No results */}
        {filteredMembers.length === 0 && (
          <Card className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لم يتم العثور على أعضاء
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== 'all' ? 'جرب تغيير معايير البحث' : 'ابدأ بإضافة أول عضو للفريق'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <CanEdit permission="users">
                <Button icon={UserPlus} onClick={handleAddMember}>
                  إضافة عضو
                </Button>
              </CanEdit>
            )}
          </Card>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingMember ? 'تعديل العضو' : 'إضافة عضو جديد'}
        >
          <TeamMemberForm
            member={editingMember}
            onSave={handleSaveMember}
            onCancel={() => setShowModal(false)}
          />
        </Modal>

        {/* Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="تفاصيل العضو"
        >
          {selectedMember && (
            <TeamMemberDetails
              member={selectedMember}
              onClose={() => setShowDetailsModal(false)}
            />
          )}
        </Modal>
      </div>
    </CanView>
  );
}; 