import React from 'react';
import { Users, Briefcase, TrendingUp, CheckSquare, DollarSign } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { DealStatusChart } from '../components/charts/DealStatusChart';
import { useAuth } from '../contexts/AuthContext';
import { mockClients, mockDeals, mockTasks, mockUsers } from '../data/mockData';
import { Client, Deal, Task, User } from '../types';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  trend?: string;
}> = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${color} opacity-30`} />
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Helper: get team members for sales_manager
  const getTeamMembers = () => {
    if (!user) return [];
    if (user.role === 'sales_manager') {
      return mockUsers.filter(u => u.teamId === user.teamId && u.isActive);
    }
    return [];
  };

  let clients: Client[] = [];
  let deals: Deal[] = [];
  let tasks: Task[] = [];
  let revenue = 0;
  let pendingTasks = 0;
  let dealsByStatus = { pending: 0, won: 0, lost: 0 };

  if (user) {
    if (user.role === 'admin') {
      clients = mockClients;
      deals = mockDeals;
      tasks = mockTasks;
    } else if (user.role === 'sales_manager') {
      const teamMembers = getTeamMembers();
      const teamMemberIds = teamMembers.map(u => u.id);
      clients = mockClients.filter(c => teamMemberIds.includes(c.assignedTo || ''));
      deals = mockDeals.filter(d => teamMemberIds.includes(d.assignedTo || ''));
      tasks = mockTasks.filter(t => teamMemberIds.includes(t.assignee || ''));
    } else if (user.role === 'sales_representative') {
      clients = mockClients.filter(c => c.assignedTo === user.id);
      deals = mockDeals.filter(d => d.assignedTo === user.id);
      tasks = mockTasks.filter(t => t.assignee === user.id);
    }
    revenue = deals.filter(d => d.status === 'won').reduce((sum, d) => sum + d.amount, 0);
    pendingTasks = tasks.filter(t => t.status === 'pending').length;
    dealsByStatus = {
      pending: deals.filter(d => d.status === 'pending').length,
      won: deals.filter(d => d.status === 'won').length,
      lost: deals.filter(d => d.status === 'lost').length,
    };
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Dynamic recent activity: last 3 deals or tasks
  let recentActivity: { type: string; title: string; date: string; status?: string }[] = [];
  if (user) {
    recentActivity = [
      ...deals.slice(-2).map(d => ({
        type: 'deal',
        title: `Deal "${d.title}" marked as ${d.status === 'won' ? 'won' : d.status === 'lost' ? 'lost' : 'pending'}`,
        date: d.date,
        status: d.status
      })),
      ...tasks.slice(-1).map(t => ({
        type: 'task',
        title: `Task "${t.title}" marked as ${t.status === 'done' ? 'completed' : 'pending'}`,
        date: t.dueDate,
        status: t.status
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clients"
          value={clients.length}
          icon={Users}
          color="bg-blue-500"
          trend={undefined}
        />
        <StatCard
          title="Total Deals"
          value={deals.length}
          icon={Briefcase}
          color="bg-indigo-500"
          trend={undefined}
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(revenue)}
          icon={DollarSign}
          color="bg-green-500"
          trend={undefined}
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks}
          icon={CheckSquare}
          color="bg-amber-500"
        />
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DealStatusChart data={dealsByStatus} />
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.length === 0 && (
              <div className="text-gray-500 dark:text-gray-400">No recent activity.</div>
            )}
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'deal' ? 'bg-green-100 dark:bg-green-900' : 'bg-amber-100 dark:bg-amber-900'}`}>
                  {activity.type === 'deal' ? <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" /> : <CheckSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(activity.date).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};