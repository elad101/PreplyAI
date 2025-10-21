import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { MeetingDetail } from './components/MeetingDetail';
import { Settings } from './components/Settings';

type Screen = 'login' | 'dashboard' | 'meeting' | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('login');
  };

  const handleSelectMeeting = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setCurrentScreen('meeting');
  };

  const handleGoToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const handleGoToSettings = () => {
    setCurrentScreen('settings');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      
      case 'dashboard':
        return (
          <Dashboard 
            onSelectMeeting={handleSelectMeeting}
            onSettings={handleGoToSettings}
            onLogout={handleLogout}
          />
        );
      
      case 'meeting':
        return (
          <MeetingDetail 
            meetingId={selectedMeetingId}
            onBack={handleGoToDashboard}
          />
        );
      
      case 'settings':
        return (
          <Settings 
            onBack={handleGoToDashboard}
            onLogout={handleLogout}
          />
        );
      
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="size-full min-h-screen">
      {renderCurrentScreen()}
    </div>
  );
}