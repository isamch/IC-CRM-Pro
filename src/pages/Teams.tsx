import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  MapPin, 
  UserPlus, 
  Eye,
  Calendar,
  Target,
  CheckCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { CanView, CanCreate, CanEdit, CanDelete } from '../components/auth/PermissionGuard';
import { useAuth } from '../contexts/AuthContext';
import { mockTeams, mockUsers, mockClients, mockDeals, mockTasks } from '../data/mockData';
import { Team } from '../types';

const TeamForm: React.FC<{
  team?: Team;
  onSave: (team: Partial<Team>) => void;
  onCancel: () => void;
}> = ({ team, onSave, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: team?.name || '',
    region: team?.region || '',
    description: team?.description || '',
    isActive: team?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teamData = {
      ...formData,
      managerId: team?.managerId || user?.id || '',
      createdAt: team?.createdAt || new Date().toISOString().split('T')[0],
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
          {team ? 'تحديث الفريق' : 'إنشاء الفريق'}
        </Button>
      </div>
    </form>
  );
};

const TeamDetails: React.FC<{
  team: Team;
  onClose: () => void;
}> = ({ team, onClose }) => {
  // الحصول على أعضاء الفريق
  const teamMembers = mockUsers.filter(user => user.teamId === team.id);
  const manager = mockUsers.find(user => user.id === team.managerId);

  // الحصول على إحصائيات الفريق
  const getTeamStats = () => {
    const teamMemberIds = teamMembers.map(member => member.id);
    const clients = mockClients.filter(c => teamMemberIds.includes(c.assignedTo || '')).length;
    const deals = mockDeals.filter(d => teamMemberIds.includes(d.assignedTo || '')).length;
    const tasks = mockTasks.filter(t => teamMemberIds.includes(t.assignee || '')).length;
    const completedTasks = mockTasks.filter(t => 
      teamMemberIds.includes(t.assignee || '') && t.status === 'done'
    ).length;
    
    return { clients, deals, tasks, completedTasks };
  };

  const stats = getTeamStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Users className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {team.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {team.region} • {manager?.name}
          </p>
        </div>
      </div>

      {/* Team Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">{team.region}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">{teamMembers.length} عضو</span>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">
              تم الإنشاء: {new Date(team.createdAt).toLocaleDateString('ar-SA')}
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
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

      {/* Performance Stats */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">إحصائيات الفريق</h4>
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

      {/* Team Members */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">أعضاء الفريق</h4>
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">{member.name}</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  member.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {member.isActive ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          إغلاق
        </Button>
        <Button icon={UserPlus}>
          إضافة عضو
        </Button>
      </div>
    </div>
  );
};

export const Teams: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | undefined>();
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>();

  // تحميل الفرق حسب الصلاحيات
  useEffect(() => {
    if (user?.role === 'admin') {
      // المدير يرى جميع الفرق
      setTeams(mockTeams);
    } else if (user?.role === 'sales_manager') {
      // مدير المبيعات يرى فرقه فقط
      setTeams(mockTeams.filter(team => team.managerId === user.id));
    } else {
      setTeams([]);
    }
  }, [user]);

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTeam = () => {
    setEditingTeam(undefined);
    setShowModal(true);
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setShowModal(true);
  };

  const handleViewDetails = (team: Team) => {
    setSelectedTeam(team);
    setShowDetailsModal(true);
  };

  const handleSaveTeam = (teamData: Partial<Team>) => {
    if (editingTeam) {
      setTeams(teams.map(t => 
        t.id === editingTeam.id ? { ...t, ...teamData } : t
      ));
    } else {
      const newTeam: Team = {
        id: Date.now().toString(),
        ...teamData as Omit<Team, 'id'>,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setTeams([...teams, newTeam]);
    }
    setShowModal(false);
  };

  const handleDeleteTeam = (teamId: string) => {
    setTeams(teams.filter(t => t.id !== teamId));
  };

  // الحصول على عدد أعضاء الفريق
  const getTeamMemberCount = (teamId: string) => {
    return mockUsers.filter(user => user.teamId === teamId).length;
  };

  // الحصول على اسم مدير الفريق
  const getTeamManagerName = (managerId: string) => {
    const manager = mockUsers.find(user => user.id === managerId);
    return manager ? manager.name : 'غير محدد';
  };

  return (
    <CanView permission="teams">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              إدارة الفرق ({filteredTeams.length})
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {user?.role === 'sales_manager' 
                ? 'إدارة فرقك وإنشاء فرق جديدة' 
                : 'إدارة جميع الفرق في النظام'
              }
            </p>
          </div>
          <CanCreate permission="teams">
            <Button icon={Plus} onClick={handleAddTeam}>
              إنشاء فريق
            </Button>
          </CanCreate>
        </div>

        {/* Search */}
        <Card padding="sm">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="البحث في الفرق..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </Card>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {team.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {team.region}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    icon={Eye}
                    onClick={() => handleViewDetails(team)}
                  />
                  <CanEdit permission="teams">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      icon={Edit}
                      onClick={() => handleEditTeam(team)}
                    />
                  </CanEdit>
                  <CanDelete permission="teams">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteTeam(team.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    />
                  </CanDelete>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{team.region}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{getTeamMemberCount(team.id)} عضو</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>المدير: {getTeamManagerName(team.managerId)}</span>
                </div>
                {team.description && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="line-clamp-2">{team.description}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    team.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {team.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  تم الإنشاء: {new Date(team.createdAt).toLocaleDateString('ar-SA')}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* No results */}
        {filteredTeams.length === 0 && (
          <Card className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لم يتم العثور على فرق
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm ? 'جرب تغيير معايير البحث' : 'ابدأ بإنشاء أول فريق'}
            </p>
            {!searchTerm && (
              <CanCreate permission="teams">
                <Button icon={Plus} onClick={handleAddTeam}>
                  إنشاء فريق
                </Button>
              </CanCreate>
            )}
          </Card>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingTeam ? 'تعديل الفريق' : 'إنشاء فريق جديد'}
        >
          <TeamForm
            team={editingTeam}
            onSave={handleSaveTeam}
            onCancel={() => setShowModal(false)}
          />
        </Modal>

        {/* Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="تفاصيل الفريق"
        >
          {selectedTeam && (
            <TeamDetails
              team={selectedTeam}
              onClose={() => setShowDetailsModal(false)}
            />
          )}
        </Modal>
      </div>
    </CanView>
  );
}; 