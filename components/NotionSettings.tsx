import React, { useState } from 'react';
import { Database, Save, Check } from 'lucide-react';

const NotionSettings: React.FC = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('notion_key') || '');
  const [dbId, setDbId] = useState(localStorage.getItem('notion_db') || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('notion_key', apiKey);
    localStorage.setItem('notion_db', dbId);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
             <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tích hợp Notion</h2>
            <p className="text-gray-500 dark:text-gray-400">Đồng bộ 1 chiều: App &rarr; Notion Database</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-xl text-sm border border-yellow-100 dark:border-yellow-800/30">
            <strong>Lưu ý:</strong> Do hạn chế của trình duyệt, tính năng này hiện tại chỉ mô phỏng việc lưu cấu hình. Để hoạt động thực tế cần có Backend Server để xử lý OAuth và CORS.
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notion Integration Token</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="secret_..."
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Database ID</label>
            <div className="flex gap-2">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-500">
                    <Database size={20} />
                </div>
                <input
                type="text"
                value={dbId}
                onChange={(e) => setDbId(e.target.value)}
                placeholder="32 hex characters"
                className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-white mb-2">Field Mapping (Cố định)</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• <code>Name</code> (Title) &larr; Task Title</li>
                <li>• <code>Date</code> (Date) &larr; Date + Time</li>
                <li>• <code>Status</code> (Select) &larr; Pending / Done</li>
                <li>• <code>Channel</code> (Select) &larr; Gia dụng / Đạo lý / Sức khỏe</li>
            </ul>
          </div>

          <button
            onClick={handleSave}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'
            }`}
          >
            {saved ? <Check size={20} /> : <Save size={20} />}
            {saved ? 'Đã lưu cấu hình!' : 'Lưu kết nối'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotionSettings;
