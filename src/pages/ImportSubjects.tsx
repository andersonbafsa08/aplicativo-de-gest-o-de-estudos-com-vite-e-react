import React, { useState, useRef } from 'react';
import { Upload, Zap, Calendar, Clock, CheckCircle, FileText } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

const ImportSubjects: React.FC = () => {
  const { addSubject } = useStudy();
  const [step, setStep] = useState(1);
  const [subjectName, setSubjectName] = useState('');
  const [editalName, setEditalName] = useState('');
  
  // Novos estados para o planejamento detalhado (DB Schema)
  const [dailyTime, setDailyTime] = useState(2); // hoursPerDay
  const [daysPerWeek, setDaysPerWeek] = useState(5); // weeklyFrequency
  const [maxHoursPerSession, setMaxHoursPerSession] = useState(1.5); // maxHoursPerSession
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName || !deadline || !editalName) return;

    setLoading(true);
    
    try {
        // Chamada atualizada com todos os parâmetros do DB
        await addSubject(
            subjectName, 
            editalName, 
            deadline, 
            dailyTime, 
            daysPerWeek, 
            maxHoursPerSession
        );
        setStep(3); // Confirmação
    } catch (error) {
        console.error("Erro ao adicionar assunto:", error);
        alert("Erro ao salvar o cronograma. Verifique o console.");
    } finally {
        setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      
      // Simulação da Análise de IA (IMEDIATA)
      const extractedSubjectName = file.name.replace(/\.(pdf|docx|xlsx)$/i, '').trim() || 'Novo Assunto Analisado';
      
      setSubjectName(extractedSubjectName);
      setLoading(false);
      setStep(2);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-text border-b border-border-color pb-4 flex items-center">
        <Upload className="mr-3 text-secondary" size={32} />
        Importar Matérias e Agendamento Inteligente
      </h1>

      <div className="bg-surface p-8 rounded-xl shadow-lg border border-border-color max-w-3xl mx-auto">
        
        {step === 1 && (
          <div className="text-center space-y-6">
            <Zap className="mx-auto text-primary" size={48} />
            <h2 className="text-2xl font-semibold text-text">Passo 1: Importar Conteúdo</h2>
            <p className="text-text-secondary">Faça o upload de seus materiais (PDF, DOCX, XLSX) para que a IA possa analisar o conteúdo e sugerir um cronograma.</p>
            
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx,.xlsx"
            />

            <div 
                className="border-2 border-dashed border-border-color p-10 rounded-lg hover:border-primary transition-colors cursor-pointer" 
                onClick={handleImportClick}
            >
                <FileText className="mx-auto text-text-secondary mb-3" size={32} />
                <p className="text-text-secondary">Clique para selecionar ou arraste e solte arquivos.</p>
                <p className="text-sm text-primary mt-2">Arquivos suportados: PDF, DOCX, XLSX.</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleGenerateSchedule} className="space-y-6">
            <Zap className="text-primary" size={32} />
            <h2 className="text-2xl font-semibold text-text">Passo 2: Gerar Cronograma Inteligente</h2>
            <p className="text-text-secondary">A IA analisou o arquivo. Agora, defina o Edital e suas restrições para otimizar o plano de estudos.</p>

            {/* Nome do Edital/Concurso */}
            <div>
              <label htmlFor="editalName" className="block text-sm font-medium text-text-secondary mb-1">Nome do Edital/Concurso</label>
              <input
                type="text"
                id="editalName"
                value={editalName}
                onChange={(e) => setEditalName(e.target.value)}
                placeholder="Ex: Concurso INSS 2026"
                className="w-full p-3 rounded-lg bg-background border border-border-color text-text focus:border-secondary focus:ring-secondary transition-colors"
                required
              />
            </div>

            {/* Nome da Matéria */}
            <div>
              <label htmlFor="subjectName" className="block text-sm font-medium text-text-secondary mb-1">Nome da Matéria (Sugerido pela IA)</label>
              <input
                type="text"
                id="subjectName"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full p-3 rounded-lg bg-background border border-border-color text-text focus:border-primary focus:ring-primary transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tempo Diário (hoursPerDay) */}
              <div>
                <label htmlFor="dailyTime" className="block text-sm font-medium text-text-secondary mb-1">Tempo Diário (horas)</label>
                <input
                  type="number"
                  id="dailyTime"
                  value={dailyTime}
                  onChange={(e) => setDailyTime(parseFloat(e.target.value))}
                  min="0.5"
                  max="10"
                  step="0.5"
                  className="w-full p-3 rounded-lg bg-background border border-border-color text-text focus:border-primary focus:ring-primary transition-colors"
                  required
                />
              </div>

              {/* Dias por Semana (weeklyFrequency) */}
              <div>
                <label htmlFor="daysPerWeek" className="block text-sm font-medium text-text-secondary mb-1">Dias por Semana</label>
                <input
                  type="number"
                  id="daysPerWeek"
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(parseInt(e.target.value))}
                  min="1"
                  max="7"
                  className="w-full p-3 rounded-lg bg-background border border-border-color text-text focus:border-primary focus:ring-primary transition-colors"
                  required
                />
              </div>

              {/* Máximo por Sessão (maxHoursPerSession) */}
              <div>
                <label htmlFor="maxHoursPerSession" className="block text-sm font-medium text-text-secondary mb-1">Máx. por Sessão (horas)</label>
                <input
                  type="number"
                  id="maxHoursPerSession"
                  value={maxHoursPerSession}
                  onChange={(e) => setMaxHoursPerSession(parseFloat(e.target.value))}
                  min="0.5"
                  max={dailyTime}
                  step="0.5"
                  className="w-full p-3 rounded-lg bg-background border border-border-color text-text focus:border-primary focus:ring-primary transition-colors"
                  required
                />
              </div>
            </div>
            
            {/* Data Limite */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-text-secondary mb-1">Data Limite da Prova</label>
              <input
                type="date"
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={today}
                className="w-full p-3 rounded-lg bg-background border border-border-color text-text focus:border-primary focus:ring-primary transition-colors"
                required
              />
            </div>


            <button 
              type="submit" 
              className={`w-full p-3 rounded-lg font-semibold transition-colors flex items-center justify-center ${loading ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30'}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Clock className="animate-spin mr-2" size={20} />
                  Gerando Cronograma...
                </>
              ) : (
                <>
                  <Calendar className="mr-2" size={20} />
                  Gerar Cronograma Automaticamente
                </>
              )}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-6">
            <CheckCircle className="mx-auto text-success" size={48} />
            <h2 className="text-2xl font-semibold text-text">Sucesso! Cronograma Gerado.</h2>
            <p className="text-text-secondary">O cronograma para **{subjectName}** (Edital: **{editalName}**) foi criado e persistido no Supabase. Acesse a aba **Cronograma** para começar a estudar.</p>
            <button 
              onClick={() => {
                setStep(1);
                setSubjectName('');
                setEditalName('');
              }}
              className="bg-secondary text-white p-3 rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
            >
              Importar Outra Matéria
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportSubjects;
