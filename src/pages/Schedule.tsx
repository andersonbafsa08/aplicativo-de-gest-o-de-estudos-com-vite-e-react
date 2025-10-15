import React from 'react';
import { useStudy } from '../context/StudyContext';
import Card from '../components/Card';
import { Download, CalendarDays, BookOpen, CheckCircle, Clock } from 'lucide-react';
import jsPDF from 'jspdf';

const Schedule: React.FC = () => {
  const { schedule, subjects } = useStudy();

  const getSubjectName = (id: string) => {
    return subjects.find(s => s.id === id)?.name || 'Assunto Desconhecido';
  };

  const getSubjectStatus = (id: string) => {
    const subject = subjects.find(s => s.id === id);
    if (!subject) return { text: '', color: '' };
    if (subject.completed) return { text: 'Concluído', color: 'text-success', icon: <CheckCircle className="w-4 h-4 mr-1" /> };
    if (subject.nextReview) {
      const today = new Date().toISOString().split('T')[0];
      if (subject.nextReview <= today) {
        return { text: 'Revisão Pendente', color: 'text-warning', icon: <Clock className="w-4 h-4 mr-1" /> };
      }
    }
    return { text: '', color: '' };
  };

  const exportScheduleToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Cronograma de Estudos', 10, 20);
    doc.setFontSize(12);

    let y = 30;
    if (schedule.length === 0) {
      doc.text('Nenhum cronograma gerado ainda.', 10, y);
    } else {
      schedule.forEach((entry) => {
        if (y > 280) { // Check if page break is needed
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(14);
        doc.text(`Data: ${new Date(entry.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 10, y);
        y += 10;
        if (entry.subjects.length === 0) {
          doc.setFontSize(12);
          doc.text('  Nenhum assunto agendado para este dia.', 15, y);
          y += 10;
        } else {
          entry.subjects.forEach((subjectId) => {
            const subjectName = getSubjectName(subjectId);
            const status = getSubjectStatus(subjectId);
            doc.setFontSize(12);
            doc.text(`  - ${subjectName} ${status.text ? `(${status.text})` : ''}`, 15, y);
            y += 7;
          });
        }
        y += 5; // Space between days
      });
    }

    doc.save('cronograma_de_estudos.pdf');
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold text-text mb-8">Cronograma de Estudos</h1>
      <Card title="Seu Cronograma Gerado">
        {schedule.length === 0 ? (
          <p className="text-textSecondary italic">Nenhum cronograma gerado ainda. Vá para a tela de Configuração para gerar um.</p>
        ) : (
          <>
            <button
              onClick={exportScheduleToPDF}
              className="mb-6 w-full bg-accent text-white py-3 px-6 rounded-xl text-lg font-semibold hover:bg-fuchsia-600 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-glow-primary"
            >
              <Download className="w-5 h-5 mr-2" />
              Exportar para PDF
            </button>
            <div className="space-y-6">
              {schedule.map((entry) => (
                <div key={entry.date} className="bg-surface p-5 rounded-xl border border-border shadow-md animate-slide-in-left">
                  <h3 className="text-xl font-semibold text-primary mb-3 flex items-center">
                    <CalendarDays className="w-5 h-5 mr-2" />
                    {new Date(entry.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h3>
                  {entry.subjects.length === 0 ? (
                    <p className="text-textSecondary">Nenhum assunto agendado para este dia.</p>
                  ) : (
                    <ul className="list-none space-y-2 pl-0">
                      {entry.subjects.map((subjectId) => {
                        const status = getSubjectStatus(subjectId);
                        return (
                          <li key={subjectId} className="text-textSecondary flex items-center">
                            <BookOpen className="w-4 h-4 mr-2 text-primary" />
                            {getSubjectName(subjectId)}
                            {status.text && (
                              <span className={`ml-2 text-sm flex items-center ${status.color}`}>
                                {status.icon} {status.text}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Schedule;
