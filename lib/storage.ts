import { AppData } from './types';

const STORAGE_KEY = 'kafi-data';

export const defaultData: AppData = {
  tasks: [],
  todayPlan: null,
  contentIdeas: [],
  writingQueue: [],
  endOfDayReviews: [],
  settings: {
    userName: '',
    dayStartTime: '09:00',
    dayEndTime: '18:00',
    defaultBlockDuration: 90,
  },
  dailyNotes: {},
  mainFocus: {},
};

export function loadData(): AppData {
  if (typeof window === 'undefined') return defaultData;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultData;
    return { ...defaultData, ...JSON.parse(stored) };
  } catch {
    return defaultData;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
