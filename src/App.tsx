import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Deals } from './pages/Deals';
import { DealDetails } from './pages/DealDetails';
import { Tasks } from './pages/Tasks';
import { TaskDetails } from './pages/TaskDetails';
import { Users } from './pages/Users';
import { Teams } from './pages/Teams';
import { TeamDetails } from './pages/TeamDetails';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { SalesRepDetails } from './pages/SalesRepDetails';
import { ClientDetails } from './pages/ClientDetails';
import { SalesManagerDetails } from './pages/SalesManagerDetails';
import { OrganizationChart } from './pages/OrganizationChart';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="teams" element={<Teams />} />
                <Route path="teams/:teamId" element={<TeamDetails />} />
                <Route path="clients" element={<Clients />} />
                <Route path="deals" element={<Deals />} />
                <Route path="deals/:dealId" element={<DealDetails />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="tasks/:taskId" element={<TaskDetails />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="sales-reps/:repId" element={<SalesRepDetails />} />
                <Route path="clients/:clientId" element={<ClientDetails />} />
                <Route path="sales-managers/:managerId" element={<SalesManagerDetails />} />
                <Route path="organization-chart" element={<OrganizationChart />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;