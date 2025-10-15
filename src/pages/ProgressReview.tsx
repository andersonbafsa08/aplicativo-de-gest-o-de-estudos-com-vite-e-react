import React from 'react';
import { useStudy, Subject } from '../context/StudyContext';
import Card from '../components/Card';
import { CheckCircle, Clock, BookOpen, FileText, Lightbulb, CalendarCheck, Repeat, BarChart2 } from 'lucide-react';

interface ProgressReviewProps {
  openQuestionControlModal: (subject: Subject) => void;
}

const ProgressReview: React.FC<ProgressReviewProps> = ({ openQuestionControlModal }) => {
  const { subjects, updateSubjectProgress, recordStudySession, scheduleNextReview } = useStudy();

  const handleProgressChange = (subjectId: string, field: keyof Subject, value: boolean | number) => {
    updateSubjectProgress(subjectId, { [field]: value });
  };

  const handleRecordStudy = (subjectId: string) => {
    recordStudySession(subjectId);
    alert('Sessão de estudo registrada!');
  };

  const handleScheduleReview = (subjectId: string) => {
    scheduleNextReview(subjectId);
    alert('Próxima revisão agendada!');
  };

  const getReviewStatus = (subject: Subject) => {
    if (subject.completed) return { text: 'Concluído', color: 'text-success', icon: <CheckCircle className="w-4 h-4" /> };
    if (subject.nextReview) {
      const today = new Date().toISOString().split('T')[0];
      if (subject.nextReview <= today) {
        return { text: 'Revisão Pendente', color: 'text-warning', icon: <Clock className="w-4 h-4" /> };
      } else {
        return { text: `Próxima Revisão: ${new Date(subject.nextReview).toLocaleDateString('pt-BR')}`, color: 'text-textSecondary', icon: <CalendarCheck className="w-4 h-4" /> };
      }
    }
    return { text: 'Sem revisão agendada', color: 'text-textSecondary', icon: <Repeat className="w-4 h-4" /> };
  };

  // Ordena os assuntos: finalizados para o final
  const sortedSubjects = [...subjects].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return 0; // Mantém a ordem original entre assuntos do mesmo status
  });

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold text-text mb-8">Progresso e Revisão</h1>
      <Card title="Seu Progresso por Assunto">
        {sortedSubjects.length === 0 ? (
          <p className="text-textSecondary italic">Nenhum assunto importado ainda. Vá para a tela de Importar Assuntos.</p>
        ) : (
          <div className="space-y-6">
            {sortedSubjects.map((subject) => {
              const reviewStatus = getReviewStatus(subject);
              const showExerciseInputs = subject.exercisesCompleted && (subject.questionsMade === 0 && subject.correctAnswers === 0);
              const showAccuracyOnly = subject.exercisesCompleted && (subject.questionsMade > 0 || subject.correctAnswers > 0);

              return (
                <div key={subject.id} className="bg-surface p-6 rounded-xl border border-border shadow-md animate-slide-in-left">
                  <h3 className="text-2xl font-semibold text-primary mb-2 flex items-center">
                    <BookOpen className="w-6 h-6 mr-3" /> {subject.name}
                    {subject.completed && <span className="ml-auto text-success text-base flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> Concluído</span>}
                  </h3>
                  {subject.materia && (
                    <span className="text-textSecondary text-sm bg-background px-2 py-1 rounded-md border border-border mb-4 inline-block">
                      <FileText className="inline-block w-3 h-3 mr-1" /> {subject.materia}
                    </span>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-4">
                    <label className="flex items-center text-textSecondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subject.videoCompleted}
                        onChange={(e) => handleProgressChange(subject.id, 'videoCompleted', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-primary rounded border-border bg-background focus:ring-primary transition-colors duration-200"
                      />
                      <span className="ml-3 text-lg">Vídeo Aula</span>
                    </label>
                    <label className="flex items-center text-textSecondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subject.pdfCompleted}
                        onChange={(e) => handleProgressChange(subject.id, 'pdfCompleted', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-primary rounded border-border bg-background focus:ring-primary transition-colors duration-200"
                      />
                      <span className="ml-3 text-lg">PDF</span>
                    </label>
                    <label className="flex items-center text-textSecondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subject.exercisesCompleted}
                        onChange={(e) => handleProgressChange(subject.id, 'exercisesCompleted', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-primary rounded border-border bg-background focus:ring-primary transition-colors duration-200"
                      />
                      <span className="ml-3 text-lg">Exercícios</span>
                    </label>
                  </div>

                  {subject.exercisesCompleted && (
                    <div className="bg-background p-4 rounded-lg border border-border mt-4">
                      <h4 className="text-lg font-medium text-text mb-3 flex items-center"><Lightbulb className="w-4 h-4 mr-2" /> Detalhes dos Exercícios</h4>
                      {showExerciseInputs ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor={`questionsMade-${subject.id}`} className="block text-textSecondary text-sm font-medium mb-1">
                              Questões Feitas
                            </label>
                            <input
                              type="number"
                              id={`questionsMade-${subject.id}`}
                              value={subject.questionsMade}
                              onChange={(e) => handleProgressChange(subject.id, 'questionsMade', Number(e.target.value))}
                              min="0"
                              className="w-full p-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                          </div>
                          <div>
                            <label htmlFor={`correctAnswers-${subject.id}`} className="block text-textSecondary text-sm font-medium mb-1">
                              Acertos
                            </label>
                            <input
                              type="number"
                              id={`correctAnswers-${subject.id}`}
                              value={subject.correctAnswers}
                              onChange={(e) => handleProgressChange(subject.id, 'correctAnswers', Number(e.target.value))}
                              min="0"
                              max={subject.questionsMade}
                              className="w-full p-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                          </div>
                        </div>
                      ) : showAccuracyOnly ? (
                        <div className="flex items-center justify-between">
                          <p className="text-text text-lg font-semibold">
                            Precisão: <span className={subject.accuracy >= 70 ? 'text-success' : subject.accuracy >= 50 ? 'text-warning' : 'text-error'}>{subject.accuracy}%</span>
                          </p>
                          <button
                            onClick={() => openQuestionControlModal(subject)}
                            className="bg-accent text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-fuchsia-600 transition-all duration-200 flex items-center shadow-md hover:shadow-glow-primary"
                          >
                            <BarChart2 className="w-4 h-4 mr-2" /> Ver Histórico
                          </button>
                        </div>
                      ) : (
                        <p className="text-textSecondary italic">Preencha as questões feitas e acertos para ver a precisão.</p>
                      )}
                    </div>
                  )}

                  <div className="mt-5 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className={`flex items-center text-lg font-medium ${reviewStatus.color}`}>
                      {reviewStatus.icon}
                      <span className="ml-2">{reviewStatus.text}</span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleRecordStudy(subject.id)}
                        className="bg-primary text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-all duration-200 flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Marcar Estudo
                      </button>
                      <button
                        onClick={() => handleScheduleReview(subject.id)}
                        className="bg-secondary text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-secondary-dark transition-all duration-200 flex items-center"
                      >
                        <Repeat className="w-4 h-4 mr-2" /> Agendar Revisão
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProgressReview;
