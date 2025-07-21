import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  MapPin, 
  Eye
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { CanView } from '../components/auth/PermissionGuard';
import { useAuth } from '../contexts/AuthContext';
import { mockTeams, mockUsers } from '../data/mockData';
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

export const Teams: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | undefined>();
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });
  const [managerFilter, setManagerFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // تحميل الفرق حسب الصلاحيات
  useEffect(() => {
    if (user?.role === 'admin') {
      // المدير يرى جميع الفرق
      setTeams(mockTeams);
    } else if (user?.role === 'sales_manager') {
      // مدير المبيعات يرى فرقه فقط
      setTeams(mockTeams.filter(team => team.managerId === user.id));
    } else if (user?.role === 'sales_representative') {
      // المندوب يرى فريقه فقط
      const userTeam = mockTeams.find(team => team.id === user.teamId);
      setTeams(userTeam ? [userTeam] : []);
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
    navigate(`/teams/${team.id}`);
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
    setConfirmDialog({
      isOpen: true,
      message: 'هل أنت متأكد من حذف هذا الفريق؟ سيتم حذف جميع بياناته.',
      onConfirm: () => {
        setTeams(prev => prev.filter(t => t.id !== teamId));
        setConfirmDialog(d => ({ ...d, isOpen: false }));
      }
    });
  };

  // الحصول على عدد أعضاء الفريق
  const getTeamMemberCount = (teamId: string) => {
    return mockUsers.filter(user => user.teamId === teamId).length;
  };

  // الحصول على اسم مدير الفريق
  const getTeamManagerName = (managerId: string | undefined) => {
    if (!managerId) return 'غير محدد';
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
              {user?.role === 'sales_representative' ? 'فريقي' : `إدارة الفرق (${filteredTeams.length})`}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {user?.role === 'admin' 
                ? 'إدارة جميع الفرق في النظام'
                : user?.role === 'sales_manager'
                ? 'إدارة فرقك وإنشاء فرق جديدة'
                : 'معلومات فريقي وأعضائه'
              }
            </p>
          </div>
          {(user?.role === 'admin' || user?.role === 'sales_manager') && (
            <Button icon={Plus} onClick={handleAddTeam}>
              إنشاء فريق
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card padding="sm">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <div className="relative flex-1">
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
            {/* Filter by Sales Manager */}
            <select
              className="min-w-[160px] px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
              value={managerFilter}
              onChange={e => setManagerFilter(e.target.value)}
            >
              <option value="">كل مدراء المبيعات</option>
              {mockUsers.filter(u => u.role === 'sales_manager').map(manager => (
                <option key={manager.id} value={manager.id}>{manager.name}</option>
              ))}
            </select>
            {/* Filter by Region */}
            <select
              className="min-w-[120px] px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
            >
              <option value="">كل المناطق</option>
              {[...new Set(mockTeams.map(t => t.region || ''))].filter(region => region).map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            {/* Filter by Status */}
            <select
              className="min-w-[100px] px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">كل الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>
        </Card>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTeams
            .filter(team => !managerFilter || team.managerId === managerFilter)
            .filter(team => !regionFilter || team.region === regionFilter)
            .filter(team => !statusFilter || (statusFilter === 'active' ? team.isActive : !team.isActive))
            .map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 p-3 rounded-lg">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                      {team.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {team.region}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    icon={Eye}
                    onClick={() => handleViewDetails(team)}
                  />
                  {(user?.role === 'admin' || user?.role === 'sales_manager') && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      icon={Edit}
                      onClick={() => handleEditTeam(team)}
                    />
                  )}
                  {(user?.role === 'admin' || user?.role === 'sales_manager') && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteTeam(team.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    />
                  )}
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span>{team.region}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <Users className="w-3 h-3" />
                  <span>{getTeamMemberCount(team.id)} عضو</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <span>المدير: {getTeamManagerName(team.managerId)}</span>
                </div>
                {team.description && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <span className="line-clamp-2">{team.description}</span>
                  </div>
                )}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  team.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {team.isActive ? 'نشط' : 'غير نشط'}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  تم الإنشاء: {new Date(team.createdAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
              {/* قائمة أعضاء الفريق */}
              <div className="mt-1">
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">أعضاء الفريق:</div>
                <div className="flex flex-wrap gap-1">
                  {mockUsers.filter(u => u.teamId === team.id && u.role === 'sales_representative').map(rep => (
                    <Link
                      key={rep.id}
                      to={`/sales-reps/${rep.id}`}
                      className="text-blue-600 dark:text-blue-300 hover:underline text-[11px] bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded"
                    >
                      {rep.name}
                    </Link>
                  ))}
                  {mockUsers.filter(u => u.teamId === team.id && u.role === 'sales_representative').length === 0 && (
                    <span className="text-gray-400">لا يوجد مندوبي مبيعات</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* No results */}
        {filteredTeams.length === 0 && (
          <Card className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {user?.role === 'sales_representative' ? 'لا يوجد فريق مسند لك' : 'لم يتم العثور على فرق'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {user?.role === 'sales_representative' 
                ? 'يرجى التواصل مع مديرك لتعيينك لفريق'
                : searchTerm ? 'جرب تغيير معايير البحث' : 'ابدأ بإنشاء أول فريق'
              }
            </p>
            {!searchTerm && (user?.role === 'admin' || user?.role === 'sales_manager') && (
              <Button icon={Plus} onClick={handleAddTeam}>
                إنشاء فريق
              </Button>
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
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(d => ({ ...d, isOpen: false }))}
        />
      </div>
    </CanView>
  );
}; 