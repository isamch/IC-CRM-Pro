import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Deals } from './pages/Deals';
import { Tasks } from './pages/Tasks';
import { Users } from './pages/Users';
import { Teams } from './pages/Teams';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { TeamManagement } from './pages/TeamManagement';

const pageComponents = {
  dashboard: Dashboard,
  clients: Clients,
  deals: Deals,
  tasks: Tasks,
  users: Users,
  teams: Teams,
  team: TeamManagement,
  profile: Profile,
  settings: Settings,
};

const pageTitles = {
  dashboard: 'لوحة التحكم',
  clients: 'العملاء',
  deals: 'العقود',
  tasks: 'المهام',
  users: 'المستخدمين',
  teams: 'الفرق',
  team: 'إدارة الفريق',
  profile: 'الملف الشخصي',
  settings: 'الإعدادات',
};

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const PageComponent = pageComponents[activePage as keyof typeof pageComponents];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex">
        <Sidebar
          activePage={activePage}
          onPageChange={setActivePage}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavbar 
            pageTitle={pageTitles[activePage as keyof typeof pageTitles]} 
            onPageChange={setActivePage}
          />
          
          <main className="flex-1 overflow-y-auto">
            <PageComponent />
          </main>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;