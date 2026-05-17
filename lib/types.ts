export type Priority = 'low' | 'medium' | 'high';
export type TaskCategory = 'work' | 'content' | 'client' | 'personal' | 'other';
export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type WorkBlockStatus = 'planned' | 'in-progress' | 'done';
export type ContentPlatform = 'instagram' | 'youtube' | 'linkedin' | 'email';
export type ContentStatus = 'idea' | 'writing' | 'filming' | 'published';
export type WritingType = 'email' | 'ad-copy' | 'video-script' | 'post' | 'landing-page';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: TaskCategory;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
}

export interface WorkBlock {
  id: string;
  startTime: string;
  endTime: string;
  task: string;
  status: WorkBlockStatus;
}

export interface TodayPlan {
  date: string;
  mainGoal: string;
  mustDo: [string, string, string];
  distractions: string;
  energyLevel: number;
  workBlocks: WorkBlock[];
}

export interface ContentIdea {
  id: string;
  title: string;
  platform: ContentPlatform;
  status: ContentStatus;
  hook: string;
  mainIdea: string;
  cta: string;
  createdAt: string;
}

export interface WritingItem {
  id: string;
  title: string;
  type: WritingType;
  priority: Priority;
  status: TaskStatus;
  notes: string;
  createdAt: string;
}

export interface EndOfDayReview {
  date: string;
  wentWell: string;
  completed: string;
  postponed: string;
  tomorrowFocus: string;
  productivityScore: number;
}

export interface Settings {
  userName: string;
  dayStartTime: string;
  dayEndTime: string;
  defaultBlockDuration: number;
}

export interface AppData {
  tasks: Task[];
  todayPlan: TodayPlan | null;
  contentIdeas: ContentIdea[];
  writingQueue: WritingItem[];
  endOfDayReviews: EndOfDayReview[];
  settings: Settings;
  dailyNotes: Record<string, string>;
  mainFocus: Record<string, string>;
}
