
export type ChannelType = string;

export interface ChannelConfig {
  name: string;
  color: string;
  bg: string;
  darkBg: string;
  target: number;
}

export interface Task {
  id: string;
  title: string;
  channel: ChannelType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  duration: number; // minutes
  isCompleted: boolean;
  priority: 'High' | 'Medium' | 'Low';
  notes?: string;
  notionSynced?: boolean;
  productId?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  channel: ChannelType;
  subCategory?: string;
  image?: string;
  tags: string[];
  createdAt: string;
  lastScheduledAt?: string;
}

export type CategoryMap = Record<string, string[]>;

export type ViewMode = 'dashboard' | 'calendar' | 'reports' | 'settings' | 'notes' | 'inventory';

// Cấu hình màu mặc định cho các nhóm mới
export const DEFAULT_CHANNEL_STYLES = [
  { color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100', darkBg: 'dark:bg-blue-900/50' },
  { color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100', darkBg: 'dark:bg-purple-900/50' },
  { color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100', darkBg: 'dark:bg-orange-900/50' },
  { color: 'text-green-700 dark:text-green-300', bg: 'bg-green-100', darkBg: 'dark:bg-green-900/50' },
  { color: 'text-pink-700 dark:text-pink-300', bg: 'bg-pink-100', darkBg: 'dark:bg-pink-900/50' },
  { color: 'text-cyan-700 dark:text-cyan-300', bg: 'bg-cyan-100', darkBg: 'dark:bg-cyan-900/50' },
];

export const getVietnamDateString = (dateInput?: Date | string): string => {
  const date = dateInput ? new Date(dateInput) : new Date();
  return date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
};

export const getVietnamTimeString = (dateInput?: Date | string): string => {
  const date = dateInput ? new Date(dateInput) : new Date();
  return date.toLocaleTimeString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' });
};
