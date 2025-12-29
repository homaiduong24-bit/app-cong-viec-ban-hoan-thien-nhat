
import React, { useMemo } from 'react';
import { Task, ChannelConfig } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { TrendingUp, Target, CheckCircle, AlertTriangle } from 'lucide-react';

interface ReportsViewProps {
  tasks: Task[];
  channels: Record<string, ChannelConfig>;
}

const ReportsView: React.FC<ReportsViewProps> = ({ tasks, channels }) => {
  const analyticsData = useMemo(() => {
    const channelStats: Record<string, { actual: number, completed: number, target: number }> = {};
    
    // Khởi tạo data từ cấu hình channels
    Object.keys(channels).forEach(name => {
      channelStats[name] = { actual: 0, completed: 0, target: channels[name].target };
    });

    // Tính toán số lượng task thực tế
    tasks.forEach(t => {
      if (channelStats[t.channel]) {
        channelStats[t.channel].actual += 1;
        if (t.isCompleted) channelStats[t.channel].completed += 1;
      }
    });

    const chartData = Object.entries(channelStats).map(([name, stats]) => ({
      name,
      'Thực tế': stats.actual,
      'Mục tiêu': stats.target,
      'Hoàn thành': stats.completed,
      progress: stats.target > 0 ? Math.round((stats.completed / stats.target) * 100) : 0
    }));

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.isCompleted).length;
    const avgCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return { chartData, totalTasks, completedTasks, avgCompletion };
  }, [tasks, channels]);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8 bg-gray-50 dark:bg-gray-900/50">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white">Báo cáo hiệu suất 📊</h2>
          <p className="text-gray-500 dark:text-gray-400">Phân tích tiến độ nội dung so với mục tiêu đề ra.</p>
        </div>
        <div className="flex gap-2">
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <span className="text-xs font-bold text-gray-400 uppercase block">Tỉ lệ hoàn thành</span>
                <span className="text-xl font-black text-blue-600">{analyticsData.avgCompletion}%</span>
            </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp size={24} />
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest">Tổng Task</h3>
            <p className="text-3xl font-black mt-1">{analyticsData.totalTasks}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle size={24} />
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest">Đã xong</h3>
            <p className="text-3xl font-black mt-1 text-green-600">{analyticsData.completedTasks}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <Target size={24} />
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest">Cần làm thêm</h3>
            <p className="text-3xl font-black mt-1 text-purple-600">{analyticsData.totalTasks - analyticsData.completedTasks}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-xl font-black mb-8 flex items-center gap-2">
            <Target className="text-blue-600" /> Thực tế vs Mục tiêu (Số lượng video/task)
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Mục tiêu" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="Thực tế" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="Hoàn thành" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-black text-lg">Chi tiết tiến độ từng kênh</h3>
        </div>
        <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <tr>
                    <th className="px-6 py-4">Nhóm chính</th>
                    <th className="px-6 py-4">Mục tiêu</th>
                    <th className="px-6 py-4">Đã xong</th>
                    <th className="px-6 py-4">Tiến độ</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {analyticsData.chartData.map((row) => (
                    <tr key={row.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">{row.name}</td>
                        <td className="px-6 py-4 font-medium">{row['Mục tiêu']}</td>
                        <td className="px-6 py-4 font-medium">{row['Hoàn thành']}</td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${row.progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                        style={{ width: `${Math.min(row.progress, 100)}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs font-black min-w-[40px]">{row.progress}%</span>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsView;
