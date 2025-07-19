import React, { useState } from 'react';
import { 
  Bell, 
  Globe, 
  Shield, 
  Palette, 
  Monitor, 
  Sun, 
  Moon, 
  Smartphone,
  Mail,
  Volume2,
  Lock,
  Key,
  Database,
  Download,
  Trash2,
  Save
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, updateUser } = useAuth();
  
  const [notifications, setNotifications] = useState({
    email: user?.preferences.notifications.email || true,
    push: user?.preferences.notifications.push || true,
    desktop: user?.preferences.notifications.desktop || false
  });
  
  const [language, setLanguage] = useState(user?.preferences.language || 'en');
  const [timezone, setTimezone] = useState(user?.preferences.timezone || 'America/New_York');

  const handleSavePreferences = () => {
    updateUser({
      preferences: {
        ...user!.preferences,
        theme,
        notifications,
        language,
        timezone
      }
    });
  };

  const SettingSection: React.FC<{
    icon: React.ComponentType<any>;
    title: string;
    description: string;
    children: React.ReactNode;
  }> = ({ icon: Icon, title, description, children }) => (
    <Card>
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {description}
          </p>
          {children}
        </div>
      </div>
    </Card>
  );

  const ToggleSwitch: React.FC<{
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    label: string;
    description?: string;
  }> = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </div>
        {description && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </div>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your application preferences and account settings
          </p>
        </div>
        <Button icon={Save} onClick={handleSavePreferences}>
          Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <SettingSection
          icon={Palette}
          title="Appearance"
          description="Customize how the application looks and feels"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => theme !== 'light' && toggleTheme()}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    theme === 'light'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Sun className="w-5 h-5 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Light</div>
                </button>
                
                <button
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Moon className="w-5 h-5 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Dark</div>
                </button>
                
                <button className="p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 transition-all">
                  <Monitor className="w-5 h-5 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">System</div>
                </button>
              </div>
            </div>
          </div>
        </SettingSection>

        {/* Notifications */}
        <SettingSection
          icon={Bell}
          title="Notifications"
          description="Choose what notifications you want to receive"
        >
          <div className="space-y-1">
            <ToggleSwitch
              enabled={notifications.email}
              onChange={(enabled) => setNotifications({ ...notifications, email: enabled })}
              label="Email Notifications"
              description="Receive notifications via email"
            />
            <ToggleSwitch
              enabled={notifications.push}
              onChange={(enabled) => setNotifications({ ...notifications, push: enabled })}
              label="Push Notifications"
              description="Receive push notifications in your browser"
            />
            <ToggleSwitch
              enabled={notifications.desktop}
              onChange={(enabled) => setNotifications({ ...notifications, desktop: enabled })}
              label="Desktop Notifications"
              description="Show notifications on your desktop"
            />
          </div>
        </SettingSection>

        {/* Language & Region */}
        <SettingSection
          icon={Globe}
          title="Language & Region"
          description="Set your language and regional preferences"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Language"
              value={language}
              onChange={setLanguage}
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español' },
                { value: 'fr', label: 'Français' },
                { value: 'de', label: 'Deutsch' },
                { value: 'it', label: 'Italiano' }
              ]}
            />
            <Select
              label="Timezone"
              value={timezone}
              onChange={setTimezone}
              options={[
                { value: 'America/New_York', label: 'Eastern Time (ET)' },
                { value: 'America/Chicago', label: 'Central Time (CT)' },
                { value: 'America/Denver', label: 'Mountain Time (MT)' },
                { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
                { value: 'Europe/Paris', label: 'Central European Time (CET)' }
              ]}
            />
          </div>
        </SettingSection>

        {/* Security */}
        <SettingSection
          icon={Shield}
          title="Security"
          description="Manage your account security settings"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Change Password
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Last changed 3 months ago
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Key className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Two-Factor Authentication
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Add an extra layer of security
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
          </div>
        </SettingSection>

        {/* Data & Privacy */}
        <SettingSection
          icon={Database}
          title="Data & Privacy"
          description="Manage your data and privacy settings"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Export Data
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Download a copy of your data
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-3">
                <Trash2 className="w-5 h-5 text-red-500" />
                <div>
                  <div className="text-sm font-medium text-red-900 dark:text-red-300">
                    Delete Account
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    Permanently delete your account and all data
                  </div>
                </div>
              </div>
              <Button variant="danger" size="sm">
                Delete
              </Button>
            </div>
          </div>
        </SettingSection>
      </div>
    </div>
  );
};