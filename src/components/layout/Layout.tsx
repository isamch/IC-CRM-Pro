import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

export const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // تحديد الصفحة النشطة من الرابط
  const getActivePage = () => {
    const path = location.pathname;
    
    if (path.startsWith('/teams')) return 'teams';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/users') return 'users';
    if (path === '/clients') return 'clients';
    // Make Clients active for client details page
    if (/^\/clients\/[\w-]+$/.test(path)) return 'clients';
    if (path === '/deals') return 'deals';
    if (path === '/tasks') return 'tasks';
    if (path === '/profile') return 'profile';
    if (path === '/settings') return 'settings';
    // Make Users active for sales rep details page
    if (/^\/sales-reps\/[\w-]+$/.test(path)) return 'users';
    // Make Users active for sales manager details page
    if (/^\/sales-managers\/[\w-]+$/.test(path)) return 'users';
    // Default to dashboard for root path
    if (path === '/') return 'dashboard';
    return 'dashboard';
  };

  const handlePageChange = (page: string) => {
    navigate(`/${page}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex">
        <Sidebar
          activePage={getActivePage()}
          onPageChange={handlePageChange}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavbar 
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}; 