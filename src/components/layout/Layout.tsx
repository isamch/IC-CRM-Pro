import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

export const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const handlePageChange = (page: string) => {
    navigate(`/${page}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex">
      {/* Sidebar ثابت */}
      <div className="fixed top-0 left-0 h-screen z-40">
        <Sidebar
          onPageChange={handlePageChange}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      {/* Main content with fixed header */}
      <div className="flex-1 flex flex-col min-h-screen ml-16 md:ml-64" style={{ marginLeft: sidebarCollapsed ? 64 : 256 }}>
        <div
          className="fixed top-0 right-0 z-30 transition-all duration-300"
          style={{ left: sidebarCollapsed ? 64 : 256 }}
        >
          <TopNavbar 
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
        <main className="flex-1 overflow-y-auto pt-20" style={{ minHeight: '100vh' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}; 