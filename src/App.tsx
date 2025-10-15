import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudyProvider } from './context/StudyContext';
import Layout from './components/Layout';
import ImportSubjects from './pages/ImportSubjects';
import Configuration from './pages/Configuration';
import Schedule from './pages/Schedule';
import ProgressReview from './pages/ProgressReview';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <StudyProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<ImportSubjects />} />
            <Route path="/configuracao" element={<Configuration />} />
            <Route path="/cronograma" element={<Schedule />} />
            <Route path="/progresso" element={<ProgressReview />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Layout>
      </StudyProvider>
    </Router>
  );
}

export default App;
