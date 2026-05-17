'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppData, Task, TodayPlan, ContentIdea, WritingItem, EndOfDayReview, Settings } from '@/lib/types';
import { loadData, saveData, defaultData } from '@/lib/storage';

export function useStore() {
  const [data, setData] = useState<AppData>(defaultData);

  useEffect(() => {
    setData(loadData());
  }, []);

  const update = useCallback((updater: (prev: AppData) => AppData) => {
    setData(prev => {
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }, []);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    update(prev => ({
      ...prev,
      tasks: [...prev.tasks, { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() }],
    }));
  }, [update]);

  const updateTask = useCallback((id: string, changes: Partial<Task>) => {
    update(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...changes } : t),
    }));
  }, [update]);

  const deleteTask = useCallback((id: string) => {
    update(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  }, [update]);

  const saveTodayPlan = useCallback((plan: TodayPlan) => {
    update(prev => ({ ...prev, todayPlan: plan }));
  }, [update]);

  const addContentIdea = useCallback((idea: Omit<ContentIdea, 'id' | 'createdAt'>) => {
    update(prev => ({
      ...prev,
      contentIdeas: [...prev.contentIdeas, { ...idea, id: crypto.randomUUID(), createdAt: new Date().toISOString() }],
    }));
  }, [update]);

  const updateContentIdea = useCallback((id: string, changes: Partial<ContentIdea>) => {
    update(prev => ({
      ...prev,
      contentIdeas: prev.contentIdeas.map(c => c.id === id ? { ...c, ...changes } : c),
    }));
  }, [update]);

  const deleteContentIdea = useCallback((id: string) => {
    update(prev => ({ ...prev, contentIdeas: prev.contentIdeas.filter(c => c.id !== id) }));
  }, [update]);

  const addWritingItem = useCallback((item: Omit<WritingItem, 'id' | 'createdAt'>) => {
    update(prev => ({
      ...prev,
      writingQueue: [...prev.writingQueue, { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() }],
    }));
  }, [update]);

  const updateWritingItem = useCallback((id: string, changes: Partial<WritingItem>) => {
    update(prev => ({
      ...prev,
      writingQueue: prev.writingQueue.map(w => w.id === id ? { ...w, ...changes } : w),
    }));
  }, [update]);

  const deleteWritingItem = useCallback((id: string) => {
    update(prev => ({ ...prev, writingQueue: prev.writingQueue.filter(w => w.id !== id) }));
  }, [update]);

  const saveEndOfDay = useCallback((review: EndOfDayReview) => {
    update(prev => ({
      ...prev,
      endOfDayReviews: [...prev.endOfDayReviews.filter(r => r.date !== review.date), review],
    }));
  }, [update]);

  const saveSettings = useCallback((settings: Settings) => {
    update(prev => ({ ...prev, settings }));
  }, [update]);

  const saveDailyNote = useCallback((date: string, content: string) => {
    update(prev => ({ ...prev, dailyNotes: { ...prev.dailyNotes, [date]: content } }));
  }, [update]);

  const saveMainFocus = useCallback((date: string, focus: string) => {
    update(prev => ({ ...prev, mainFocus: { ...prev.mainFocus, [date]: focus } }));
  }, [update]);

  return {
    data,
    addTask,
    updateTask,
    deleteTask,
    saveTodayPlan,
    addContentIdea,
    updateContentIdea,
    deleteContentIdea,
    addWritingItem,
    updateWritingItem,
    deleteWritingItem,
    saveEndOfDay,
    saveSettings,
    saveDailyNote,
    saveMainFocus,
  };
}

export type StoreType = ReturnType<typeof useStore>;
