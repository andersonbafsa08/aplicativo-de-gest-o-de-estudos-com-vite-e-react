export type TaskType = 'Video Aula' | 'PDF' | 'Exercícios';

export interface ExerciseTracking {
  questions_made: number;
  questions_hit: number;
  score_percentage: number;
  actual_duration_minutes?: number; // Novo campo para rastreamento
}

export interface Task {
  id: string;
  type: TaskType;
  status: 'pending' | 'completed';
  planned_duration_minutes: number;
  scheduled_date: string; // Data agendada (YYYY-MM-DD)
  tracking?: ExerciseTracking; // Apenas para 'Exercícios'
}

export interface Subject {
  id: string;
  name: string;
  edital: string;
  
  // Campos persistidos no Supabase
  weeklyFrequency: number; // weekly_frequency
  hoursPerDay: number; // hours_per_day
  maxHoursPerSession: number; // max_hours_per_session
  daysUntilExam: number; // days_until_exam

  // Campos derivados/client-side
  tasks: Task[];
  progress_percentage: number;
  overall_score: number; // Média das pontuações dos exercícios
  color: string; // Para visualização no Dashboard
}

export interface Revision {
  id: string;
  subject_id: string;
  subject_name: string;
  due_date: string; // Data de vencimento (YYYY-MM-DD)
  cycle_day: 1 | 7 | 15 | 30;
  status: 'pending' | 'completed' | 'missed';
}

export interface UserSettings {
  studyStartTime: string; // TIME format (e.g., "08:00:00")
  studyEndTime: string; // TIME format
  breakDurationMinutes: number;
}

export interface StudyContextType {
  subjects: Subject[];
  revisions: Revision[];
  settings: UserSettings;
  loading: boolean;
  addSubject: (
    name: string, 
    edital: string, 
    deadline: string, 
    dailyTime: number, 
    daysPerWeek: number, 
    maxHoursPerSession: number
  ) => Promise<void>;
  updateTaskStatus: (subjectId: string, taskId: string, status: 'completed' | 'pending', tracking?: ExerciseTracking) => Promise<void>;
  completeRevision: (revisionId: string) => void;
  getSubjectTasksForDay: (date: string) => { subjectName: string, tasks: Task[] }[];
  updateSettings: (newSettings: UserSettings) => Promise<void>;
}
