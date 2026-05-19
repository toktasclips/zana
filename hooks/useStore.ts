'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppData, Task, TodayPlan, ContentIdea, WritingItem, EndOfDayReview, Settings } from '@/lib/types';
import { loadData, defaultData } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

export function useStore() {
  const [data, setData] = useState<AppData>(defaultData);

  useEffect(() => {
    loadData().then(setData);
  }, []);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setData(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    await supabase.from('tasks').insert({
      id: newTask.id,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      category: newTask.category,
      status: newTask.status,
      due_date: newTask.dueDate,
      created_at: newTask.createdAt,
    });
  }, []);

  const updateTask = useCallback(async (id: string, changes: Partial<Task>) => {
    setData(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === id ? { ...t, ...changes } : t) }));
    const db: Record<string, unknown> = {};
    if (changes.title !== undefined) db.title = changes.title;
    if (changes.description !== undefined) db.description = changes.description;
    if (changes.priority !== undefined) db.priority = changes.priority;
    if (changes.category !== undefined) db.category = changes.category;
    if (changes.status !== undefined) db.status = changes.status;
    if (changes.dueDate !== undefined) db.due_date = changes.dueDate;
    await supabase.from('tasks').update(db).eq('id', id);
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
    await supabase.from('tasks').delete().eq('id', id);
  }, []);

  const saveTodayPlan = useCallback(async (plan: TodayPlan) => {
    setData(prev => ({ ...prev, todayPlan: plan }));
    await supabase.from('today_plans').upsert({
      date: plan.date,
      main_goal: plan.mainGoal,
      must_do: plan.mustDo,
      distractions: plan.distractions,
      energy_level: plan.energyLevel,
      work_blocks: plan.workBlocks,
    }, { onConflict: 'date' });
  }, []);

  const addContentIdea = useCallback(async (idea: Omit<ContentIdea, 'id' | 'createdAt'>) => {
    const newIdea: ContentIdea = { ...idea, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setData(prev => ({ ...prev, contentIdeas: [...prev.contentIdeas, newIdea] }));
    await supabase.from('content_ideas').insert({
      id: newIdea.id,
      title: newIdea.title,
      platform: newIdea.platform,
      status: newIdea.status,
      hook: newIdea.hook,
      main_idea: newIdea.mainIdea,
      cta: newIdea.cta,
      created_at: newIdea.createdAt,
    });
  }, []);

  const updateContentIdea = useCallback(async (id: string, changes: Partial<ContentIdea>) => {
    setData(prev => ({ ...prev, contentIdeas: prev.contentIdeas.map(c => c.id === id ? { ...c, ...changes } : c) }));
    const db: Record<string, unknown> = {};
    if (changes.title !== undefined) db.title = changes.title;
    if (changes.platform !== undefined) db.platform = changes.platform;
    if (changes.status !== undefined) db.status = changes.status;
    if (changes.hook !== undefined) db.hook = changes.hook;
    if (changes.mainIdea !== undefined) db.main_idea = changes.mainIdea;
    if (changes.cta !== undefined) db.cta = changes.cta;
    await supabase.from('content_ideas').update(db).eq('id', id);
  }, []);

  const deleteContentIdea = useCallback(async (id: string) => {
    setData(prev => ({ ...prev, contentIdeas: prev.contentIdeas.filter(c => c.id !== id) }));
    await supabase.from('content_ideas').delete().eq('id', id);
  }, []);

  const addWritingItem = useCallback(async (item: Omit<WritingItem, 'id' | 'createdAt'>) => {
    const newItem: WritingItem = { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setData(prev => ({ ...prev, writingQueue: [...prev.writingQueue, newItem] }));
    await supabase.from('writing_items').insert({
      id: newItem.id,
      title: newItem.title,
      type: newItem.type,
      priority: newItem.priority,
      status: newItem.status,
      notes: newItem.notes,
      created_at: newItem.createdAt,
    });
  }, []);

  const updateWritingItem = useCallback(async (id: string, changes: Partial<WritingItem>) => {
    setData(prev => ({ ...prev, writingQueue: prev.writingQueue.map(w => w.id === id ? { ...w, ...changes } : w) }));
    const db: Record<string, unknown> = {};
    if (changes.title !== undefined) db.title = changes.title;
    if (changes.type !== undefined) db.type = changes.type;
    if (changes.priority !== undefined) db.priority = changes.priority;
    if (changes.status !== undefined) db.status = changes.status;
    if (changes.notes !== undefined) db.notes = changes.notes;
    await supabase.from('writing_items').update(db).eq('id', id);
  }, []);

  const deleteWritingItem = useCallback(async (id: string) => {
    setData(prev => ({ ...prev, writingQueue: prev.writingQueue.filter(w => w.id !== id) }));
    await supabase.from('writing_items').delete().eq('id', id);
  }, []);

  const saveEndOfDay = useCallback(async (review: EndOfDayReview) => {
    setData(prev => ({ ...prev, endOfDayReviews: [...prev.endOfDayReviews.filter(r => r.date !== review.date), review] }));
    await supabase.from('end_of_day_reviews').upsert({
      date: review.date,
      went_well: review.wentWell,
      completed: review.completed,
      postponed: review.postponed,
      tomorrow_focus: review.tomorrowFocus,
      productivity_score: review.productivityScore,
    }, { onConflict: 'date' });
  }, []);

  const saveSettings = useCallback(async (settings: Settings) => {
    setData(prev => ({ ...prev, settings }));
    await supabase.from('settings').upsert({
      id: 1,
      user_name: settings.userName,
      day_start_time: settings.dayStartTime,
      day_end_time: settings.dayEndTime,
      default_block_duration: settings.defaultBlockDuration,
    }, { onConflict: 'id' });
  }, []);

  const saveDailyNote = useCallback(async (date: string, content: string) => {
    setData(prev => ({ ...prev, dailyNotes: { ...prev.dailyNotes, [date]: content } }));
    await supabase.from('daily_notes').upsert({ date, content }, { onConflict: 'date' });
  }, []);

  const saveMainFocus = useCallback(async (date: string, focus: string) => {
    setData(prev => ({ ...prev, mainFocus: { ...prev.mainFocus, [date]: focus } }));
    await supabase.from('main_focus').upsert({ date, content: focus }, { onConflict: 'date' });
  }, []);

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
