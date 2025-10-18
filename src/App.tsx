import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ImportSubjects from './pages/ImportSubjects';
import Schedule from './pages/Schedule';
import ProgressReview from './pages/ProgressReview';
import Configuration from './pages/Configuration';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Rota raiz que corresponde ao link "Importar Matérias" no Sidebar */}
          <Route path="/" element={<ImportSubjects />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cronograma" element={<Schedule />} />
          <Route path="/progresso" element={<ProgressReview />} />
          <Route path="/configuracao" element={<Configuration />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
