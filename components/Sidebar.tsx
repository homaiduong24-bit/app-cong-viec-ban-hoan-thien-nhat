import React from 'react';
import { LayoutDashboard, Calendar, BarChart3, Settings, Plus, Moon, Sun, NotebookPen, Package } from 'lucide-react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
  onQuickAdd: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, toggleTheme, isDark, onQuickAdd }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
    { id: 'calendar', icon: Calendar, label: 'Lịch tuần' },
    { id: 'inventory', icon: Package, label: 'Kho sản phẩm' },
    { id: 'notes', icon: NotebookPen, label: 'Sổ tay' },
    { id: 'reports', icon: BarChart3, label: 'Báo cáo' },
    { id: 'settings', icon: Settings, label: 'Cài đặt & Notion' },
  ];

  return (
    <div className="w-20 lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full transition-all duration-300">
      <div className="p-4 flex items-center justify-center lg:justify-start gap-3 h-16 border-b border-gray-100 dark:border-gray-700">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
          C
        </div>
        <span className="hidden lg:block font-bold text-xl text-gray-800 dark:text-white">CreatorFlow</span>
      </div>

      <div className="flex-1 py-6 flex flex-col gap-2 px-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewMode)}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              currentView === item.id
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <item.icon size={22} strokeWidth={currentView === item.id ? 2.5 : 2} />
            <span className="hidden lg:block">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-4">
        <button
          onClick={onQuickAdd}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none transition-all"
        >
          <Plus size={20} />
          <span className="hidden lg:block font-medium">Tạo Task</span>
        </button>

        <button
          onClick={toggleTheme}
          className="flex items-center justify-center gap-2 p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          <span className="hidden lg:block text-sm">Giao diện {isDark ? 'Sáng' : 'Tối'}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;