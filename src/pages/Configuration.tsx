import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import Card from '../components/Card';
import { PlayCircle, Save } from 'lucide-react';

const Configuration: React.FC = () => {
  const { config, updateConfig, generateSchedule } = useStudy();
  const [startDate, setStartDate] = useState(config.startDate);
  const [endDate, setEndDate] = useState(config.endDate);
  const [dailyStudyHours, setDailyStudyHours] = useState(config.dailyStudyHours);

  useEffect(() => {
    setStartDate(config.startDate);
    setEndDate(config.endDate);
    setDailyStudyHours(config.dailyStudyHours);
  }, [config]);

  const handleSaveConfig = () => {
    updateConfig({ startDate, endDate, dailyStudyHours: Number(dailyStudyHours) });
    alert('Configuração salva com sucesso!');
  };

  const handleGenerateSchedule = () => {
    handleSaveConfig(); // Ensure config is saved before generating
    generateSchedule();
    alert('Cronograma gerado com base nas suas configurações!');
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold text-text mb-8">Configuração de Estudo</h1>
      <Card title="Definir Período e Horas de Estudo">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="startDate" className="block text-textSecondary text-sm font-medium mb-2">
              Data de Início
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-textSecondary text-sm font-medium mb-2">
              Data de Término
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
            />
          </div>
        </div>
        <div className="mb-6">
          <label htmlFor="dailyHours" className="block text-textSecondary text-sm font-medium mb-2">
            Horas Diárias de Estudo
          </label>
          <input
            type="number"
            id="dailyHours"
            value={dailyStudyHours}
            onChange={(e) => setDailyStudyHours(Number(e.target.value))}
            min="0.5"
            step="0.5"
            className="w-full p-3 bg-background border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSaveConfig}
            className="flex-1 bg-primary text-white py-3 px-6 rounded-xl text-lg font-semibold hover:bg-primary-dark transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-glow-primary"
          >
            <Save className="w-5 h-5 mr-2" />
            Salvar Configuração
          </button>
          <button
            onClick={handleGenerateSchedule}
            className="flex-1 bg-secondary text-white py-3 px-6 rounded-xl text-lg font-semibold hover:bg-secondary-dark transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-glow-secondary"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            Gerar Cronograma
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Configuration;
