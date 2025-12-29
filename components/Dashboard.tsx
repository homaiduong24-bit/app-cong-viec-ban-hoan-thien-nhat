
import React, { useMemo } from 'react';
// Fix: Import ChannelConfig instead of CHANNELS
import { Task, ChannelType, ChannelConfig } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Clock, Zap } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  // Fix: Add channels prop to the interface
  channels: Record<string, ChannelConfig>;
  onAutoAllocate: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, channels, onAutoAllocate }) => {
  // Simple analytics logic
  const stats = useMemo(() => {
    let totalMinutes = 0;
    let completedMinutes = 0;
    
    // Fix: Initialize channelData dynamically based on channels prop
    const channelData: Record<string, number> = {};
    Object.keys(channels).forEach(ch => {
      channelData[ch] = 0;
    });

    tasks.forEach(t => {
      totalMinutes += t.duration;
      if (t.isCompleted) completedMinutes += t.duration;
      if (channelData[t.channel] !== undefined) {
        channelData[t.channel] += t.duration;
      }
    });

    const completionRate = totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0;
    
    return {
      totalHours: Math.round(totalMinutes / 60),
      completedHours: Math.round(completedMinutes / 60),
      completionRate,
      channelDist: Object.entries(channelData).map(([name, value]) => ({
        name,
        value,
        // Fix: Use channels prop for colors
        color: channels[name]?.color?.split(' ')[0]?.replace('text-', 'bg-') || 'bg-gray-400'
      }))
    };
    // Fix: Add channels to useMemo dependencies
  }, [tasks, channels]);

  // Fix: Define COLORS dynamically based on channels prop for the chart
  const CHART_COLORS = useMemo(() => {
    const map: Record<string, string> = {
      'Gia dụng': '#3b82f6',
      'Đạo lý': '#9333ea',
      'Sức khỏe': '#f97316'
    };
    // If dynamic channels are present, we could generate colors or use a fallback
    Object.keys(channels).forEach(ch => {
      if (!map[ch]) map[ch] = '#6366f1'; // Default Indigo for others
    });
    return map;
  }, [channels]);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Cards */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tổng giờ làm việc</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalHours} giờ</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Đã hoàn thành</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completionRate}%</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Streak (Chuỗi)</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">5 Ngày 🔥</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Phân bổ thời gian theo kênh</h3>
          
          {/* Wrapper div with explicit height to fix Recharts responsive issue */}
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.channelDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.channelDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.name] || '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4 text-sm mt-4">
            {stats.channelDist.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[c.name] || '#6366f1' }}></div>
                <span className="text-gray-600 dark:text-gray-300">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestion Box */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Trợ lý AI Planning 🤖</h3>
            <p className="text-indigo-100 mb-4">
              Bạn chưa có kế hoạch cho Thứ 4 tuần này? Hãy để AI tự động sắp xếp lịch quay video review và live stream dựa trên khung giờ vàng 09:00 - 20:00 (T2-T7).
            </p>
          </div>
          <button 
            onClick={onAutoAllocate}
            className="self-start px-6 py-3 bg-white text-indigo-700 font-bold rounded-xl shadow-md hover:bg-gray-50 transition-all"
          >
            Thử Auto-allocate ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
