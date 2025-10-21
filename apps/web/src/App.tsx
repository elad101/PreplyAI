import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { AuthGate } from '@/components/AuthGate';
import { LoginPage } from '@/pages/LoginPage';
import { Dashboard } from '@/pages/Dashboard';
import { MeetingDetail } from '@/pages/MeetingDetail';
import { Settings } from '@/pages/Settings';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <AuthGate>
                <Dashboard />
              </AuthGate>
            }
          />
          <Route
            path="/m/:id"
            element={
              <AuthGate>
                <MeetingDetail />
              </AuthGate>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGate>
                <Settings />
              </AuthGate>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-center" />
      </AuthProvider>
    </BrowserRouter>
  );
}

