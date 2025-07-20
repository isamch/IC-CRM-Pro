import React, { useState } from 'react';
import { Plus, Calendar, Clock, User, Edit, Trash2, CheckSquare } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { mockTasks, mockClients, mockDeals } from '../data/mockData';
import { Task } from '../types';

const PriorityBadge: React.FC<{ priority: Task['priority'] }> = ({ priority }) => {
  const colors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[priority]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

const TaskForm: React.FC<{
  task?: Task;
  onSave: (task: Partial<Task>) => void;
  onCancel: () => void;
}> = ({ task, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate || '',
    status: task?.status || 'pending',
    priority: task?.priority || 'medium',
    clientId: task?.clientId || '',
    dealId: task?.dealId || '',
    assignee: task?.assignee || 'You'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Task Title"
        value={formData.title}
        onChange={(value) => setFormData({ ...formData, title: value })}
        placeholder="Enter task title"
        required
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter task description"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Due Date"
          type="date"
          value={formData.dueDate}
          onChange={(value) => setFormData({ ...formData, dueDate: value })}
          required
        />
        <Select
          label="Priority"
          value={formData.priority}
          onChange={(value) => setFormData({ ...formData, priority: value as Task['priority'] })}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' }
          ]}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Status"
          value={formData.status}
          onChange={(value) => setFormData({ ...formData, status: value as Task['status'] })}
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'done', label: 'Done' }
          ]}
          required
        />
        <Input
          label="Assignee"
          value={formData.assignee}
          onChange={(value) => setFormData({ ...formData, assignee: value })}
          placeholder="Enter assignee"
        />
      </div>
      
      <Select
        label="Related Client"
        value={formData.clientId}
        onChange={(value) => setFormData({ ...formData, clientId: value })}
        options={mockClients.map(client => ({
          value: client.id,
          label: `${client.name} (${client.company})`
        }))}
        placeholder="Select a client (optional)"
      />
      
      <Select
        label="Related Deal"
        value={formData.dealId}
        onChange={(value) => setFormData({ ...formData, dealId: value })}
        options={mockDeals.map(deal => ({
          value: deal.id,
          label: deal.title
        }))}
        placeholder="Select a deal (optional)"
      />
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {task ? 'Update Task' : 'Add Task'}
        </Button>
      </div>
    </form>
  );
};

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  const filteredTasks = tasks.filter(task => {
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

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
            Tasks ({filteredTasks.length})
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {pendingTasks} pending tasks
          </p>
        </div>
        <Button icon={Plus} onClick={handleAddTask}>
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'done', label: 'Done' }
            ]}
            className="sm:w-48"
          />
          <Select
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'high', label: 'High Priority' },
              { value: 'medium', label: 'Medium Priority' },
              { value: 'low', label: 'Low Priority' }
            ]}
            className="sm:w-48"
          />
        </div>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const client = mockClients.find(c => c.id === task.clientId);
          const deal = mockDeals.find(d => d.id === task.dealId);
          const overdue = isOverdue(task.dueDate);
          
          return (
            <Card key={task.id} className={`transition-all duration-200 hover:shadow-md ${overdue && task.status === 'pending' ? 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <button
                    onClick={() => handleToggleStatus(task.id)}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      task.status === 'done'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                    }`}
                  >
                    {task.status === 'done' && <CheckSquare className="w-3 h-3" />}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`font-medium ${
                        task.status === 'done' 
                          ? 'line-through text-gray-500 dark:text-gray-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h3>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span className={overdue && task.status === 'pending' ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                          {new Date(task.dueDate).toLocaleDateString()}
                          {overdue && task.status === 'pending' && ' (Overdue)'}
                        </span>
                      </div>
                      
                      {task.assignee && (
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{task.assignee}</span>
                        </div>
                      )}
                      
                      {client && (
                        <div className="flex items-center space-x-1">
                          <span>Client: {client.name}</span>
                        </div>
                      )}
                      
                      {deal && (
                        <div className="flex items-center space-x-1">
                          <span>Deal: {deal.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    icon={Edit}
                    onClick={() => handleEditTask(task)}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-600 hover:text-red-700"
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tasks found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {statusFilter !== 'all' || priorityFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Get started by adding your first task'
            }
          </p>
          {statusFilter === 'all' && priorityFilter === 'all' && (
            <Button icon={Plus} onClick={handleAddTask}>
              Add Task
            </Button>
          )}
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
        size="lg"
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