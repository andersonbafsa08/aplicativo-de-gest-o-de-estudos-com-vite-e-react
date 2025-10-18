import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { StudyContextType, Subject, Task, Revision, ExerciseTracking, TaskType, UserSettings } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { 
  saveSubjectsToSupabase, 
  loadSubjectsFromSupabase, 
  saveUserSettingsToSupabase, 
  loadUserSettingsFromSupabase,
  updateTaskInSupabase
} from '../lib/supabaseService';

// --- Helpers de Simulação de IA e Lógica ---

const COLORS = ['#9E7FFF', '#38bdf8', '#f472b6', '#10b981', '#f59e0b'];

// Atualizado para incluir scheduled_date
const generateTasks = (subjectName: string, totalHours: number, startDate: string): Task[] => {
  const tasks: Task[] = [];
  const tasksPerModule = 3;
  const totalModules = 5;
  const totalTasks = totalModules * tasksPerModule;
  const plannedDurationPerTask = Math.floor((totalHours * 60) / totalTasks);

  const baseDate = new Date(startDate);

  for (let i = 1; i <= totalModules; i++) {
    // Simulação de agendamento sequencial
    const scheduledDate = new Date(baseDate);
    scheduledDate.setDate(baseDate.getDate() + Math.floor(i / 2)); // Agenda tarefas em dias diferentes

    tasks.push({
      id: `v-${subjectName}-${i}-${Date.now()}`,
      type: 'Video Aula',
      status: 'pending',
      planned_duration_minutes: plannedDurationPerTask,
      scheduled_date: scheduledDate.toISOString().split('T')[0],
    });
    tasks.push({
      id: `p-${subjectName}-${i}-${Date.now() + 1}`,
      type: 'PDF',
      status: 'pending',
      planned_duration_minutes: Math.floor(plannedDurationPerTask * 0.7),
      scheduled_date: scheduledDate.toISOString().split('T')[0],
    });
    tasks.push({
      id: `e-${subjectName}-${i}-${Date.now() + 2}`,
      type: 'Exercícios',
      status: 'pending',
      planned_duration_minutes: Math.floor(plannedDurationPerTask * 1.3),
      scheduled_date: scheduledDate.toISOString().split('T')[0],
    });
  }
  return tasks;
};

const generateRevisions = (subjectId: string, subjectName: string): Revision[] => {
  const cycles: (1 | 7 | 15 | 30)[] = [1, 7, 15, 30];
  
  return cycles.map((day) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + day);
    return {
      id: `rev-${subjectId}-${day}-${Date.now()}`,
      subject_id: subjectId,
      subject_name: subjectName,
      due_date: dueDate.toISOString().split('T')[0],
      cycle_day: day,
      status: 'pending',
    };
  });
};

// --- Mock Data Inicial (Fallback) ---

const initialSubjects: Subject[] = [
  {
    id: 's1',
    name: 'Matemática Avançada',
    edital: 'Concurso Federal 2025',
    weeklyFrequency: 5,
    hoursPerDay: 2,
    maxHoursPerSession: 1.5,
    daysUntilExam: 150,
    tasks: [
      { id: 't1a', type: 'Video Aula', status: 'completed', planned_duration_minutes: 40, scheduled_date: '2025-08-01' },
      { id: 't1b', type: 'PDF', status: 'completed', planned_duration_minutes: 20, scheduled_date: '2025-08-01' },
      { id: 't1c', type: 'Exercícios', status: 'completed', planned_duration_minutes: 60, scheduled_date: '2025-08-02', tracking: { questions_made: 50, questions_hit: 42, score_percentage: 84 } },
      { id: 't2a', type: 'Video Aula', status: 'pending', planned_duration_minutes: 40, scheduled_date: '2025-08-03' },
      { id: 't2b', type: 'PDF', status: 'pending', planned_duration_minutes: 20, scheduled_date: '2025-08-03' },
      { id: 't2c', type: 'Exercícios', status: 'pending', planned_duration_minutes: 60, scheduled_date: '2025-08-04' },
    ],
    progress_percentage: 33,
    overall_score: 84,
    color: COLORS[0],
  },
  {
    id: 's2',
    name: 'Desenvolvimento Web',
    edital: 'Certificação React Pro',
    weeklyFrequency: 4,
    hoursPerDay: 3,
    maxHoursPerSession: 2,
    daysUntilExam: 90,
    tasks: [
      { id: 't3a', type: 'Video Aula', status: 'completed', planned_duration_minutes: 90, scheduled_date: '2025-08-01' },
      { id: 't3b', type: 'PDF', status: 'pending', planned_duration_minutes: 45, scheduled_date: '2025-08-05' },
      { id: 't3c', type: 'Exercícios', status: 'pending', planned_duration_minutes: 90, scheduled_date: '2025-08-06' },
    ],
    progress_percentage: 10,
    overall_score: 0,
    color: COLORS[1],
  },
];

const initialRevisions: Revision[] = [
  { id: 'r1', subject_id: 's1', subject_name: 'Matemática Avançada', due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], cycle_day: 1, status: 'pending' },
  { id: 'r2', subject_id: 's1', subject_name: 'Matemática Avançada', due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], cycle_day: 7, status: 'pending' },
];

const initialSettings: UserSettings = {
  studyStartTime: "08:00:00",
  studyEndTime: "12:00:00",
  breakDurationMinutes: 15,
};


// --- Context Implementation ---

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Revisions ainda usa localStorage, pois não foi incluído no schema Supabase
  const [revisions, setRevisions] = useLocalStorage<Revision[]>('study_revisions', initialRevisions);
  
  // Subjects e Settings agora são gerenciados internamente e persistidos via Supabase
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [loading, setLoading] = useState(true);

  // Efeito para carregar dados do Supabase na inicialização
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      const supabaseSubjects = await loadSubjectsFromSupabase();
      if (supabaseSubjects.length > 0) {
        // Recalcula métricas após carregar do DB
        const calculatedSubjects = supabaseSubjects.map(calculateSubjectMetrics);
        setSubjects(calculatedSubjects);
      } else {
        // Fallback para mock data se o Supabase estiver vazio (primeiro uso)
        setSubjects(initialSubjects.map(calculateSubjectMetrics));
      }
      
      const supabaseSettings = await loadUserSettingsFromSupabase();
      if (supabaseSettings) {
        setSettings(supabaseSettings);
      }
      
      setLoading(false);
    };
    loadData();
  }, []);


  const calculateSubjectMetrics = useCallback((subject: Subject): Subject => {
    const totalTasks = subject.tasks.length;
    const completedTasks = subject.tasks.filter(t => t.status === 'completed').length;
    const progress_percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const completedExercises = subject.tasks.filter(t => t.type === 'Exercícios' && t.status === 'completed' && t.tracking);
    const totalScores = completedExercises.reduce((sum, t) => sum + (t.tracking?.score_percentage || 0), 0);
    const overall_score = completedExercises.length > 0 ? Math.round(totalScores / completedExercises.length) : 0;

    // Mantém a cor existente ou atribui uma nova se for um novo assunto
    const color = subject.color || COLORS[subjects.length % COLORS.length];

    return { ...subject, progress_percentage, overall_score, color };
  }, [subjects.length]);

  // Refatorado para usar os novos parâmetros de planejamento
  const addSubject = useCallback(async (name: string, edital: string, deadline: string, dailyTime: number, daysPerWeek: number, maxHoursPerSession: number) => {
    
    // 1. Cálculo de dias até o exame
    const today = new Date();
    const examDate = new Date(deadline);
    const diffTime = examDate.getTime() - today.getTime();
    const daysUntilExam = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const totalHours = Math.max(40, dailyTime * daysPerWeek * 4); 
    const newTasks = generateTasks(name, totalHours, today.toISOString().split('T')[0]);

    const newSubject: Subject = {
      id: `s-${Date.now()}`,
      name,
      edital,
      weeklyFrequency: daysPerWeek,
      hoursPerDay: dailyTime,
      maxHoursPerSession,
      daysUntilExam: Math.max(0, daysUntilExam),
      
      tasks: newTasks,
      progress_percentage: 0,
      overall_score: 0,
      color: COLORS[subjects.length % COLORS.length],
    };
    
    const updatedSubjects = [...subjects, newSubject];
    setSubjects(updatedSubjects.map(calculateSubjectMetrics));
    
    // Persistência
    await saveSubjectsToSupabase(updatedSubjects);

  }, [subjects, calculateSubjectMetrics]);

  const updateTaskStatus = useCallback(async (subjectId: string, taskId: string, status: 'completed' | 'pending', tracking?: ExerciseTracking) => {
    let updatedTask: Task | null = null;

    const updatedSubjects = subjects.map(subject => {
      if (subject.id === subjectId) {
        const updatedTasks = subject.tasks.map(task => {
          if (task.id === taskId) {
            const isExercise = task.type === 'Exercícios';
            let newTracking = task.tracking;
            
            if (isExercise && status === 'completed' && tracking) {
              const score = tracking.questions_made > 0 ? Math.round((tracking.questions_hit / tracking.questions_made) * 100) : 0;
              newTracking = { ...tracking, score_percentage: score };
            }

            updatedTask = { ...task, status, tracking: newTracking };
            return updatedTask;
          }
          return task;
        });

        const updatedSubject = calculateSubjectMetrics({ ...subject, tasks: updatedTasks });
        
        // Lógica de Revisão: Se o assunto acabou de ser concluído (100%), agendar revisões.
        const wasCompleted = updatedSubject.tasks.every(t => t.status === 'completed');
        const isNewCompletion = wasCompleted && updatedSubject.progress_percentage === 100 && subject.progress_percentage < 100;

        if (isNewCompletion) {
            setRevisions(prevRevisions => [
                ...prevRevisions,
                ...generateRevisions(updatedSubject.id, updatedSubject.name)
            ]);
        }

        return updatedSubject;
      }
      return subject;
    });

    setSubjects(updatedSubjects);
    
    // Persistência: Atualiza apenas a tarefa modificada no Supabase
    if (updatedTask) {
        await updateTaskInSupabase(subjectId, updatedTask);
    }
    // Nota: Não salvamos todos os subjects aqui, pois a atualização de status é granular.
    // Apenas a criação de subject salva o objeto completo.

  }, [calculateSubjectMetrics, subjects, setRevisions]);

  const completeRevision = useCallback((revisionId: string) => {
    setRevisions(prev => prev.map(r => r.id === revisionId ? { ...r, status: 'completed' } : r));
  }, [setRevisions]);

  const getSubjectTasksForDay = useCallback((date: string) => {
    const activeSubjects = subjects.filter(s => s.progress_percentage < 100);

    if (activeSubjects.length === 0) return [];

    const dailySchedule = activeSubjects.map(subject => {
        // Filtra tarefas agendadas para a data específica
        const dailyTasks = subject.tasks.filter(t => t.status === 'pending' && t.scheduled_date === date);
        
        if (dailyTasks.length === 0) return null;

        return {
            subjectName: subject.name,
            tasks: dailyTasks
        };
    }).filter((item): item is { subjectName: string, tasks: Task[] } => item !== null);

    return dailySchedule;
  }, [subjects]);
  
  const updateSettings = useCallback(async (newSettings: UserSettings) => {
    setSettings(newSettings);
    await saveUserSettingsToSupabase(newSettings);
  }, []);


  return (
    <StudyContext.Provider value={{ 
      subjects, 
      revisions, 
      settings,
      loading, 
      addSubject, 
      updateTaskStatus, 
      completeRevision,
      getSubjectTasksForDay,
      updateSettings
    }}>
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
