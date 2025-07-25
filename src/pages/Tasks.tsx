import React, { useState } from 'react';
import { Plus, Calendar, User, Edit, Trash2, CheckSquare, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { mockTasks, mockClients, mockDeals, mockUsers, mockTeams } from '../data/mockData';
import { Task } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PriorityBadge: React.FC<{ priority: Task['priority'] }> = ({ priority }) => {
  const colors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  const labels = {
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'عالية'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[priority]}`}>
      {labels[priority]}
    </span>
  );
};

const StatusBadge: React.FC<{ status: Task['status'] }> = ({ status }) => {
  const colors = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    done: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  };

  const labels = {
    pending: 'قيد التنفيذ',
    done: 'مكتملة'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  );
};

const TaskForm: React.FC<{
  task?: Task;
  onSave: (task: Partial<Task>) => void;
  onCancel: () => void;
}> = ({ task, onSave, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate || '',
    status: task?.status || 'pending',
    priority: task?.priority || 'medium',
    clientId: task?.clientId || '',
    dealId: task?.dealId || '',
    assignee: task?.assignee || (user?.role === 'sales_representative' ? user.id : ''),
    teamId: task?.teamId || ''
  });

  // Get available users for assignment
  let availableUsers: typeof mockUsers = [];
  if (user) {
    if (user.role === 'admin') {
      const representatives = mockUsers.filter(u => u.role === 'sales_representative' && u.isActive);
      availableUsers = [user, ...representatives];
    } else if (user.role === 'sales_manager') {
      const teamMembers = mockUsers.filter(u => u.role === 'sales_representative' && u.teamId === user.teamId && u.isActive);
      availableUsers = [user, ...teamMembers];
    }
  }
  
  const userOptions = availableUsers.map(u => {
    const team = mockTeams.find(t => t.id === u.teamId);
    const label = u.id === user?.id 
      ? `${u.name} (أنت)`
      : `${u.name} (${team ? team.name : 'بدون فريق'})`;
    return {
      value: u.id,
      label: label
    };
  });

  // Get teams managed by the current user if they are a sales manager
  const managedTeams = user?.role === 'sales_manager' 
    ? mockTeams.filter(team => team.managerId === user.id) 
    : [];

  // Helper to determine if team selection should be shown
  const shouldShowTeamSelect =
    user?.role === 'sales_manager' &&
    managedTeams.length > 1 &&
    (
      // Case 1: No assignee selected (implicit self-assignment)
      !formData.assignee ||
      // Case 2: Explicitly selected self
      formData.assignee === user.id
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let { assignee, teamId } = { ...formData };

    if (formData.assignee) {
      // Case 1: An assignee was explicitly selected from the dropdown.
      if (user?.role === 'sales_manager' && formData.assignee === user.id && managedTeams.length > 1) {
        // Manager chose himself and has multiple teams: use selected teamId
        // (teamId already set by the select)
      } else {
        // The task's team MUST be the selected user's team.
        const selectedUserInfo = mockUsers.find(u => u.id === formData.assignee);
        teamId = selectedUserInfo?.teamId || '';
      }
    } else {
      // Case 2: No assignee was selected, so it defaults to the current user.
      assignee = user?.id || '';
      // If no team was selected manually (e.g., manager has only 1 team),
      // set it to the current user's primary team.
      if (!teamId) {
        teamId = user?.teamId || '';
      }
    }
    
    onSave({
      ...formData,
      assignee,
      teamId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Role-based information */}
      {user?.role === 'sales_representative' && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>ملاحظة:</strong> ستتم إضافة هذه المهمة تلقائياً إلى قائمة مهامك
          </p>
        </div>
      )}

      <Input
        label="عنوان المهمة"
        value={formData.title}
        onChange={(value) => setFormData({ ...formData, title: value })}
        placeholder="أدخل عنوان المهمة"
        required
        className="text-gray-900 dark:text-white"
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          وصف المهمة
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="أدخل وصف المهمة..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-gray-900 dark:text-white"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="تاريخ الاستحقاق"
          type="date"
          value={formData.dueDate}
          onChange={(value) => setFormData({ ...formData, dueDate: value })}
          required
          className="text-gray-900 dark:text-white"
        />
        <Select
          label="الأولوية"
          value={formData.priority}
          onChange={(value) => setFormData({ ...formData, priority: value as Task['priority'] })}
          options={[
            { value: 'low', label: 'منخفضة' },
            { value: 'medium', label: 'متوسطة' },
            { value: 'high', label: 'عالية' }
          ]}
          required
          className="text-gray-900 dark:text-white"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="الحالة"
          value={formData.status}
          onChange={(value) => setFormData({ ...formData, status: value as Task['status'] })}
          options={[
            { value: 'pending', label: 'قيد التنفيذ' },
            { value: 'done', label: 'مكتملة' }
          ]}
          required
          className="text-gray-900 dark:text-white"
        />
        {/* Only show assignment field for managers and admins */}
        {(user?.role === 'admin' || user?.role === 'sales_manager') && (
          <Select
            label="المسؤول عن المهمة"
          value={formData.assignee}
          onChange={(value) => setFormData({ ...formData, assignee: value })}
            options={userOptions}
            placeholder="اختر المسؤول (اختياري)"
            className="text-gray-900 dark:text-white"
          />
        )}
      </div>
      
      {/* Team selection for managers assigning to themselves */}
      {shouldShowTeamSelect && (
        <Select
          label="نسب إلى فريق"
          value={formData.teamId}
          onChange={(value) => setFormData({ ...formData, teamId: value })}
          options={managedTeams.map(team => ({
            value: team.id,
            label: team.name
          }))}
          placeholder="اختر الفريق"
          required
          className="text-gray-900 dark:text-white"
        />
      )}

      <Select
        label="العميل المرتبط"
        value={formData.clientId}
        onChange={(value) => setFormData({ ...formData, clientId: value })}
        options={mockClients.map(client => ({
          value: client.id,
          label: `${client.name} (${client.company})`
        }))}
        placeholder="اختر العميل (اختياري)"
        className="text-gray-900 dark:text-white"
      />
      
      <Select
        label="الصفقة المرتبطة"
        value={formData.dealId}
        onChange={(value) => setFormData({ ...formData, dealId: value })}
        options={mockDeals.map(deal => ({
          value: deal.id,
          label: deal.title
        }))}
        placeholder="اختر الصفقة (اختياري)"
        className="text-gray-900 dark:text-white"
      />
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit">
          {task ? 'تحديث المهمة' : 'إضافة مهمة'}
        </Button>
      </div>
    </form>
  );
};

export const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(mockTasks);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });
  const navigate = useNavigate();

  // Filter tasks based on user permissions
  const visibleTasks = user?.role === 'admin' 
    ? tasks 
    : tasks.filter(task => {
        if (user?.role === 'sales_manager') {
          const teamMembers = mockUsers.filter(u => u.teamId === user.teamId && u.role === 'sales_representative');
          return teamMembers.some(member => member.id === task.assignee);
        } else if (user?.role === 'sales_representative') {
          return task.assignee === user?.id;
        }
        return false;
      });

  const filteredTasks = visibleTasks.filter(task => {
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
    
    // Team filter logic
    let teamMatch = true;
    if (teamFilter !== 'all') {
      if (teamFilter === 'no-team') {
        // المهام التي ليس لها teamId أو assignee ليس له teamId
        const assignee = mockUsers.find(u => u.id === task.assignee);
        teamMatch = !task.teamId && (!assignee || !assignee.teamId);
      } else {
        const assignee = mockUsers.find(u => u.id === task.assignee);
        teamMatch = (task.teamId === teamFilter) || (assignee?.teamId === teamFilter);
      }
    }
    
    return statusMatch && priorityMatch && teamMatch;
  });

  // Correctly handle tasks assigned to users without a team (like admin)
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const team = mockTeams.find(t => t.id === task.teamId);
    let teamName: string;

    if (team) {
      teamName = team.name;
    } else if (!task.teamId && task.assignee) {
      // Fallback for older tasks: find team via assignee
      const assignee = mockUsers.find(u => u.id === task.assignee);
      const assigneeTeam = mockTeams.find(t => t.id === assignee?.teamId);
      teamName = assigneeTeam?.name || 'الإدارة / بدون فريق';
    } else {
      teamName = 'الإدارة / بدون فريق';
    }
    
    if (!groups[teamName]) {
      groups[teamName] = [];
    }
    groups[teamName].push(task);
    return groups;
  }, {} as Record<string, Task[]>);

  // استخراج جميع teamId من جميع المهام في النظام
  const allTeamIdsWithTasks = Array.from(new Set(mockTasks.map(task => {
    if (task.teamId) return task.teamId;
    const assignee = mockUsers.find(u => u.id === task.assignee);
    return assignee?.teamId || 'no-team';
  })));

  // بناء قائمة الفرق التي لديها مهام
  const allTeamsWithTasks = mockTeams.filter(team => allTeamIdsWithTasks.includes(team.id));

  // إضافة خيار الإدارة / بدون فريق
  const teamOptions = [
    { value: 'no-team', label: 'الإدارة / بدون فريق' },
    ...allTeamsWithTasks.map(team => ({ value: team.id, label: team.name }))
  ];

  const availableTeams = user?.role === 'admin'
    ? allTeamsWithTasks
    : user?.role === 'sales_manager'
    ? allTeamsWithTasks.filter(t => t.id === user.teamId)
    : [];

  const handleAddTask = () => {
    setEditingTask(undefined);
    setShowModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      setTasks(tasks.map(t => 
        t.id === editingTask.id ? { ...t, ...taskData } : t
      ));
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        ...taskData as Omit<Task, 'id'>,
      };
      setTasks([...tasks, newTask]);
    }
    setShowModal(false);
  };

  const handleDeleteTask = (taskId: string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'هل أنت متأكد من حذف هذه المهمة؟ لا يمكن التراجع عن هذه العملية.',
      onConfirm: () => {
    setTasks(tasks.filter(t => t.id !== taskId));
        setConfirmDialog(d => ({ ...d, isOpen: false }));
      }
    });
  };

  const handleToggleStatus = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, status: task.status === 'pending' ? 'done' : 'pending' }
        : task
    ));
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const pendingTasks = filteredTasks.filter(task => task.status === 'pending').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {user?.role === 'sales_representative' ? 'مهامي' : `المهام (${filteredTasks.length})`}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {user?.role === 'admin' 
              ? `${pendingTasks} مهمة قيد التنفيذ`
              : user?.role === 'sales_manager'
              ? `${pendingTasks} مهمة قيد التنفيذ في فريقي`
              : `${pendingTasks} مهمة قيد التنفيذ`
            }
          </p>
        </div>
        {/* Allow task creation for all roles that have permission */}
        {(user?.role === 'sales_representative' || user?.role === 'sales_manager' || user?.role === 'admin') && (
        <Button icon={Plus} onClick={handleAddTask}>
            إضافة مهمة
        </Button>
        )}
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">الفلاتر:</span>
          </div>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'جميع الحالات' },
              { value: 'pending', label: 'قيد التنفيذ' },
              { value: 'done', label: 'مكتملة' }
            ]}
            className="lg:w-40 text-gray-900 dark:text-white"
          />
          <Select
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: 'all', label: 'جميع الأولويات' },
              { value: 'high', label: 'عالية' },
              { value: 'medium', label: 'متوسطة' },
              { value: 'low', label: 'منخفضة' }
            ]}
            className="lg:w-40 text-gray-900 dark:text-white"
          />
          {/* Team filter - only for admins and managers */}
          {(user?.role === 'admin' || user?.role === 'sales_manager') && (
            <Select
              value={teamFilter}
              onChange={setTeamFilter}
              options={[
                { value: 'all', label: 'جميع الفرق' },
                { value: 'no-team', label: 'الإدارة / بدون فريق' },
                ...availableTeams.map(team => ({
                  value: team.id,
                  label: team.name
                }))
              ]}
              className="lg:w-40 text-gray-900 dark:text-white"
            />
          )}
        </div>
      </Card>

      {/* Tasks by Team */}
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([teamName, teamTasks]) => (
          <div key={teamName} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {teamName} ({teamTasks.length})
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {teamTasks.filter(t => t.status === 'pending').length} قيد التنفيذ
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {teamTasks.map((task) => {
          const client = mockClients.find(c => c.id === task.clientId);
                const assignee = mockUsers.find(u => u.id === task.assignee);
          const overdue = isOverdue(task.dueDate);
          
          return (
                  <Card key={task.id} className={`p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
                    overdue && task.status === 'pending' 
                      ? 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10' 
                      : 'hover:border-blue-300 dark:hover:border-blue-600'
                  }`}>
                    <div onClick={() => navigate(`/tasks/${task.id}`)} className="cursor-pointer">
                      <div className="space-y-3">
                        {/* Header */}
              <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium text-sm truncate ${
                              task.status === 'done' 
                                ? 'line-through text-gray-500 dark:text-gray-400' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {task.title}
                            </h4>
                          </div>
                  <button
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              handleToggleStatus(task.id);
                            }}
                            className={`ml-2 w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      task.status === 'done'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                    }`}
                  >
                            {task.status === 'done' && <CheckSquare className="w-2.5 h-2.5" />}
                  </button>
                    </div>
                    
                        {/* Description */}
                    {task.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={task.status} />
                          <PriorityBadge priority={task.priority} />
                          {overdue && task.status === 'pending' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                              متأخرة
                            </span>
                          )}
                        </div>
                        
                        {/* Details */}
                        <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                        <span className={overdue && task.status === 'pending' ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                              {new Date(task.dueDate).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                      
                          {assignee && (
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3" />
                              <span>{assignee.name}</span>
                        </div>
                      )}
                      
                      {client && (
                            <div className="flex items-center gap-2">
                              <span>العميل: {client.name}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-100 dark:border-gray-700">
                          <button
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              handleEditTask(task);
                            }}
                            className="h-6 w-6 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                            className="h-6 w-6 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
              </div>
            </Card>
          );
        })}
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {user?.role === 'sales_representative' ? 'لا توجد مهام لك' : 'لم يتم العثور على مهام'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {statusFilter !== 'all' || priorityFilter !== 'all' || teamFilter !== 'all'
              ? 'جرب تغيير معايير البحث' 
              : user?.role === 'sales_representative' 
              ? 'ابدأ بإضافة أول مهمة'
              : 'لا توجد مهام متاحة'
            }
          </p>
          {(statusFilter === 'all' && priorityFilter === 'all' && teamFilter === 'all' && (user?.role === 'sales_representative' || user?.role === 'admin')) && (
            <Button icon={Plus} onClick={handleAddTask}>
              إضافة مهمة
            </Button>
          )}
          {statusFilter === 'all' && priorityFilter === 'all' && teamFilter === 'all' && user?.role === 'sales_manager' && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>المدراء لا يمكنهم إنشاء مهام</p>
              <p className="text-xs">يمكنهم فقط تعيين المهام للمندوبين</p>
            </div>
          )}
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTask ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
      >
        <TaskForm
          task={editingTask}
          onSave={handleSaveTask}
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