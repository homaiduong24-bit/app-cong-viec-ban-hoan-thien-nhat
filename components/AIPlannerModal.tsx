
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Briefcase, Coffee, Sun, Moon, Calendar, Clock } from 'lucide-react';

interface AIPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (focus: string, shift: string, selectedDate: string) => void;
  targetDate: string;
  isGenerating: boolean;
}

const AIPlannerModal: React.FC<AIPlannerModalProps> = ({ 
  isOpen, 
  onClose, 
  onGenerate, 
  targetDate,
  isGenerating 
}) => {
  const [focus, setFocus] = useState('');
  const [shift, setShift] = useState('full'); 
  const [dateInput, setDateInput] = useState(targetDate);

  useEffect(() => {
    if (isOpen) {
      setDateInput(targetDate);
    }
  }, [isOpen, targetDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(focus, shift, dateInput);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header with Gradient */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-white/80 hover:text-white hover:rotate-90 transition-all"
            disabled={isGenerating}
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-xl shadow-inner">
              <Sparkles size={28} className="text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">AI Planner 24H</h2>
              <p className="text-blue-100 text-xs font-medium uppercase tracking-widest">Universal Intelligence</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Date Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">
              Ngày lập kế hoạch
            </label>
            <div className="relative group">
              <Calendar className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="date"
                required
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold transition-all"
              />
            </div>
          </div>

          {/* Focus Input */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">
              Ưu tiên của bạn hôm nay
            </label>
            <textarea
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="Ví dụ: Ưu tiên quay các sản phẩm Gia dụng tồn trên 10 ngày..."
              className="w-full px-4 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none resize-none h-24 text-sm font-medium transition-all"
              disabled={isGenerating}
            ></textarea>
          </div>

          {/* Shift Selection - UPDATED FOR 24H */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">
              Khung giờ làm việc
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'full', icon: Briefcase, label: 'Cả ngày', time: '00:00 - 23:59', color: 'blue' },
                { id: 'morning', icon: Coffee, label: 'Sáng', time: '05:00 - 12:00', color: 'amber' },
                { id: 'afternoon', icon: Sun, label: 'Chiều', time: '12:00 - 18:00', color: 'orange' },
                { id: 'evening', icon: Moon, label: 'Tối & Đêm', time: '18:00 - 02:00', color: 'indigo' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setShift(item.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group/btn ${
                    shift === item.id 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/10' 
                      : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon size={18} className={shift === item.id ? 'text-blue-600' : 'text-gray-400'} />
                    <span className={`text-sm font-black ${shift === item.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      {item.label}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500">{item.time}</div>
                  {shift === item.id && <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-bl-xl"><Clock size={12} /></div>}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="flex-1 py-4 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="flex-[2] py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 dark:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-70 active:scale-95"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang tối ưu...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Tự động Lập lịch</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIPlannerModal;
