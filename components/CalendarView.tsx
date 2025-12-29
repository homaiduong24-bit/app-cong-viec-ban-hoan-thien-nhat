
import { ChevronLeft, ChevronRight, Wand2, Check, ExternalLink, Clock } from 'lucide-react';
import React from 'react';
// Fix: Import ChannelConfig instead of CHANNELS
import { Task, ChannelType, ChannelConfig } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  // Fix: Add channels prop to the interface
  channels: Record<string, ChannelConfig>;
  onTaskClick: (task: Task) => void;
  onSlotClick: (date: string, time: string) => void;
  onToggleComplete: (task: Task) => void;
  onAutoAllocate: (date: string) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  isGenerating?: boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  // Fix: Destructure channels prop
  channels,
  onTaskClick,
  onSlotClick,
  onToggleComplete,
  onAutoAllocate,
  currentDate,
  setCurrentDate,
  isGenerating
}) => {
  const getDaysOfWeek = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getDaysOfWeek(currentDate);
  // CẬP NHẬT: 24 GIỜ (Từ 0 đến 23)
  const hours = Array.from({ length: 24 }, (_, i) => i); 

  const getTasksForCell = (day: Date, hour: number) => {
    const dateStr = day.toISOString().split('T')[0];
    return tasks.filter((t) => {
      if (t.date !== dateStr) return false;
      const [h] = t.startTime.split(':').map(Number);
      return h === hour;
    });
  };

  const calculateTopOffset = (startTime: string) => {
    const [_, m] = startTime.split(':').map(Number);
    return (m / 60) * 100;
  };

  const calculateHeight = (duration: number) => {
    return (duration / 60) * 100;
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header Controls */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button onClick={prevWeek} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-md shadow-sm transition-all">
              <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button onClick={nextWeek} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-md shadow-sm transition-all">
              <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
        
        <div className="flex gap-2">
            <button
                onClick={() => onAutoAllocate(weekDays[0].toISOString().split('T')[0])}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-md hover:opacity-90 transition-all disabled:opacity-50"
            >
                <Wand2 size={18} className={isGenerating ? "animate-spin" : ""} />
                {isGenerating ? "AI đang tính toán..." : "AI Lập lịch 24H"}
            </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto relative custom-scrollbar">
        <div className="min-w-[900px]">
            {/* Header Row: Days */}
            <div className="grid grid-cols-8 sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="p-3 text-center text-[10px] font-bold text-gray-400 border-r border-gray-100 dark:border-gray-700 uppercase tracking-tighter">
                   24H VIEW
                </div>
                {weekDays.map((day, idx) => {
                    const isToday = new Date().toDateString() === day.toDateString();
                    return (
                        <div key={idx} className={`p-3 text-center border-r border-gray-100 dark:border-gray-700 ${isToday ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day.getDay()]}
                            </div>
                            <div className={`text-base font-bold mt-1 w-7 h-7 flex items-center justify-center mx-auto rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                                {day.getDate()}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Time Grid */}
            <div className="relative">
                {hours.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 h-20 group">
                        {/* Time Label */}
                        <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 text-right pr-3 pt-2 border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky left-0 z-10 flex flex-col items-end">
                            <span>{hour.toString().padStart(2, '0')}:00</span>
                            {hour === 0 && <span className="text-[9px] text-blue-500">NEW DAY</span>}
                        </div>

                        {/* Day Cells */}
                        {weekDays.map((day, dayIdx) => {
                             const dayTasks = getTasksForCell(day, hour);
                             const dateStr = day.toISOString().split('T')[0];
                             const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                             
                             // Visual work zone hint: 09:00 - 20:00 (Can be adjusted)
                             const isPrimeTime = hour >= 9 && hour < 21;

                             return (
                                <div 
                                    key={dayIdx} 
                                    className={`border-r border-b border-gray-100 dark:border-gray-700/50 relative transition-colors cursor-pointer
                                        ${isPrimeTime 
                                            ? 'bg-amber-50/20 dark:bg-amber-900/5' 
                                            : 'bg-slate-50/40 dark:bg-slate-900/20'
                                        }
                                        hover:bg-white dark:hover:bg-gray-700/30
                                    `}
                                    onClick={() => onSlotClick(dateStr, timeStr)}
                                >
                                    {dayTasks.map(task => {
                                        // Fix: Use channels prop instead of constant
                                        const channelStyle = channels[task.channel] || { color: 'text-gray-700', bg: 'bg-gray-100', darkBg: 'dark:bg-gray-800/50' };
                                        return (
                                            <div
                                                key={task.id}
                                                onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
                                                className={`absolute left-1 right-1 rounded-xl p-2.5 text-xs border-l-4 shadow-sm cursor-pointer hover:shadow-md transition-all z-10 overflow-hidden ${
                                                    task.isCompleted ? 'opacity-50 grayscale scale-95' : 'hover:scale-[1.02]'
                                                } ${channelStyle.bg} ${channelStyle.darkBg} ${channelStyle.color} border-current`}
                                                style={{
                                                    top: `${calculateTopOffset(task.startTime)}%`,
                                                    height: `calc(${calculateHeight(task.duration)}% - 4px)`,
                                                }}
                                            >
                                                <div className="flex items-start justify-between gap-1">
                                                    <span className="font-bold truncate leading-tight">{task.title}</span>
                                                    {task.notionSynced && <ExternalLink size={10} className="opacity-70 flex-shrink-0" />}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1 opacity-80 text-[10px] font-medium">
                                                    <Clock size={10} />
                                                    <span>{task.startTime} ({task.duration}p)</span>
                                                </div>
                                                
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onToggleComplete(task); }}
                                                    className={`absolute bottom-2 right-2 p-1 rounded-full transition-all ${task.isCompleted ? 'bg-green-500 text-white' : 'bg-black/5 hover:bg-black/10 text-gray-600 dark:text-gray-400'}`}
                                                >
                                                    <Check size={12} strokeWidth={3} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
