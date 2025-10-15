import React from 'react';
import { useStudy, Subject } from '../context/StudyContext';
import { X, Repeat, CalendarCheck, Clock, CheckCircle } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose }) => {
  const { getSubjectsForReview, scheduleNextReview } = useStudy();
  const today = new Date().toISOString().split('T')[0];
  const subjectsForReview = getSubjectsForReview(today);

  if (!isOpen) return null;

  const handleScheduleNextReview = (subjectId: string) => {
    scheduleNextReview(subjectId);
    // Optionally, refresh the list or close the modal
    // For now, just close and let the parent re-render
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-surface p-8 rounded-2xl shadow-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-95 animate-scale-in">
        <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
          <h2 className="text-3xl font-bold text-primary flex items-center">
            <Repeat className="w-7 h-7 mr-3" /> Revisões Pendentes
          </h2>
          <button
            onClick={onClose}
            className="text-textSecondary hover:text-error transition-colors duration-200 p-2 rounded-full hover:bg-red-900/20"
            aria-label="Fechar modal de revisões"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {subjectsForReview.length === 0 ? (
          <p className="text-textSecondary italic text-center py-8">
            Nenhuma revisão pendente para hoje. Continue assim!
          </p>
        ) : (
          <ul className="space-y-4">
            {subjectsForReview.map((subject) => (
              <li key={subject.id} className="bg-background p-4 rounded-xl border border-border flex items-center justify-between animate-slide-in-left">
                <div>
                  <p className="text-xl font-semibold text-text">{subject.name}</p>
                  {subject.materia && (
                    <span className="text-textSecondary text-sm bg-surface px-2 py-1 rounded-md border border-border mt-1 inline-block">
                      <FileText className="inline-block w-3 h-3 mr-1" /> {subject.materia}
                    </span>
                  )}
                  <p className="text-textSecondary text-sm mt-2 flex items-center">
                    <CalendarCheck className="w-4 h-4 mr-1" /> Última revisão: {subject.lastStudied ? new Date(subject.lastStudied).toLocaleDateString('pt-BR') : 'Nunca'}
                  </p>
                  <p className="text-warning text-sm mt-1 flex items-center">
                    <Clock className="w-4 h-4 mr-1" /> Vencida em: {subject.nextReview ? new Date(subject.nextReview).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => handleScheduleNextReview(subject.id)}
                  className="bg-primary text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-all duration-200 flex items-center shadow-md hover:shadow-glow-primary"
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Marcar como Revisado
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
