
import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar as CalendarIcon, AlertCircle, Trash2, Package } from 'lucide-react';
import { Task, ChannelType, ChannelConfig, Product } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  channels: Record<string, ChannelConfig>;
  initialDate?: string;
  initialTime?: string;
  taskToEdit?: Task | null;
  prefillProduct?: Product | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  channels, 
  initialDate, 
  initialTime, 
  taskToEdit,
  prefillProduct
}) => {
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState<ChannelType>('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(60);
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [notes, setNotes] = useState('');
  const [productId, setProductId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setChannel(taskToEdit.channel);
        setDate(taskToEdit.date);
        setStartTime(taskToEdit.startTime);
        setDuration(taskToEdit.duration);
        setPriority(taskToEdit.priority);
        setNotes(taskToEdit.notes || '');
        setProductId(taskToEdit.productId);
      } else if (prefillProduct) {
        // TỰ ĐỘNG ĐIỀN TỪ KHO SẢN PHẨM
        setTitle(`Quay video: ${prefillProduct.name}`);
        setChannel(prefillProduct.channel);
        setDate(initialDate || new Date().toISOString().split('T')[0]);
        setStartTime(initialTime || '09:00');
        setDuration(60);
        setPriority('High');
        setNotes(prefillProduct.description || '');
        setProductId(prefillProduct.id);
      } else {
        setTitle('');
        setChannel(Object.keys(channels)[0] || '');
        setDate(initialDate || new Date().toISOString().split('T')[0]);
        setStartTime(initialTime || '09:00');
        setDuration(60);
        setPriority('Medium');
        setNotes('');
        setProductId(undefined);
      }
    }
  }, [isOpen, taskToEdit, prefillProduct, channels, initialDate, initialTime]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-black text-gray-800 dark:text-white flex items-center gap-2">
            {prefillProduct ? <Package className="text-blue-600" size={20} /> : <CalendarIcon className="text-blue-600" size={20} />}
            {taskToEdit?.id ? 'Chỉnh sửa task' : (prefillProduct ? 'Lên lịch từ kho' : 'Thêm task mới')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} /></button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSave({ 
            id: taskToEdit?.id || crypto.randomUUID(), 
            title, 
            channel, 
            date, 
            startTime, 
            duration, 
            isCompleted: taskToEdit?.isCompleted || false, 
            priority, 
            notes,
            productId
          });
          onClose();
        }} className="p-6 space-y-5">
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tiêu đề công việc</label>
            <input type="text" placeholder="Nhập tên task..." value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none font-bold focus:border-blue-500" required />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nhóm chính</label>
            <div className="flex flex-wrap gap-2">
                {Object.keys(channels).map(ch => (
                    <button key={ch} type="button" onClick={() => setChannel(ch)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${channel === ch ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-gray-700 text-gray-500 border-gray-200 dark:border-gray-600 hover:border-blue-200'}`}>{ch}</button>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ngày làm</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 border rounded-2xl bg-gray-50 dark:bg-gray-800 text-sm font-bold" required />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Giờ bắt đầu</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-4 py-3 border rounded-2xl bg-gray-50 dark:bg-gray-800 text-sm font-bold" required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ghi chú & Kịch bản</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ý tưởng quay, kịch bản, vật dụng cần chuẩn bị..." className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm h-24 resize-none outline-none focus:border-blue-500" />
          </div>

          <div className="flex justify-between items-center pt-4">
              {taskToEdit?.id ? (
                  <button type="button" onClick={() => onDelete(taskToEdit.id)} className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm font-bold"><Trash2 size={16} /> Xóa</button>
              ) : <div></div>}
              <div className="flex gap-3">
                  <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all">Hủy</button>
                  <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">Lưu</button>
              </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
