import { supabase } from './supabase';
import { AppData, Task, TodayPlan, WorkBlock, ContentIdea, WritingItem, EndOfDayReview } from './types';

export const defaultData: AppData = {
  tasks: [],
  todayPlan: null,
  previousPlan: null,
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

export async function loadData(): Promise<AppData> {
  const today = new Date().toISOString().split('T')[0];

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const [
    { data: tasks },
    { data: todayPlans },
    { data: yesterdayPlans },
    { data: contentIdeas },
    { data: writingItems },
    { data: reviews },
    { data: settingsRow },
    { data: dailyNotesRows },
    { data: mainFocusRows },
  ] = await Promise.all([
    supabase.from('tasks').select('*'),
    supabase.from('today_plans').select('*').eq('date', today),
    supabase.from('today_plans').select('*').eq('date', yesterday),
    supabase.from('content_ideas').select('*'),
    supabase.from('writing_items').select('*'),
    supabase.from('end_of_day_reviews').select('*'),
    supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('daily_notes').select('*'),
    supabase.from('main_focus').select('*'),
  ]);

  const todayPlanRow = todayPlans?.[0] ?? null;
  const yesterdayPlanRow = yesterdayPlans?.[0] ?? null;

  function mapPlan(row: Record<string, unknown> | null): TodayPlan | null {
    if (!row) return null;
    return {
      date: row.date as string,
      mainGoal: (row.main_goal as string) ?? '',
      mustDo: (row.must_do as [string, string, string]) ?? ['', '', ''],
      mustDoDone: (row.must_do_done as [boolean, boolean, boolean]) ?? [false, false, false],
      distractions: (row.distractions as string) ?? '',
      energyLevel: (row.energy_level as number) ?? 3,
      workBlocks: (row.work_blocks as WorkBlock[]) ?? [],
    };
  }

  return {
    tasks: (tasks ?? []).map((t): Task => ({
      id: t.id,
      title: t.title,
      description: t.description ?? '',
      priority: t.priority,
      category: t.category,
      status: t.status,
      dueDate: t.due_date ?? '',
      createdAt: t.created_at,
    })),
    todayPlan: mapPlan(todayPlanRow as Record<string, unknown> | null),
    previousPlan: mapPlan(yesterdayPlanRow as Record<string, unknown> | null),
    contentIdeas: (contentIdeas ?? []).map((c): ContentIdea => ({
      id: c.id,
      title: c.title,
      platform: c.platform,
      status: c.status,
      hook: c.hook ?? '',
      mainIdea: c.main_idea ?? '',
      cta: c.cta ?? '',
      createdAt: c.created_at,
    })),
    writingQueue: (writingItems ?? []).map((w): WritingItem => ({
      id: w.id,
      title: w.title,
      type: w.type,
      priority: w.priority,
      status: w.status,
      notes: w.notes ?? '',
      createdAt: w.created_at,
    })),
    endOfDayReviews: (reviews ?? []).map((r): EndOfDayReview => ({
      date: r.date,
      wentWell: r.went_well ?? '',
      completed: r.completed ?? '',
      postponed: r.postponed ?? '',
      tomorrowFocus: r.tomorrow_focus ?? '',
      productivityScore: r.productivity_score ?? 5,
    })),
    settings: settingsRow ? {
      userName: settingsRow.user_name ?? '',
      dayStartTime: settingsRow.day_start_time ?? '09:00',
      dayEndTime: settingsRow.day_end_time ?? '18:00',
      defaultBlockDuration: settingsRow.default_block_duration ?? 90,
    } : defaultData.settings,
    dailyNotes: Object.fromEntries((dailyNotesRows ?? []).map(n => [n.date, n.content ?? ''])),
    mainFocus: Object.fromEntries((mainFocusRows ?? []).map(f => [f.date, f.content ?? ''])),
  };
}
