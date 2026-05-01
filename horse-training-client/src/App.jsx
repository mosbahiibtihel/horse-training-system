import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './components/PrivateRoute';
import HorsesPage from './pages/HorsesPage';
import TrainingSessionsPage from './pages/TrainingSessionsPage';
import CompetitionsPage from './pages/CompetitionsPage';
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={
            <PrivateRoute><DashboardPage /></PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
          <Route path="/horses" element={
  <PrivateRoute><HorsesPage /></PrivateRoute>}/>
  
  <Route path="/sessions" element={
  <PrivateRoute><TrainingSessionsPage /></PrivateRoute>
} />
<Route path="/competitions" element={
  <PrivateRoute><CompetitionsPage /></PrivateRoute>
} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}