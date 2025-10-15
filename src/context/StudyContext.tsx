import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useLocalStorage from '../hooks/useLocalStorage';

// Tipos de dados
export interface Subject {
  id: string;
  name: string;
  materia: string; // Novo campo para organizar por matéria
  completed: boolean; // Overall completion
  lastStudied: string | null; // YYYY-MM-DD
  nextReview: string | null; // YYYY-MM-DD
  reviewInterval: number; // days (for spaced repetition: 0, 1, 7, 15, 30)
  history: { date: string; type: 'study' | 'review' }[];

  // New progress fields
  videoCompleted: boolean;
  pdfCompleted: boolean;
  exercisesCompleted: boolean;
  questionsMade: number;
  correctAnswers: number;
  accuracy: number; // Derived: correctAnswers / questionsMade * 100
  questionHistory: { date: string; made: number; correct: number; }[]; // Histórico de questões por dia
}

export interface StudyConfig {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  dailyStudyHours: number;
}

export interface ScheduleEntry {
  date: string; // YYYY-MM-DD
  subjects: string[]; // Subject IDs
}

// Context Type
interface StudyContextType {
  subjects: Subject[];
  config: StudyConfig;
  schedule: ScheduleEntry[];
  importSubjects: (subjectNames: string[], materia: string) => void; // Adicionado materia
  removeSubject: (id: string) => void;
  updateConfig: (newConfig: StudyConfig) => void;
  generateSchedule: () => void;
  updateSubjectProgress: (id: string, progress: Partial<Subject>) => void;
  recordStudySession: (id: string) => void;
  scheduleNextReview: (id: string) => void;
  getSubjectsForReview: (date: string) => Subject[];
}

// Valores iniciais
const initialConfig: StudyConfig = {
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
  dailyStudyHours: 2,
};

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('study_subjects', []);
  const [config, setConfig] = useLocalStorage<StudyConfig>('study_config', initialConfig);
  const [schedule, setSchedule] = useLocalStorage<ScheduleEntry[]>('study_schedule', []);

  const importSubjects = useCallback((subjectNames: string[], materia: string) => {
    const newSubjects: Subject[] = subjectNames.map(name => ({
      id: uuidv4(),
      name,
      materia: materia || 'Geral', // Define 'Geral' se nenhuma matéria for fornecida
      completed: false,
      lastStudied: null,
      nextReview: null,
      reviewInterval: 0, // Initial interval
      history: [],
      videoCompleted: false,
      pdfCompleted: false,
      exercisesCompleted: false,
      questionsMade: 0,
      correctAnswers: 0,
      accuracy: 0,
      questionHistory: [], // Inicializa o histórico de questões
    }));
    setSubjects(prev => [...prev, ...newSubjects]);
  }, [setSubjects]);

  const removeSubject = useCallback((id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  }, [setSubjects]);

  const updateConfig = useCallback((newConfig: StudyConfig) => {
    setConfig(newConfig);
  }, [setConfig]);

  const updateSubjectProgress = useCallback((id: string, progress: Partial<Subject>) => {
    setSubjects(prev =>
      prev.map(s => {
        if (s.id === id) {
          const updatedSubject = { ...s, ...progress };
          const today = new Date().toISOString().split('T')[0];

          // Recalculate accuracy if questionsMade or correctAnswers changed
          if (progress.questionsMade !== undefined || progress.correctAnswers !== undefined) {
            const qMade = updatedSubject.questionsMade;
            const cAnswers = updatedSubject.correctAnswers;
            updatedSubject.accuracy = qMade > 0 ? Math.round((cAnswers / qMade) * 100) : 0;

            // Update question history for today
            const existingEntryIndex = updatedSubject.questionHistory.findIndex(entry => entry.date === today);
            if (existingEntryIndex !== -1) {
              updatedSubject.questionHistory[existingEntryIndex] = {
                date: today,
                made: qMade,
                correct: cAnswers,
              };
            } else {
              updatedSubject.questionHistory.push({
                date: today,
                made: qMade,
                correct: cAnswers,
              });
            }
          }
          // Check for overall completion
          updatedSubject.completed = updatedSubject.videoCompleted && updatedSubject.pdfCompleted && updatedSubject.exercisesCompleted;
          return updatedSubject;
        }
        return s;
      })
    );
  }, [setSubjects]);

  const recordStudySession = useCallback((id: string) => {
    setSubjects(prev =>
      prev.map(s => {
        if (s.id === id) {
          const today = new Date().toISOString().split('T')[0];
          return {
            ...s,
            lastStudied: today,
            history: [...s.history, { date: today, type: 'study' }],
          };
        }
        return s;
      })
    );
  }, [setSubjects]);

  const scheduleNextReview = useCallback((id: string) => {
    setSubjects(prev =>
      prev.map(s => {
        if (s.id === id) {
          const today = new Date();
          let newInterval = 0;
          // Spaced repetition intervals: 1, 7, 15, 30 days
          if (s.reviewInterval === 0) newInterval = 1;
          else if (s.reviewInterval === 1) newInterval = 7;
          else if (s.reviewInterval === 7) newInterval = 15;
          else if (s.reviewInterval === 15) newInterval = 30;
          else newInterval = 30; // Cap at 30 days

          const nextReviewDate = new Date(today);
          nextReviewDate.setDate(today.getDate() + newInterval);

          return {
            ...s,
            reviewInterval: newInterval,
            nextReview: nextReviewDate.toISOString().split('T')[0],
            history: [...s.history, { date: today.toISOString().split('T')[0], type: 'review' }],
          };
        }
        return s;
      })
    );
  }, [setSubjects]);

  const getSubjectsForReview = useCallback((date: string): Subject[] => {
    return subjects.filter(s => s.nextReview && s.nextReview <= date && !s.completed);
  }, [subjects]);

  const generateSchedule = useCallback(() => {
    const newSchedule: ScheduleEntry[] = [];
    const start = new Date(config.startDate);
    const end = new Date(config.endDate);
    const availableSubjects = subjects.filter(s => !s.completed); // Only schedule incomplete subjects
    const subjectsPerDay = Math.floor(config.dailyStudyHours); // How many subjects can fit in a day (e.g., 2 hours = 2 subjects)

    if (availableSubjects.length === 0 || subjectsPerDay <= 0) {
      setSchedule([]);
      return;
    }

    let subjectQueue = [...availableSubjects]; // Use a queue for round-robin
    let reviewQueue = availableSubjects.filter(s => s.nextReview && s.nextReview <= new Date().toISOString().split('T')[0]);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      const subjectsForThisDay: string[] = [];
      const currentDayReviewSubjects = availableSubjects.filter(s => s.nextReview && s.nextReview <= dateString && !s.completed);

      // Prioritize subjects due for review for the current day
      for (const sub of currentDayReviewSubjects) {
        if (subjectsForThisDay.length < subjectsPerDay && !subjectsForThisDay.includes(sub.id)) {
          subjectsForThisDay.push(sub.id);
        }
      }

      // Fill remaining slots with other available subjects (round-robin)
      let attempts = 0;
      while (subjectsForThisDay.length < subjectsPerDay && attempts < availableSubjects.length * 2) { // Prevent infinite loop
        if (subjectQueue.length === 0) {
          subjectQueue = [...availableSubjects]; // Reset queue if exhausted
        }
        const nextSubject = subjectQueue.shift(); // Get next subject from queue

        if (nextSubject && !subjectsForThisDay.includes(nextSubject.id) && !nextSubject.completed) {
          subjectsForThisDay.push(nextSubject.id);
        } else if (nextSubject) {
          subjectQueue.push(nextSubject); // Put it back if not scheduled
        }
        attempts++;
      }

      if (subjectsForThisDay.length > 0) {
        newSchedule.push({ date: dateString, subjects: subjectsForThisDay });
      }
    }
    setSchedule(newSchedule);
  }, [config, subjects, setSchedule]);

  const value = {
    subjects,
    config,
    schedule,
    importSubjects,
    removeSubject,
    updateConfig,
    generateSchedule,
    updateSubjectProgress,
    recordStudySession,
    scheduleNextReview,
    getSubjectsForReview,
  };

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
