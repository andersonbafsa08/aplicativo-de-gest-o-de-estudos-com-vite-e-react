import { supabase, getCurrentUserId, isSupabaseConfigured } from './supabase';
import { Subject, UserSettings } from '../types';

// Função auxiliar para mapear Subject do TS para o formato do DB
const mapSubjectToDb = (subject: Subject, userId: string) => ({
  id: subject.id,
  user_id: userId,
  name: subject.name,
  edital: subject.edital,
  weekly_frequency: subject.weeklyFrequency,
  hours_per_day: subject.hoursPerDay,
  max_hours_per_session: subject.maxHoursPerSession,
  days_until_exam: subject.daysUntilExam,
});

// Função auxiliar para mapear Task do TS para o formato do DB
const mapTaskToDb = (t: Subject['tasks'][number], subjectId: string) => ({
  id: t.id,
  subject_id: subjectId,
  type: t.type,
  planned_duration_minutes: t.planned_duration_minutes,
  scheduled_date: t.scheduled_date,
  status: t.status,
  actual_duration_minutes: t.tracking?.actual_duration_minutes,
  questions_made: t.tracking?.questions_made,
  questions_hit: t.tracking?.questions_hit,
  score_percentage: t.tracking?.score_percentage,
});

export const saveSubjectsToSupabase = async (subjects: Subject[]) => {
  if (!isSupabaseConfigured()) return;
  try {
    const userId = await getCurrentUserId();
    
    // 1. Deleta todas as tarefas antigas do usuário (para evitar órfãos)
    // Nota: Esta é uma abordagem simplificada. Em produção, usaríamos upsert ou transações mais complexas.
    const subjectIds = subjects.map(s => s.id);
    if (subjectIds.length > 0) {
        await supabase.from('tasks').delete().in('subject_id', subjectIds);
    }
    
    // 2. Deleta todos os assuntos antigos do usuário
    await supabase.from('subjects').delete().eq('user_id', userId);
    
    // 3. Insere novos assuntos e tarefas
    for (const subject of subjects) {
      // Insere Assunto
      const { error: subjectError } = await supabase.from('subjects').insert(mapSubjectToDb(subject, userId));
      if (subjectError) throw subjectError;

      // Insere Tarefas
      if (subject.tasks?.length) {
        const tasksToInsert = subject.tasks.map(t => mapTaskToDb(t, subject.id));
        const { error: tasksError } = await supabase.from('tasks').insert(tasksToInsert);
        if (tasksError) throw tasksError;
      }
    }
  } catch (error) {
    console.error('Erro ao salvar assuntos no Supabase:', error);
  }
};

export const loadSubjectsFromSupabase = async (): Promise<Subject[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const userId = await getCurrentUserId();
    
    // 1. Carrega Assuntos
    const { data: subjectsData, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId);
      
    if (subjectsError) throw subjectsError;
    if (!subjectsData || subjectsData.length === 0) return [];

    const result: Subject[] = [];
    
    // 2. Carrega Tarefas para cada assunto
    for (const s of subjectsData) {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('subject_id', s.id);
        
      if (tasksError) throw tasksError;

      const tasks: Subject['tasks'] = (tasksData || []).map(t => ({
        id: t.id,
        type: t.type,
        planned_duration_minutes: t.planned_duration_minutes,
        scheduled_date: t.scheduled_date,
        status: t.status,
        tracking: t.questions_made !== null ? {
          actual_duration_minutes: t.actual_duration_minutes || 0,
          questions_made: t.questions_made,
          questions_hit: t.questions_hit,
          score_percentage: t.score_percentage,
        } : undefined,
      }));
      
      // Mapeamento final para o tipo Subject do TS
      result.push({
        id: s.id,
        name: s.name,
        edital: s.edital,
        weeklyFrequency: s.weekly_frequency,
        hoursPerDay: s.hours_per_day,
        maxHoursPerSession: s.max_hours_per_session,
        daysUntilExam: s.days_until_exam,
        
        // Campos client-side (serão recalculados no contexto)
        tasks: tasks,
        progress_percentage: 0, 
        overall_score: 0,
        color: '#9E7FFF', // Cor padrão ou lógica de atribuição
      });
    }
    return result;
  } catch (error) { 
    console.error('Erro ao carregar assuntos:', error);
    return []; 
  }
};

export const saveUserSettingsToSupabase = async (settings: UserSettings) => {
  if (!isSupabaseConfigured()) return;
  try {
    const userId = await getCurrentUserId();
    const { error } = await supabase.from('user_settings').upsert({
      user_id: userId,
      study_start_time: settings.studyStartTime,
      study_end_time: settings.studyEndTime,
      break_duration_minutes: settings.breakDurationMinutes,
    }, { onConflict: 'user_id' });
    if (error) throw error;
  } catch (error) { 
    console.error('Erro ao salvar configurações:', error);
  }
};

export const loadUserSettingsFromSupabase = async (): Promise<UserSettings | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
    
    if (error && error.code !== 'PGRST116') throw error; // Ignora erro de "no rows found"
    
    return data ? {
      studyStartTime: data.study_start_time,
      studyEndTime: data.study_end_time,
      breakDurationMinutes: data.break_duration_minutes,
    } : null;
  } catch (error) { 
    console.error('Erro ao carregar configurações:', error);
    return null; 
  }
};

// Função para atualizar o status de uma única tarefa (mais eficiente que salvar todos os subjects)
export const updateTaskInSupabase = async (subjectId: string, task: Subject['tasks'][number]) => {
    if (!isSupabaseConfigured()) return;
    try {
        const taskData = mapTaskToDb(task, subjectId);
        
        // Remove campos que não devem ser atualizados (como subject_id e id)
        delete (taskData as any).subject_id; 
        delete (taskData as any).id;

        const { error } = await supabase
            .from('tasks')
            .update(taskData)
            .eq('id', task.id);

        if (error) throw error;
    } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
    }
};
