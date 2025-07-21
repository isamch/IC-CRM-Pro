import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, Search, User, Settings, LogOut, UserCircle, Menu } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface TopNavbarProps {
  onToggleSidebar: () => void;
}

const getPageTitle = (pathname: string): string => {
  if (pathname.startsWith('/teams/')) return 'Team Details';
  if (pathname.startsWith('/clients/')) return 'Client Details';
  if (pathname.startsWith('/deals/')) return 'Deal Details';
  if (pathname.startsWith('/tasks/')) return 'Task Details';
  if (pathname.startsWith('/sales-reps/')) return 'Sales Rep Details';
  if (pathname.startsWith('/sales-managers/')) return 'Sales Manager Details';

  const titles: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/users': 'Users',
    '/teams': 'Teams',
    '/clients': 'Clients',
    '/deals': 'Deals',
    '/tasks': 'Tasks',
    '/profile': 'Profile',
    '/settings': 'Settings'
  };
  return titles[pathname] || 'Dashboard';
};

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileMenuClick = (action: string) => {
    setIsProfileDropdownOpen(false);
    if (action === 'profile') {
      navigate('/profile');
    } else if (action === 'settings') {
      navigate('/settings');
    } else if (action === 'logout') {
      logout();
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side - Menu Button and Page Title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {getPageTitle(location.pathname)}
          </h1>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-64 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>
          </div>

          {/* Theme Toggle */}
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name || 'John Doe'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role || 'Sales Manager'}
                </div>
              </div>
              <svg 
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-fade-in">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.name || 'John Doe'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email || 'john.doe@company.com'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => handleProfileMenuClick('profile')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <UserCircle className="w-4 h-4 mr-3" />
                    View Profile
                  </button>
                  
                  <button
                    onClick={() => handleProfileMenuClick('settings')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                  <button
                    onClick={() => handleProfileMenuClick('logout')}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};