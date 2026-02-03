import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import TaskBoard from './pages/TaskBoard';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user && !localStorage.getItem('access_token')) return <Navigate to="/login" />;

  return <>{children}</>;
};

function App() {
  return (
    <RouterContent />
  );
}

import { ThemeProvider } from './context/ThemeContext';

const RouterContent = () => (
  <AuthProvider>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<TaskBoard />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </AuthProvider>
);

export default App;
