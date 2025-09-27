import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  MessageSquare, 
  Calendar,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'all-leads', label: 'All Leads', icon: Users },
  { id: 'active-campaigns', label: 'Active Campaigns', icon: Target },
  { id: 'meetings', label: 'Booked', icon: Calendar },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  setActiveSection, 
  isCollapsed, 
  setIsCollapsed 
}) => {
  return (
    <div className="w-64 bg-[#0F0F14] border-r border-[#2a2a2a] h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#E11D48] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <h1 className="text-xl font-semibold text-white">Dream 100</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 ease-out group ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#E11D48] to-[#BE185D] text-white shadow-lg shadow-[#E11D48]/25' 
                      : 'text-[#9CA3AF] hover:bg-gradient-to-r hover:from-[#1a1a1a] hover:to-[#252525] hover:text-white hover:translate-x-1 hover:shadow-md hover:shadow-black/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 flex-shrink-0 transition-all duration-150 ${
                      isActive ? 'drop-shadow-sm' : 'group-hover:scale-110'
                    }`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;