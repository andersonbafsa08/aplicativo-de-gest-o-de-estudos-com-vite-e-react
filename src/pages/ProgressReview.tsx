import React from 'react';
import { useStudy } from '../context/StudyContext';
import { Repeat, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const ProgressReview: React.FC = () => {
  const { revisions, completeRevision } = useStudy();
  const today = new Date().toISOString().split('T')[0];

  const pendingRevisions = revisions.filter(r => r.status === 'pending').sort((a, b) => a.due_date.localeCompare(b.due_date));
  const completedRevisions = revisions.filter(r => r.status === 'completed');

  const getStatusColor = (revision: typeof revisions[0]) => {
    if (revision.status === 'completed') return 'text-success';
    if (revision.due_date < today) return 'text-error';
    return 'text-warning';
  };

  const getStatusText = (revision: typeof revisions[0]) => {
    if (revision.status === 'completed') return 'Concluída';
    if (revision.due_date < today) return 'Atrasada';
    return 'Pendente';
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-text border-b border-border-color pb-4 flex items-center">
        <Repeat className="mr-3 text-accent" size={32} />
        Fila de Revisões (Repetição Espaçada)
      </h1>

      <div className="bg-surface p-6 rounded-xl shadow-lg border border-border-color">
        <h2 className="text-2xl font-semibold text-text mb-4">Próximas Revisões ({pendingRevisions.length})</h2>
        
        {pendingRevisions.length === 0 ? (
          <div className="text-center py-10 text-text-secondary">
            <CheckCircle className="mx-auto mb-3 text-success" size={40} />
            <p>Nenhuma revisão pendente. Continue estudando para agendar novos ciclos!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRevisions.map((rev) => (
              <div
                key={rev.id}
                className={`flex items-center bg-background p-4 rounded-lg border-l-4 transition-shadow duration-300 ${rev.due_date < today ? 'border-error' : 'border-warning'}`}
              >
                <Clock className="text-text-secondary mr-4 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <p className="font-semibold text-text">{rev.subject_name}</p>
                  <p className="text-sm text-text-secondary">Ciclo de {rev.cycle_day} dias | Vencimento: {new Date(rev.due_date).toLocaleDateString('pt-BR')}</p>
                </div>
                
                <span className={`text-sm font-medium mr-4 ${getStatusColor(rev)}`}>
                    {getStatusText(rev)}
                </span>

                <button
                    onClick={() => completeRevision(rev.id)}
                    className="bg-primary text-white text-sm px-3 py-1 rounded-full hover:bg-primary/80 transition-colors"
                >
                    Revisar Agora
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface p-6 rounded-xl shadow-lg border border-border-color">
        <h2 className="text-2xl font-semibold text-text mb-4">Histórico de Revisões Concluídas ({completedRevisions.length})</h2>
        <ul className="space-y-3 max-h-60 overflow-y-auto">
            {completedRevisions.map(rev => (
                <li key={rev.id} className="flex justify-between items-center text-text-secondary border-b border-border-color pb-2">
                    <span>{rev.subject_name} (Ciclo {rev.cycle_day} dias)</span>
                    <span className="text-success text-sm flex items-center"><CheckCircle size={16} className="mr-1" /> Concluído em {new Date(rev.due_date).toLocaleDateString('pt-BR')}</span>
                </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default ProgressReview;
