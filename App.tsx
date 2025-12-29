
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CalendarView from './components/CalendarView';
import Dashboard from './components/Dashboard';
import TaskModal from './components/TaskModal';
import NotionSettings from './components/NotionSettings';
import NotesView from './components/NotesView';
import InventoryView from './components/InventoryView';
import ReportsView from './components/ReportsView';
import AIPlannerModal from './components/AIPlannerModal';
import { Task, ViewMode, Product, CategoryMap, getVietnamDateString, ChannelType, ChannelConfig, DEFAULT_CHANNEL_STYLES } from './types';
import { generateScheduleSuggestions } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('calendar');
  const [isDark, setIsDark] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [channels, setChannels] = useState<Record<string, ChannelConfig>>({});
  const [categories, setCategories] = useState<CategoryMap>({});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
    const savedTasks = localStorage.getItem('creatorflow_tasks');
    setTasks(savedTasks ? JSON.parse(savedTasks) : []);
    const savedProducts = localStorage.getItem('creatorflow_products');
    setProducts(savedProducts ? JSON.parse(savedProducts) : []);
    const savedChannels = localStorage.getItem('creatorflow_channels');
    if (savedChannels) {
      setChannels(JSON.parse(savedChannels));
    } else {
      const initialChannels: Record<string, ChannelConfig> = {
        'Gia dụng': { name: 'Gia dụng', ...DEFAULT_CHANNEL_STYLES[0], target: 50 },
        'Đạo lý': { name: 'Đạo lý', ...DEFAULT_CHANNEL_STYLES[1], target: 30 },
        'Sức khỏe': { name: 'Sức khỏe', ...DEFAULT_CHANNEL_STYLES[2], target: 20 },
      };
      setChannels(initialChannels);
    }
    const savedCategories = localStorage.getItem('creatorflow_categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories({
        'Gia dụng': ['Đồ nhà bếp', 'Thiết thiết bị điện', 'Dụng cụ', 'Đồ dọn dẹp'],
        'Đạo lý': ['Review sách', 'Câu chuyện đạo lý'],
        'Sức khỏe': ['Dinh dưỡng', 'Thực phẩm chức năng']
      });
    }
  }, []);

  useEffect(() => { localStorage.setItem('creatorflow_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('creatorflow_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('creatorflow_channels', JSON.stringify(channels)); }, [channels]);
  useEffect(() => { localStorage.setItem('creatorflow_categories', JSON.stringify(categories)); }, [categories]);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark');
    localStorage.theme = newDark ? 'dark' : 'light';
  };

  // AI Planner Logic
  const handleAIGenerate = async (focus: string, shift: string, date: string) => {
    setIsGenerating(true);
    try {
      const newTasks = await generateScheduleSuggestions(date, tasks, products, focus, shift);
      if (newTasks.length > 0) {
        setTasks(prev => [...prev, ...newTasks]);
        setIsAIModalOpen(false);
        setCurrentView('calendar');
        setCurrentDate(new Date(date));
      } else {
        alert("AI không thể tạo lịch. Vui lòng kiểm tra lại kho sản phẩm hoặc thử lại sau.");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi gọi AI Planner.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddMainCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || channels[trimmed]) return;
    const styleIdx = Object.keys(channels).length % DEFAULT_CHANNEL_STYLES.length;
    setChannels(prev => ({
      ...prev,
      [trimmed]: { name: trimmed, ...DEFAULT_CHANNEL_STYLES[styleIdx], target: 10 }
    }));
    setCategories(prev => ({ ...prev, [trimmed]: [] }));
  };

  const handleRenameMainCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || oldName === trimmed || channels[trimmed]) return;
    const config = { ...channels[oldName], name: trimmed };
    const newChannels = { ...channels };
    delete newChannels[oldName];
    newChannels[trimmed] = config;
    setChannels(newChannels);
    setCategories(prev => {
        const newCats = { ...prev };
        newCats[trimmed] = newCats[oldName] || [];
        delete newCats[oldName];
        return newCats;
    });
    setProducts(prev => prev.map(p => p.channel === oldName ? { ...p, channel: trimmed } : p));
    setTasks(prev => prev.map(t => t.channel === oldName ? { ...t, channel: trimmed } : t));
  };

  const handleDeleteMainCategory = (name: string) => {
      if (Object.keys(channels).length <= 1) return;
      if (!window.confirm(`Xóa nhóm "${name}"?`)) return;
      const newChannels = { ...channels };
      delete newChannels[name];
      setChannels(newChannels);
      setCategories(prev => {
          const next = { ...prev };
          delete next[name];
          return next;
      });
  };

  const handleTaskSave = (task: Task) => {
    setTasks(prev => {
        const exists = prev.some(t => t.id === task.id);
        return exists ? prev.map(t => t.id === task.id ? task : t) : [...prev, task];
    });
    if (task.productId) {
        setProducts(prev => prev.map(p => p.id === task.productId ? { ...p, lastScheduledAt: new Date().toISOString() } : p));
    }
  };

  const handleTaskDelete = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  const handleTaskClick = (task: Task) => { 
    setEditingTask(task); 
    setPendingProduct(null); 
    setIsModalOpen(true); 
  };
  
  const handleSlotClick = (date: string, time: string, product?: Product) => { 
    setSelectedDate(date); 
    setSelectedTime(time); 
    setEditingTask(null); 
    setPendingProduct(product || null); 
    setIsModalOpen(true); 
  };

  const toggleTaskComplete = (task: Task) => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t));

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar currentView={currentView} setView={setCurrentView} toggleTheme={toggleTheme} isDark={isDark} onQuickAdd={() => handleSlotClick(getVietnamDateString(), '09:00')} />
      <main className="flex-1 overflow-hidden">
        {currentView === 'calendar' && <CalendarView tasks={tasks} channels={channels} onTaskClick={handleTaskClick} onSlotClick={handleSlotClick} onToggleComplete={toggleTaskComplete} onAutoAllocate={() => setIsAIModalOpen(true)} currentDate={currentDate} setCurrentDate={setCurrentDate} />}
        {currentView === 'dashboard' && <Dashboard tasks={tasks} channels={channels} onAutoAllocate={() => setIsAIModalOpen(true)} />}
        {currentView === 'inventory' && (
            <InventoryView 
                products={products} 
                categories={categories} 
                channels={channels}
                onAddProduct={(p) => setProducts([...products, p])}
                onUpdateProduct={(up) => setProducts(products.map(p => p.id === up.id ? up : p))}
                onDeleteProduct={(id) => setProducts(products.filter(p => p.id !== id))}
                onCopyToSchedule={(p) => handleSlotClick(getVietnamDateString(), '09:00', p)}
                onAddSubCategory={(ch, sub) => setCategories(prev => ({ ...prev, [ch]: [...(prev[ch] || []), sub] }))}
                onRenameSubCategory={(ch, old, next) => setCategories(prev => ({ ...prev, [ch]: prev[ch].map(s => s === old ? next : s) }))}
                onAddMainCategory={handleAddMainCategory}
                onRenameMainCategory={handleRenameMainCategory}
                onDeleteMainCategory={handleDeleteMainCategory}
            />
        )}
        {currentView === 'reports' && <ReportsView tasks={tasks} channels={channels} />}
        {currentView === 'notes' && <NotesView tasks={tasks} channels={channels} onToggleComplete={toggleTaskComplete} onTaskClick={handleTaskClick} />}
        {currentView === 'settings' && <NotionSettings />}
      </main>
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleTaskSave} 
        onDelete={handleTaskDelete} 
        channels={channels} 
        initialDate={selectedDate} 
        initialTime={selectedTime} 
        taskToEdit={editingTask} 
        prefillProduct={pendingProduct}
      />
      <AIPlannerModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        onGenerate={handleAIGenerate} 
        targetDate={getVietnamDateString()} 
        isGenerating={isGenerating} 
      />
    </div>
  );
};

export default App;
