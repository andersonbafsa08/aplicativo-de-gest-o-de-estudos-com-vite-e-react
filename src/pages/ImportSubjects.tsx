import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import Card from '../components/Card';
import { PlusCircle, XCircle } from 'lucide-react';

const ImportSubjects: React.FC = () => {
  const { importSubjects, removeSubject, subjects } = useStudy();
  const [subjectInput, setSubjectInput] = useState('');

  const handleImport = () => {
    if (subjectInput.trim()) {
      const newSubjects = subjectInput.split('\n').map(s => s.trim()).filter(s => s.length > 0);
      importSubjects(newSubjects);
      setSubjectInput('');
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold text-text mb-8">Importar Assuntos</h1>
      <Card title="Adicionar Novos Assuntos">
        <p className="text-textSecondary mb-4">
          Insira os nomes dos assuntos ou tópicos, um por linha.
        </p>
        <textarea
          className="w-full p-4 bg-background border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 resize-y min-h-[150px]"
          placeholder="Ex: Matemática&#10;Português&#10;História do Brasil"
          value={subjectInput}
          onChange={(e) => setSubjectInput(e.target.value)}
        ></textarea>
        <button
          onClick={handleImport}
          className="mt-6 w-full bg-primary text-white py-3 px-6 rounded-xl text-lg font-semibold hover:bg-primary-dark transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-glow-primary"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Importar Assuntos
        </button>
      </Card>

      <Card title="Assuntos Atuais" className="mt-8">
        {subjects.length === 0 ? (
          <p className="text-textSecondary italic">Nenhum assunto importado ainda.</p>
        ) : (
          <ul className="space-y-3">
            {subjects.map((subject) => (
              <li key={subject.id} className="flex items-center bg-surface p-3 rounded-xl border border-border shadow-sm animate-slide-in-left">
                <span className="text-text text-lg flex-grow">{subject.name}</span>
                {subject.completed && (
                  <span className="ml-4 text-success text-sm flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" /> Concluído
                  </span>
                )}
                <button
                  onClick={() => removeSubject(subject.id)}
                  className="ml-4 text-error hover:text-red-600 transition-colors duration-200 p-1 rounded-full hover:bg-red-900/20"
                  aria-label={`Remover assunto ${subject.name}`}
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default ImportSubjects;
