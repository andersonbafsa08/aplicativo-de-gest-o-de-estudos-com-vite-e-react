import React from 'react';
import { useStudy } from '../context/StudyContext';
import Card from '../components/Card';
import { Book, CheckCircle, Clock, CalendarCheck } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { subjects, config, schedule } = useStudy();

  const totalSubjects = subjects.length;
  const completedSubjects = subjects.filter(s => s.completed).length;
  const upcomingReviews = subjects.filter(s => s.nextReview && new Date(s.nextReview) > new Date() && !s.completed).length;
  const totalScheduledDays = schedule.length;

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold text-text mb-8">Dashboard Analítico</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="flex flex-col items-center justify-center text-center p-6">
          <Book className="w-12 h-12 text-primary mb-3" />
          <p className="text-textSecondary text-sm">Total de Assuntos</p>
          <p className="text-4xl font-bold text-text">{totalSubjects}</p>
        </Card>
        <Card className="flex flex-col items-center justify-center text-center p-6">
          <CheckCircle className="w-12 h-12 text-success mb-3" />
          <p className="text-textSecondary text-sm">Assuntos Concluídos</p>
          <p className="text-4xl font-bold text-text">{completedSubjects}</p>
        </Card>
        <Card className="flex flex-col items-center justify-center text-center p-6">
          <CalendarCheck className="w-12 h-12 text-accent mb-3" />
          <p className="text-textSecondary text-sm">Próximas Revisões</p>
          <p className="text-4xl font-bold text-text">{upcomingReviews}</p>
        </Card>
        <Card className="flex flex-col items-center justify-center text-center p-6">
          <Clock className="w-12 h-12 text-secondary mb-3" />
          <p className="text-textSecondary text-sm">Dias Agendados</p>
          <p className="text-4xl font-bold text-text">{totalScheduledDays}</p>
        </Card>
      </div>

      <Card title="Visão Geral do Progresso" className="mb-8">
        {subjects.length === 0 ? (
          <p className="text-textSecondary italic">Importe assuntos para ver o progresso aqui.</p>
        ) : (
          <div className="space-y-4">
            {subjects.map(subject => (
              <div key={subject.id} className="flex items-center">
                <span className="text-lg text-text w-1/3">{subject.name}</span>
                <div className="flex-1 bg-background rounded-full h-3">
                  <div
                    className={`h-full rounded-full ${subject.completed ? 'bg-success' : 'bg-primary'}`}
                    style={{ width: subject.completed ? '100%' : '0%' }} // Basic progress, can be enhanced
                  ></div>
                </div>
                <span className="ml-4 text-textSecondary text-sm">
                  {subject.completed ? 'Concluído' : 'Em Andamento'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Configurações Atuais">
        <p className="text-textSecondary mb-2">
          <span className="font-semibold text-text">Período de Estudo:</span> {new Date(config.startDate).toLocaleDateString('pt-BR')} - {new Date(config.endDate).toLocaleDateString('pt-BR')}
        </p>
        <p className="text-textSecondary">
          <span className="font-semibold text-text">Horas Diárias:</span> {config.dailyStudyHours} horas
        </p>
      </Card>
    </div>
  );
};

export default Dashboard;
