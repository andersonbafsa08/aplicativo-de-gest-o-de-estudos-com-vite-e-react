import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudyProvider } from './context/StudyContext';
import Layout from './components/Layout'; // Layout agora gerencia a sidebar e o header
import Dashboard from './pages/Dashboard';
import ImportSubjects from './pages/ImportSubjects';
import Configuration from './pages/Configuration';
import ProgressReview from './pages/ProgressReview';
import Schedule from './pages/Schedule';
import ReviewModal from './components/ReviewModal';
import QuestionControlModal from './components/QuestionControlModal';
import { Subject } from './context/StudyContext';

const App: React.FC = () => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isQuestionControlModalOpen, setIsQuestionControlModalOpen] = useState(false);
  const [selectedSubjectForQuestions, setSelectedSubjectForQuestions] = useState<Subject | null>(null);

  const openReviewModal = () => setIsReviewModalOpen(true);
  const closeReviewModal = () => setIsReviewModalOpen(false);

  const openQuestionControlModal = (subject: Subject) => {
    setSelectedSubjectForQuestions(subject);
    setIsQuestionControlModalOpen(true);
  };
  const closeQuestionControlModal = () => {
    setSelectedSubjectForQuestions(null);
    setIsQuestionControlModalOpen(false);
  };

  return (
    <Router>
      <StudyProvider>
        {/* O Layout agora envolve as rotas e gerencia a sidebar, header e footer */}
        <Layout openReviewModal={openReviewModal}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/importar-assuntos" element={<ImportSubjects />} />
            <Route path="/configuracao" element={<Configuration />} />
            <Route path="/progresso" element={<ProgressReview openQuestionControlModal={openQuestionControlModal} />} />
            <Route path="/cronograma" element={<Schedule />} />
            <Route path="/dashboard" element={<Dashboard />} /> {/* Adicionado rota explícita para dashboard */}
          </Routes>
        </Layout>

        <ReviewModal isOpen={isReviewModalOpen} onClose={closeReviewModal} />
        <QuestionControlModal
          isOpen={isQuestionControlModalOpen}
          onClose={closeQuestionControlModal}
          subject={selectedSubjectForQuestions}
        />
      </StudyProvider>
    </Router>
  );
};

export default App;
