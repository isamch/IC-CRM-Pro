import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  Calendar,
  Target,
  CheckCircle,
  ArrowLeft,
  Edit,
  Trash2,
  X,
  Plus,
  Pause,
  Play
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { CanView, CanEdit, CanDelete } from '../components/auth/PermissionGuard';
import { useAuth } from '../contexts/AuthContext';
import { mockTeams, mockUsers, mockClients, mockDeals, mockTasks } from '../data/mockData';
import { Team } from '../types';

// نموذج تعديل الفريق
const EditTeamForm: React.FC<{
  team: Team;
  onSave: (team: Partial<Team>) => void;
  onCancel: () => void;
}> = ({ team, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: team.name,
    region: team.region,
    description: team.description || '',
    isActive: team.isActive
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teamData = {
      ...formData,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onSave(teamData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="اسم الفريق"
        value={formData.name}
        onChange={(value) => setFormData({ ...formData, name: value })}
        placeholder="أدخل اسم الفريق"
        required
      />
      <Input
        label="المنطقة الجغرافية"
        value={formData.region}
        onChange={(value) => setFormData({ ...formData, region: value })}
        placeholder="أدخل المنطقة الجغرافية"
        required
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          وصف الفريق
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="أدخل وصف الفريق..."
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>
      
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          الفريق مفعل
        </label>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit">
          تحديث الفريق
        </Button>
      </div>
    </form>
  );
};

// نموذج إضافة مندوب للفريق
const AddMemberForm: React.FC<{
  onAdd: (userId: string) => void;
  onCancel: () => void;
}> = ({ onAdd, onCancel }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  
  // الحصول على مندوبي المبيعات غير المنضمين لأي فريق
  const availableRepresentatives = mockUsers.filter(user => 
    user.role === 'sales_representative' && !user.teamId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      onAdd(selectedUserId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          اختر مندوب المبيعات
        </label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          required
        >
          <option value="">اختر مندوب مبيعات...</option>
          {availableRepresentatives.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} - {user.email}
            </option>
          ))}
        </select>
        {availableRepresentatives.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            لا يوجد مندوبي مبيعات متاحين للإضافة
          </p>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" disabled={!selectedUserId}>
          إضافة المندوب
        </Button>
      </div>
    </form>
  );
};

export const TeamDetails: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [localTeams, setLocalTeams] = useState(mockTeams);
  const [localUsers, setLocalUsers] = useState(mockUsers);

  // تحميل بيانات الفريق
  useEffect(() => {
    if (teamId) {
      const foundTeam = localTeams.find(t => t.id === teamId);
      if (foundTeam) {
        // التحقق من الصلاحيات
        if (user?.role === 'admin' || (user?.role === 'sales_manager' && foundTeam.managerId === user.id)) {
          setTeam(foundTeam);
        } else {
          navigate('/teams');
        }
      } else {
        navigate('/teams');
      }
    }
  }, [teamId, user, navigate, localTeams]);

  if (!team) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  // الحصول على أعضاء الفريق (مندوبي مبيعات فقط)
  const teamMembers = localUsers.filter(user => 
    user.teamId === team.id && user.role === 'sales_representative'
  );
  const manager = localUsers.find(user => user.id === team.managerId);

  // الحصول على إحصائيات الفريق
  const getTeamStats = () => {
    const teamMemberIds = teamMembers.map(member => member.id);
    const clients = mockClients.filter(c => teamMemberIds.includes(c.assignedTo || '')).length;
    const deals = mockDeals.filter(d => teamMemberIds.includes(d.assignedTo || '')).length;
    const tasks = mockTasks.filter(t => teamMemberIds.includes(t.assignee || '')).length;
    const completedTasks = mockTasks.filter(t => 
      teamMemberIds.includes(t.assignee || '') && t.status === 'done'
    ).length;
    
    // حساب الإيرادات
    const revenue = mockDeals
      .filter(d => teamMemberIds.includes(d.assignedTo || '') && d.status === 'won')
      .reduce((sum, deal) => sum + deal.amount, 0);
    
    // حساب معدل النجاح
    const totalDeals = mockDeals.filter(d => teamMemberIds.includes(d.assignedTo || '')).length;
    const wonDeals = mockDeals.filter(d => teamMemberIds.includes(d.assignedTo || '') && d.status === 'won').length;
    const successRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0;
    
    return { clients, deals, tasks, completedTasks, revenue, successRate };
  };

  const stats = getTeamStats();

  const handleBack = () => {
    navigate('/teams');
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSaveTeam = (teamData: Partial<Team>) => {
    const updatedTeam = { ...team, ...teamData };
    setLocalTeams(prev => prev.map(t => t.id === team.id ? updatedTeam : t));
    setTeam(updatedTeam);
    setShowEditModal(false);
  };

  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذا الفريق؟ سيتم إزالة جميع الأعضاء منه.')) {
      // إزالة الفريق من القائمة
      setLocalTeams(prev => prev.filter(t => t.id !== team.id));
      // إزالة الفريق من جميع الأعضاء
      setLocalUsers(prev => prev.map(u => 
        u.teamId === team.id ? { ...u, teamId: undefined } : u
      ));
      navigate('/teams');
    }
  };

  const handleAddMember = (userId: string) => {
    // إضافة المندوب للفريق
    setLocalUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, teamId: team.id } : u
    ));
    setShowAddMemberModal(false);
  };

  const handleRemoveMember = (userId: string) => {
    if (confirm('هل أنت متأكد من إزالة هذا المندوب من الفريق؟')) {
      // إزالة المندوب من الفريق
      setLocalUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, teamId: undefined } : u
      ));
    }
  };

  const handleToggleMemberStatus = (userId: string) => {
    const member = localUsers.find(u => u.id === userId);
    if (member) {
      const newStatus = !member.isActive;
      const action = newStatus ? 'تفعيل' : 'إيقاف مؤقت';
      
      if (confirm(`هل أنت متأكد من ${action} هذا المندوب؟`)) {
        setLocalUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, isActive: newStatus } : u
        ));
      }
    }
  };

  return (
    <CanView permission="teams">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" icon={ArrowLeft} onClick={handleBack}>
              العودة للفرق
            </Button>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {team.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                إدارة فريق {user?.role === 'sales_manager' ? 'المبيعات' : ''} والإحصائيات
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <CanEdit permission="teams">
              <Button variant="outline" icon={Edit} onClick={handleEdit}>
                تعديل
              </Button>
            </CanEdit>
            <CanDelete permission="teams">
              <Button 
                variant="outline" 
                icon={Trash2} 
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                حذف
              </Button>
            </CanDelete>
          </div>
        </div>

        {/* Team Info Card */}
        <Card>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {team.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {team.region} • المدير: {manager?.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{team.region}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{teamMembers.length} مندوب</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  تم الإنشاء: {new Date(team.createdAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  team.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {team.isActive ? 'نشط' : 'غير نشط'}
                </span>
              </div>
              {team.description && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {team.description}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Performance Stats */}
        <Card>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-6">إحصائيات الفريق</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Users className="w-6 h-6 text-blue-500" />
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.clients}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">العملاء</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Target className="w-6 h-6 text-green-500" />
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.deals}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">العقود</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Calendar className="w-6 h-6 text-purple-500" />
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.tasks}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">المهام</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <CheckCircle className="w-6 h-6 text-orange-500" />
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completedTasks}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">مكتملة</p>
            </div>
          </div>
          
          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {stats.revenue.toLocaleString()} ريال
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الإيرادات</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {stats.successRate}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">معدل النجاح</p>
            </div>
          </div>
        </Card>

        {/* Team Members */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">مندوبي الفريق</h4>
            <CanEdit permission="teams">
              <Button icon={Plus} onClick={() => setShowAddMemberModal(true)}>
                إضافة مندوب
              </Button>
            </CanEdit>
          </div>
          <div className="space-y-4">
            {teamMembers.map((member) => {
              // حساب إحصائيات المندوب
              const memberClients = mockClients.filter(c => c.assignedTo === member.id).length;
              const memberDeals = mockDeals.filter(d => d.assignedTo === member.id).length;
              const memberTasks = mockTasks.filter(t => t.assignee === member.id).length;
              
              return (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">{member.name}</h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {memberClients} عميل • {memberDeals} عقد • {memberTasks} مهمة
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      member.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {member.isActive ? 'نشط' : 'موقوف مؤقتاً'}
                    </span>
                    
                    {/* أزرار التحكم */}
                    <CanEdit permission="teams">
                      <div className="flex space-x-1">
                        {/* زر إيقاف/تفعيل مؤقت */}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={member.isActive ? Pause : Play}
                          onClick={() => handleToggleMemberStatus(member.id)}
                          className={member.isActive 
                            ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                            : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          }
                        />
                        
                        {/* زر إزالة من الفريق */}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={X}
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        />
                      </div>
                    </CanEdit>
                  </div>
                </div>
              );
            })}
            
            {teamMembers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">لا يوجد مندوبي مبيعات في هذا الفريق</p>
                <CanEdit permission="teams">
                  <Button 
                    variant="outline" 
                    icon={Plus} 
                    onClick={() => setShowAddMemberModal(true)}
                    className="mt-4"
                  >
                    إضافة أول مندوب
                  </Button>
                </CanEdit>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-6">النشاط الأخير</h4>
          <div className="space-y-4">
            {mockTasks
              .filter(task => teamMembers.some(member => member.id === task.assignee))
              .slice(0, 5)
              .map((task) => (
                <div key={task.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    task.status === 'done' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">{task.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {teamMembers.find(m => m.id === task.assignee)?.name} • 
                      {new Date(task.dueDate).toLocaleDateString('ar-SA')}
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
            
            {mockTasks.filter(task => teamMembers.some(member => member.id === task.assignee)).length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">لا يوجد نشاط حديث</p>
              </div>
            )}
          </div>
        </Card>

        {/* Edit Team Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="تعديل الفريق"
        >
          <EditTeamForm
            team={team}
            onSave={handleSaveTeam}
            onCancel={() => setShowEditModal(false)}
          />
        </Modal>

        {/* Add Member Modal */}
        <Modal
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          title="إضافة مندوب للفريق"
        >
          <AddMemberForm
            onAdd={handleAddMember}
            onCancel={() => setShowAddMemberModal(false)}
          />
        </Modal>
      </div>
    </CanView>
  );
}; 