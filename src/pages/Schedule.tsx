import React, { useState } from 'react';
import { Calendar, Clock, Zap, CheckCircle, BookOpen, FileText, BarChart2, X, Filter } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { Task, ExerciseTracking } from '../types';

// Componente Modal para rastreamento de exercícios (mantido)
interface ExerciseModalProps {
  task: Task;
  subjectId: string;
  subjectName: string;
  onClose: () => void;
}

const ExerciseTrackingModal: React.FC<ExerciseModalProps> = ({ task, subjectId, subjectName, onClose }) => {
  const { updateTaskStatus } = useStudy();
  const [made, setMade] = useState(task.tracking?.questions_made || 0);
  const [hit, setHit] = useState(task.tracking?.questions_hit || 0);

  const score = made > 0 ? Math.round((hit / made) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tracking: ExerciseTracking = {
      questions_made: made,
      questions_hit: hit,
      score_percentage: score,
    };
    updateTaskStatus(subjectId, task.id, 'completed', tracking);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface p-6 rounded-xl shadow-2xl w-full max-w-lg border border-border-color relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-error transition-colors">
          <X size={24} />
        </button>
        <h3 className="text-2xl font-bold text-text mb-4 flex items-center">
          <BarChart2 className="mr-2 text-accent" />
          Rastrear Exercícios: {subjectName}
        </h3>
        <p className="text-text-secondary mb-6">Registre seu desempenho na tarefa: **{task.type}**</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="made" className="block text-sm font-medium text-text-secondary mb-1">Questões Feitas</label>
            <input
              type="number"
              id="made"
              value={made}
              onChange={(e) => setMade(parseInt(e.target.value) || 0)}
              min="0"
              className="w-full p-3 rounded-lg bg-background border border-border-color text-text focus:border-primary focus:ring-primary transition-colors"
              required
            />
          </div>
          <div>
            <label htmlFor="hit" className="block text-sm font-medium text-text-secondary mb-1">Questões Acertadas</label>
            <input
              type="number"
              id="hit"
              value={hit}
              onChange={(e) => setHit(parseInt(e.target.value) || 0)}
              min="0"
              max={made}
              className="w-full p-3 rounded-lg bg-background border border-border-color text-text focus:border-primary focus:ring-primary transition-colors"
              required
            />
          </div>

          <div className="text-center p-3 bg-background rounded-lg border border-border-color">
            <p className="text-lg font-semibold text-text">Pontuação Calculada: <span className="text-primary">{score}%</span></p>
          </div>

          <button type="submit" className="w-full bg-primary text-white p-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Salvar e Concluir Tarefa
          </button>
        </form>
      </div>
    </div>
  );
};

const Schedule: React.FC = () => {
  const { subjects, updateTaskStatus } = useStudy();
  const today = new Date().toISOString().split('T')[0];
  
  // 1. Estado para Edital selecionado
  const [selectedEdital, setSelectedEdital] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{ task: Task, subjectId: string, subjectName: string } | null>(null);

  // 2. Obter lista única de Editais
  const editalList = Array.from(new Set(subjects.map(s => s.edital))).filter(Boolean);

  // --- Lógica de Filtragem e Ordenação (Requisito 1.2) ---
  
  // 3. Filtrar todos os assuntos pelo Edital selecionado
  const allSubjectsFilteredByEdital = subjects.filter(s => 
    !selectedEdital || s.edital === selectedEdital
  );

  // 4. Estruturar a lista para exibição e determinar status de conclusão
  const scheduleItems = allSubjectsFilteredByEdital.map(subject => {
    // Tarefas PENDENTES agendadas para HOJE
    const dailyTasks = subject.tasks.filter(t => t.status === 'pending' && t.scheduled_date === today);
    
    const isSubjectCompleted = subject.progress_percentage === 100;

    // Inclui o assunto se estiver 100% completo OU se tiver tarefas pendentes para hoje
    if (isSubjectCompleted || dailyTasks.length > 0) {
        return {
            subject,
            dailyTasks, // Tasks pending for today
            isSubjectCompleted
        };
    }
    return null;
  }).filter(item => item !== null);

  // 5. Reordenar: Ativos hoje primeiro, Concluídos por último
  const activeToday = scheduleItems.filter(item => !item.isSubjectCompleted);
  const completedSubjects = scheduleItems.filter(item => item.isSubjectCompleted);

  const finalSchedule = [...activeToday, ...completedSubjects];
  // -------------------------------------------------------


  const handleTaskCompletion = (subjectId: string, taskId: string, type: string) => {
    if (type === 'Exercícios') {
      const subject = subjects.find(s => s.id === subjectId);
      const task = subject?.tasks.find(t => t.id === taskId);
      if (task && subject) {
        setSelectedTask({ task, subjectId, subjectName: subject.name });
        setModalOpen(true);
      }
    } else {
      // Para Video Aula e PDF, apenas marca como concluído
      updateTaskStatus(subjectId, taskId, 'completed');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Video Aula': return <BookOpen size={20} className="text-secondary" />;
      case 'PDF': return <FileText size={20} className="text-accent" />;
      case 'Exercícios': return <BarChart2 size={20} className="text-primary" />;
      default: return <Clock size={20} className="text-text-secondary" />;
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-text border-b border-border-color pb-4 flex items-center">
        <Calendar className="mr-3 text-secondary" size={32} />
        Cronograma Diário ({new Date().toLocaleDateString('pt-BR')})
      </h1>

      {/* Painel de Seleção de Edital */}
      <div className="bg-surface p-4 rounded-xl shadow-lg border border-border-color">
        <h2 className="text-xl font-semibold text-text mb-3 flex items-center">
            <Filter size={20} className="mr-2 text-accent" />
            Filtrar por Edital/Concurso
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedEdital(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedEdital === null ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-background text-text-secondary hover:bg-border-color'
            }`}
          >
            Todos os Editais
          </button>
          {editalList.map(edital => (
            <button
              key={edital}
              onClick={() => setSelectedEdital(edital)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedEdital === edital ? 'bg-secondary text-white shadow-md shadow-secondary/30' : 'bg-background text-text-secondary hover:bg-border-color'
              }`}
            >
              {edital}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface p-6 rounded-xl shadow-lg border border-border-color">
        <h2 className="text-2xl font-semibold text-text mb-6">
          Tarefas Agendadas {selectedEdital ? `para: ${selectedEdital}` : ''}
        </h2>
        
        {finalSchedule.length === 0 ? (
          <div className="text-center py-10 text-text-secondary">
            <Zap className="mx-auto mb-3" size={40} />
            <p>Nenhuma sessão de estudo agendada para hoje {selectedEdital ? `neste edital` : ''}.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {finalSchedule.map((item) => {
                const { subject, dailyTasks, isSubjectCompleted } = item;
                
                // Estilo de conclusão (Requisito 1.2)
                // Nota: Usamos cores dinâmicas do objeto subject para assuntos ativos.
                const subjectCardClass = isSubjectCompleted 
                    ? 'border-l-4 border-success bg-success/10 pl-4 space-y-3 transition-all duration-500'
                    : `border-l-4 pl-4 space-y-3` // Tailwind JIT deve capturar a cor dinâmica
                
                // Adiciona a cor dinâmica diretamente ao estilo para garantir que o JIT a reconheça
                const activeBorderStyle = isSubjectCompleted ? {} : { borderColor: subject.color };

                return (
                  <div key={subject.id} className={subjectCardClass} style={activeBorderStyle}>
                    <h3 className="text-xl font-bold text-text mb-1 flex justify-between items-center">
                        <span>{subject.name}</span>
                        {isSubjectCompleted && (
                            <span className="text-success text-sm font-medium flex items-center">
                                <CheckCircle size={16} className="mr-1" /> Assunto Concluído
                            </span>
                        )}
                    </h3>
                    <p className="text-sm text-accent font-medium mb-3">Progresso: {subject.progress_percentage}% | Edital: {subject.edital}</p>
                    
                    {/* Se o assunto estiver concluído, mostramos um resumo */}
                    {isSubjectCompleted ? (
                        <div className="bg-background p-4 rounded-lg text-text-secondary border border-success/30">
                            <p>Todas as tarefas deste assunto foram concluídas. Adicionado ao ciclo de revisões.</p>
                            <p className="text-xs mt-1 text-text">Score Médio de Exercícios: <span className="font-bold text-primary">{subject.overall_score}%</span></p>
                        </div>
                    ) : (
                        // Renderiza apenas as tarefas agendadas para hoje
                        dailyTasks.length > 0 ? (
                            dailyTasks.map((task) => {
                                return (
                                    <div
                                        key={task.id}
                                        className="flex items-center bg-background p-4 rounded-lg hover:shadow-glow transition-shadow duration-300 border border-border-color"
                                    >
                                        {getIcon(task.type)}
                                        <div className="flex-1 mx-4">
                                            <p className="font-semibold text-text">{task.type}</p>
                                            <p className="text-sm text-text-secondary">{task.planned_duration_minutes} minutos</p>
                                            
                                            {/* Requisito 1.1: Exibir score para exercícios concluídos */}
                                            {task.type === 'Exercícios' && task.status === 'completed' && task.tracking && (
                                                <p className="text-xs font-bold text-primary mt-1">
                                                    Score: {task.tracking.score_percentage}% ({task.tracking.questions_hit}/{task.tracking.questions_made})
                                                </p>
                                            )}
                                        </div>
                                        
                                        {task.status === 'completed' ? (
                                            <span className="text-success flex items-center font-medium">
                                                <CheckCircle size={18} className="mr-1" /> Concluído
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleTaskCompletion(subject.id, task.id, task.type)}
                                                className="bg-primary text-white text-sm px-3 py-1 rounded-full hover:bg-primary/80 transition-colors"
                                            >
                                                {task.type === 'Exercícios' ? 'Rastrear & Concluir' : 'Concluir'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="bg-background p-4 rounded-lg text-text-secondary">
                                <p>Nenhuma tarefa pendente agendada para hoje neste assunto.</p>
                            </div>
                        )
                    )}
                  </div>
                );
            })}
          </div>
        )}
      </div>

      {modalOpen && selectedTask && (
        <ExerciseTrackingModal
          task={selectedTask.task}
          subjectId={selectedTask.subjectId}
          subjectName={selectedTask.subjectName}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Schedule;
