
import React, { useMemo } from 'react';
// Fix: Import ChannelConfig instead of CHANNELS
import { Task, ChannelConfig } from '../types';
import { CheckSquare, Square, Clock, AlertCircle, CalendarDays, ArrowRight, FileText } from 'lucide-react';

interface NotesViewProps {
  tasks: Task[];
  // Fix: Add channels prop to the interface
  channels: Record<string, ChannelConfig>;
  onToggleComplete: (task: Task) => void;
  onTaskClick: (task: Task) => void;
}

const NotesView: React.FC<NotesViewProps> = ({ tasks, channels, onToggleComplete, onTaskClick }) => {
  const groupedTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    const overdue: Task[] = [];
    const todayTasks: Task[] = [];
    const upcoming: Task[] = [];
    const completed: Task[] = [];

    tasks.forEach(task => {
      if (task.isCompleted) {
        completed.push(task);
        return;
      }

      if (task.date < today) {
        overdue.push(task);
      } else if (task.date === today) {
        todayTasks.push(task);
      } else {
        upcoming.push(task);
      }
    });

    // Sort by Date then Time
    const sortFn = (a: Task, b: Task) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
    };

    return {
      overdue: overdue.sort(sortFn),
      today: todayTasks.sort(sortFn),
      upcoming: upcoming.sort(sortFn),
      completed: completed.sort(sortFn).reverse() // Show recently completed first
    };
  }, [tasks]);

  const renderTaskGroup = (title: string, groupTasks: Task[], icon: React.ReactNode, type: 'danger' | 'primary' | 'neutral' | 'muted') => {
    if (groupTasks.length === 0 && type !== 'primary') return null;

    const headerColors = {
        danger: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
        primary: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
        neutral: 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800',
        muted: 'text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50'
    };

    return (
      <div className="mb-8">
        <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${headerColors[type]}`}>
          {icon}
          <h3 className="font-bold text-lg">{title}</h3>
          <span className="ml-auto text-sm font-medium px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20">
            {groupTasks.length}
          </span>
        </div>
        
        {groupTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 italic">
                Không có công việc nào trong danh sách này.
            </div>
        ) : (
            <div className="space-y-3">
            {groupTasks.map(task => {
                // Fix: Use channels prop instead of constant
                const channelStyle = channels[task.channel] || { color: 'text-gray-700', bg: 'bg-gray-100', darkBg: 'dark:bg-gray-800/50' };
                return (
                <div 
                    key={task.id}
                    className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-md
                        ${task.isCompleted 
                            ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 opacity-70' 
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }
                    `}
                >
                    <button 
                        onClick={() => onToggleComplete(task)}
                        className={`mt-1 flex-shrink-0 transition-colors ${task.isCompleted ? 'text-green-500' : 'text-gray-400 hover:text-blue-500'}`}
                    >
                        {task.isCompleted ? <CheckSquare size={24} /> : <Square size={24} />}
                    </button>

                    <div className="flex-1 cursor-pointer" onClick={() => onTaskClick(task)}>
                        <div className="flex items-start justify-between">
                            <h4 className={`font-semibold text-base mb-1 ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
                                {task.title}
                            </h4>
                            <span className={`text-xs px-2 py-1 rounded-md font-medium ${channelStyle.bg} ${channelStyle.color} ${channelStyle.darkBg}`}>
                                {task.channel}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                             <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>{task.startTime} ({task.duration}p)</span>
                             </div>
                             {task.date !== new Date().toISOString().split('T')[0] && (
                                <div className="flex items-center gap-1">
                                    <CalendarDays size={14} />
                                    <span>{task.date.split('-').reverse().join('/')}</span>
                                </div>
                             )}
                             {task.priority === 'High' && (
                                <span className="text-red-500 flex items-center gap-1 font-medium">
                                    <AlertCircle size={14} />
                                    Ưu tiên cao
                                </span>
                             )}
                        </div>
                        
                        {task.notes && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-600 dark:text-gray-300 flex gap-2">
                                <FileText size={14} className="mt-0.5 flex-shrink-0" />
                                <p className="line-clamp-2">{task.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
                );
            })}
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-white/50 dark:bg-gray-900/50">
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sổ tay công việc 📝</h2>
            <p className="text-gray-500 dark:text-gray-400">Tổng hợp toàn bộ nhiệm vụ của bạn, được sắp xếp theo thứ tự ưu tiên cần xử lý.</p>
        </div>

        {groupedTasks.overdue.length > 0 && 
            renderTaskGroup('Quá hạn - Cần xử lý ngay', groupedTasks.overdue, <AlertCircle className="text-red-600" />, 'danger')
        }

        {renderTaskGroup('Hôm nay', groupedTasks.today, <Clock className="text-blue-600" />, 'primary')}

        {renderTaskGroup('Sắp tới', groupedTasks.upcoming, <CalendarDays className="text-gray-600" />, 'neutral')}

        {groupedTasks.completed.length > 0 && 
            renderTaskGroup('Đã hoàn thành', groupedTasks.completed, <CheckSquare className="text-gray-500" />, 'muted')
        }
      </div>
    </div>
  );
};

export default NotesView;
