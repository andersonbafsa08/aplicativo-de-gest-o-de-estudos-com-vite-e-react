import React from 'react';
import { Subject } from '../context/StudyContext';
import { X, BarChart2, CalendarDays, CheckCircle, XCircle } from 'lucide-react';

interface QuestionControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null; // O assunto para o qual exibir o histórico
}

const QuestionControlModal: React.FC<QuestionControlModalProps> = ({ isOpen, onClose, subject }) => {
  if (!isOpen || !subject) return null;

  const sortedHistory = [...subject.questionHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-surface p-8 rounded-2xl shadow-2xl border border-border w-full max-w-3xl max-h-[90vh] overflow-y-auto transform scale-95 animate-scale-in">
        <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
          <h2 className="text-3xl font-bold text-accent flex items-center">
            <BarChart2 className="w-7 h-7 mr-3" /> Controle de Questões: {subject.name}
          </h2>
          <button
            onClick={onClose}
            className="text-textSecondary hover:text-error transition-colors duration-200 p-2 rounded-full hover:bg-red-900/20"
            aria-label="Fechar modal de controle de questões"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {sortedHistory.length === 0 ? (
          <p className="text-textSecondary italic text-center py-8">
            Nenhum histórico de questões para este assunto ainda.
          </p>
        ) : (
          <div className="space-y-4">
            {sortedHistory.map((entry, index) => (
              <div key={index} className="bg-background p-4 rounded-xl border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between animate-slide-in-left">
                <div className="mb-2 sm:mb-0">
                  <p className="text-lg font-semibold text-text flex items-center">
                    <CalendarDays className="w-5 h-5 mr-2 text-primary" />
                    {new Date(entry.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-textSecondary text-sm mt-1">
                    Questões Feitas: <span className="font-medium text-text">{entry.made}</span>
                  </p>
                  <p className="text-textSecondary text-sm">
                    Acertos: <span className="font-medium text-success">{entry.correct}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text text-lg font-bold">
                    Precisão:
                  </span>
                  <span className={`text-lg font-bold ${entry.made > 0 ? (entry.correct / entry.made * 100 >= 70 ? 'text-success' : entry.correct / entry.made * 100 >= 50 ? 'text-warning' : 'text-error') : 'text-textSecondary'}`}>
                    {entry.made > 0 ? `${Math.round((entry.correct / entry.made) * 100)}%` : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionControlModal;
