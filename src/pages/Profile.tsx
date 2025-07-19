import React, { useState } from 'react';
import { User, Camera, Mail, Phone, Building, Calendar, Clock, Save, Edit, Award, Target, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';

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
    updateUser(formData);
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

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Profile Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Manage your account information and view your performance
        </p>
      </div>

      {/* Main Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"></div>
            
            <div className="relative z-10 p-6">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <User className="w-16 h-16 text-white" />
                </div>
                <button className="absolute bottom-2 right-2 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors shadow-lg border-2 border-white dark:border-gray-700">
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {user.name}
              </h3>
              <p className="text-blue-600 dark:text-blue-400 font-semibold mb-1 text-lg">
                {user.role}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {user.department}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">4.8</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Rating</div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">98%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Success</div>
                </div>
              </div>

              {/* Member Info */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
                {user.lastLogin && (
                  <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Last active {new Date(user.lastLogin).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                Personal Information
              </h4>
              {!isEditing ? (
                <Button icon={Edit} onClick={() => setIsEditing(true)} size="sm">
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={handleCancel} size="sm">
                    Cancel
                  </Button>
                  <Button icon={Save} onClick={handleSave} size="sm">
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
                disabled={!isEditing}
                icon={User}
              />
              
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                disabled={!isEditing}
                icon={Mail}
              />
              
              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                disabled={!isEditing}
                icon={Phone}
              />
              
              <Input
                label="Department"
                value={formData.department}
                onChange={(value) => setFormData({ ...formData, department: value })}
                disabled={!isEditing}
                icon={Building}
              />
              
              <div className="md:col-span-2">
                <Input
                  label="Job Title"
                  value={formData.role}
                  onChange={(value) => setFormData({ ...formData, role: value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Performance Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-xl">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">24</div>
              <div className="text-blue-600 dark:text-blue-400 font-medium">Clients Managed</div>
              <div className="text-sm text-blue-500 dark:text-blue-400">+3 this month</div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500 rounded-xl">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">12</div>
              <div className="text-green-600 dark:text-green-400 font-medium">Deals Closed</div>
              <div className="text-sm text-green-500 dark:text-green-400">+2 this week</div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">$485K</div>
              <div className="text-purple-600 dark:text-purple-400 font-medium">Revenue Generated</div>
              <div className="text-sm text-purple-500 dark:text-purple-400">+15% vs last quarter</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Recent Activity
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                Closed deal with TechCorp Solutions
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">$45,000 • 2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                Added new client: DataStream Inc
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">4 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                Achieved monthly sales target
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Yesterday</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};