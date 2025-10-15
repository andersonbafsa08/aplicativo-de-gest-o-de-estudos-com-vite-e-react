import React, { useState, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import Card from '../components/Card';
import { PlusCircle, XCircle, CheckCircle, UploadCloud, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import * as pdfjs from 'pdfjs-dist';

// Configura o worker do pdfjs-dist
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ImportSubjects: React.FC = () => {
  const { importSubjects, removeSubject, subjects } = useStudy();
  const [subjectInput, setSubjectInput] = useState('');
  const [materiaInput, setMateriaInput] = useState(''); // Novo estado para a matéria
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    if (subjectInput.trim()) {
      const newSubjects = subjectInput.split('\n').map(s => s.trim()).filter(s => s.length > 0);
      importSubjects(newSubjects, materiaInput.trim() || 'Geral'); // Passa a matéria
      setSubjectInput('');
      setMateriaInput(''); // Limpa o campo da matéria após a importação manual
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    let newSubjects: string[] = [];
    const currentMateria = materiaInput.trim() || 'Geral'; // Usa a matéria do input ou 'Geral'

    if (file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        newSubjects = text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
        if (newSubjects.length > 0) {
          importSubjects(newSubjects, currentMateria);
        }
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        newSubjects = json.slice(1).map(row => row[0]?.toString().trim()).filter(s => s && s.length > 0) as string[];
        if (newSubjects.length > 0) {
          importSubjects(newSubjects, currentMateria);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (file.name.endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result as ArrayBuffer;
        const pdf = await pdfjs.getDocument({ data }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
        }
        // Simplesmente divide o texto por linhas para obter assuntos
        newSubjects = fullText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
        if (newSubjects.length > 0) {
          importSubjects(newSubjects, currentMateria);
        }
      };
      reader.readAsArrayBuffer(file);
    }

    // Limpa o valor do input de arquivo para permitir re-importar o mesmo arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setMateriaInput(''); // Limpa o campo da matéria após a importação de arquivo
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold text-text mb-8">Importar Assuntos</h1>
      <Card title="Adicionar Novos Assuntos">
        <p className="text-textSecondary mb-4">
          Insira os nomes dos assuntos ou tópicos, um por linha, ou importe de um arquivo CSV/XLSX/PDF.
        </p>
        <div className="mb-4">
          <label htmlFor="materiaInput" className="block text-textSecondary text-sm font-medium mb-2">
            Matéria (Opcional, ex: Matemática, História)
          </label>
          <input
            type="text"
            id="materiaInput"
            className="w-full p-4 bg-background border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
            placeholder="Ex: Cálculo I"
            value={materiaInput}
            onChange={(e) => setMateriaInput(e.target.value)}
          />
        </div>
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
          Importar Assuntos (Manual)
        </button>

        <div className="mt-4 border-t border-border pt-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.xlsx,.pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-secondary text-white py-3 px-6 rounded-xl text-lg font-semibold hover:bg-secondary-dark transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-glow-secondary"
          >
            <UploadCloud className="w-5 h-5 mr-2" />
            Importar de Arquivo (.csv, .xlsx, .pdf)
          </button>
        </div>
      </Card>

      <Card title="Assuntos Atuais" className="mt-8">
        {subjects.length === 0 ? (
          <p className="text-textSecondary italic">Nenhum assunto importado ainda.</p>
        ) : (
          <ul className="space-y-3">
            {subjects.map((subject) => (
              <li key={subject.id} className="flex items-center bg-surface p-3 rounded-xl border border-border shadow-sm animate-slide-in-left">
                <span className="text-text text-lg flex-grow">{subject.name}</span>
                {subject.materia && (
                  <span className="ml-2 text-textSecondary text-sm bg-background px-2 py-1 rounded-md border border-border">
                    <FileText className="inline-block w-3 h-3 mr-1" /> {subject.materia}
                  </span>
                )}
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
