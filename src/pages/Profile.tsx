import React, { useState } from 'react';
import { User, Camera, Mail, Phone, Building, Calendar, Clock, Save, Edit, Award, Target, TrendingUp, Building2, Activity } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { mockDeals, mockClients, mockDealActivities, mockTeams } from '../data/mockData';
import { Link } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    role: user?.role || ''
  });

  const handleSave = () => {
    updateUser({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      role: user?.role || ''
    });
    setIsEditing(false);
  };

  if (!user) return null;

  // Performance Stats
  const managedClients = mockClients.filter(c => c.assignedTo === user.id).length;
  const closedDeals = mockDeals.filter(d => d.assignedTo === user.id && d.status === 'won');
  const revenueGenerated = closedDeals.reduce((sum, deal) => sum + deal.amount, 0);

  // Recent Activities
  const recentActivities = mockDealActivities
    .filter(activity => activity.userId === user.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const team = mockTeams.find(t => t.id === user.teamId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(amount);
  };

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Profile Settings
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage your account information and view your performance
        </p>
      </div>

      {/* Main Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="text-center relative overflow-hidden h-full">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"></div>
            
            <div className="relative z-10 p-4 flex flex-col h-full">
              <div className="relative inline-block mb-3">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg relative">
                  <User className="w-10 h-10 text-white" />
                  <button className="absolute bottom-0 right-0 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors shadow-lg border border-white dark:border-gray-700">
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {user.name}
              </h3>
              <p className="text-blue-600 dark:text-blue-400 font-semibold mb-1 text-sm">
                {user.role}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                {user.department}
              </p>
              
              {team && (
                <Link to={`/teams/${team.id}`} className="inline-block mb-3">
                  <div className="flex items-center space-x-2 text-xs bg-white dark:bg-gray-700 rounded-full py-1 px-3 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <Building2 className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">{team.name}</span>
                  </div>
                </Link>
              )}


              {/* Quick Stats is removed as per the logic to replace it with dynamic data */}

              {/* Member Info */}
              <div className="space-y-1 text-xs mt-auto">
                <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>Joined {new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
                {user.lastLogin && (
                  <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>Last active {new Date(user.lastLogin).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                Personal Information
              </h4>
              {!isEditing ? (
                <Button icon={Edit} onClick={() => setIsEditing(true)} size="sm">
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleCancel} size="sm">
                    Cancel
                  </Button>
                  <Button icon={Save} onClick={handleSave} size="sm">
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
                disabled={!isEditing}
                icon={User}
                className="text-gray-900 dark:text-white"
              />
              
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                disabled={!isEditing}
                icon={Mail}
                className="text-gray-900 dark:text-white"
              />
              
              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                disabled={!isEditing}
                icon={Phone}
                className="text-gray-900 dark:text-white"
              />
              
              <Input
                label="Department"
                value={formData.department}
                onChange={(value) => setFormData({ ...formData, department: value })}
                disabled={!isEditing}
                icon={Building}
                className="text-gray-900 dark:text-white"
              />
              
              <div className="md:col-span-2">
                <Input
                  label="Job Title"
                  value={formData.role}
                  onChange={(value) => setFormData({ ...formData, role: value })}
                  disabled={!isEditing}
                  className="text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Performance Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{managedClients}</div>
              <div className="text-blue-600 dark:text-blue-400 font-medium text-xs">Clients Managed</div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-green-700 dark:text-green-300">{closedDeals.length}</div>
              <div className="text-green-600 dark:text-green-400 font-medium text-xs">Deals Closed</div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{formatCurrency(revenueGenerated)}</div>
              <div className="text-purple-600 dark:text-purple-400 font-medium text-xs">Revenue Generated</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Recent Activity
        </h4>
        
        <div className="space-y-2">
          {recentActivities.length > 0 ? (
            recentActivities.map(activity => (
              <div key={activity.id} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={`w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center`}>
                  <Activity className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-xs">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(activity.date).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">No recent activity</p>
          )}
        </div>
      </Card>
    </div>
  );
};