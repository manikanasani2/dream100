import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AllLeads from './components/AllLeads';
import ActiveCampaigns from './components/ActiveCampaigns';
import BookedMeetings from './components/BookedMeetings';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'all-leads':
        return <AllLeads />;
      case 'active-campaigns':
        return <ActiveCampaigns />;
      case 'meetings':
        return <BookedMeetings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {renderActiveSection()}
      </main>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#1a1a1a', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.1)' },
        }}
      />
    </div>
  );
}

export default App;