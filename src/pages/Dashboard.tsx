import React from 'react';
import { useStudy } from '../context/StudyContext';
import { Clock, BookOpen, CheckCircle, TrendingUp, Zap, Target } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { subjects, revisions } = useStudy();

  const totalSubjects = subjects.length;
  const completedSubjects = subjects.filter(s => s.progress_percentage === 100).length;
  const totalPlannedHours = subjects.reduce((sum, sub) => sum + sub.total_planned_hours, 0);
  
  // Cálculo de horas estudadas (simulado pela duração das tarefas concluídas)
  const totalHoursStudied = subjects.reduce((subSum, sub) => 
    subSum + sub.tasks.filter(t => t.status === 'completed').reduce((taskSum, t) => taskSum + t.planned_duration_minutes, 0) / 60, 0
  );

  const overallCompletionPercentage = totalPlannedHours > 0 ? Math.round((totalHoursStudied / totalPlannedHours) * 100) : 0;
  const averageScore = subjects.filter(s => s.overall_score > 0).reduce((sum, s) => sum + s.overall_score, 0) / (subjects.filter(s => s.overall_score > 0).length || 1);
  const upcomingRevisions = revisions.filter(r => r.status === 'pending').length;

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-surface p-6 rounded-xl shadow-xl flex items-center justify-between border border-border hover:border-primary transition-all duration-300 transform hover:scale-[1.02]">
      <div>
        <p className="text-sm text-text-secondary uppercase tracking-wider">{title}</p>
        <h2 className="text-3xl font-bold mt-1 text-text">{value}</h2>
      </div>
      <div className={`p-3 rounded-full bg-opacity-20`} style={{ backgroundColor: color + '33', color: color }}>
        {icon}
      </div>
    </div>
  );

  // Simulação de IA: Garantir que haja assuntos para evitar erros
  const activeSubjects = subjects.filter(s => s.progress_percentage < 100);
  const strongSubject = subjects.reduce((best, current) => (current.overall_score > best.overall_score ? current : best), subjects[0] || { name: 'N/A', overall_score: 0 });
  const weakSubject = subjects.reduce((worst, current) => (current.overall_score < worst.overall_score ? current : worst), subjects[0] || { name: 'N/A', overall_score: 100 });
  
  let recommendation = "Importe uma matéria para receber recomendações personalizadas.";
  if (activeSubjects.length > 0) {
    recommendation = overallCompletionPercentage < 50 ? `Foque em ${weakSubject.name} para equilibrar o progresso.` : `Mantenha o ritmo e revise ${strongSubject.name} amanhã.`;
  }


  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-extrabold text-text border-b border-border-color pb-4">
        Visão Geral do Estudo
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Progresso Geral"
          value={`${overallCompletionPercentage}%`}
          icon={<Target size={24} />}
          color="#9E7FFF"
        />
        <StatCard
          title="Horas Dedicadas"
          value={`${totalHoursStudied.toFixed(1)}h`}
          icon={<Clock size={24} />}
          color="#38bdf8"
        />
        <StatCard
          title="Pontuação Média"
          value={`${averageScore.toFixed(0)}%`}
          icon={<TrendingUp size={24} />}
          color="#f472b6"
        />
        <StatCard
          title="Próximas Revisões"
          value={upcomingRevisions}
          icon={<CheckCircle size={24} />}
          color="#10b981"
        />
      </div>

      {/* Painel de Resumo e Recomendações (IA) */}
      <div className="bg-surface p-6 rounded-xl shadow-lg border border-border-color">
        <h2 className="text-2xl font-semibold text-text mb-4 flex items-center">
          <Zap className="mr-2 text-accent" size={24} />
          Análise e Recomendações (IA)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-text-secondary">
            <p><strong>Assunto Forte:</strong> {strongSubject.name} ({strongSubject.overall_score}%)</p>
            <p><strong>Assunto Fraco:</strong> {weakSubject.name} ({weakSubject.overall_score}%)</p>
            <p className="col-span-full text-lg text-primary font-medium mt-2">
                Recomendação de Foco: {recommendation}
            </p>
        </div>
      </div>

      {/* Progresso por Matéria */}
      <div className="bg-surface p-6 rounded-xl shadow-lg border border-border-color">
        <h2 className="text-2xl font-semibold text-text mb-4">Progresso Detalhado por Matéria</h2>
        <ul className="space-y-4">
          {subjects.map((subject) => {
            const progress = subject.progress_percentage;
            const progressColor = progress >= 75 ? 'bg-success' : progress >= 40 ? 'bg-warning' : 'bg-error';

            return (
              <li key={subject.id} className="flex flex-col space-y-1">
                <div className="flex justify-between text-text">
                  <span className="font-medium" style={{ color: subject.color }}>{subject.name}</span>
                  <span className="text-sm text-text-secondary">
                    Progresso: {progress}% | Pontuação: {subject.overall_score}%
                  </span>
                </div>
                <div className="w-full bg-border-color rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${progress}%`, backgroundColor: subject.color }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
