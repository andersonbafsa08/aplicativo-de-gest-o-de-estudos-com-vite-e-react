import React from 'react';
import { NavLink } from 'react-router-dom';
import { Book, Settings, Calendar, CheckSquare, BarChart2, Brain } from 'lucide-react';

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center p-4 rounded-xl text-textSecondary hover:bg-surface hover:text-primary transition-all duration-200 group
      ${isActive ? 'bg-surface text-primary shadow-glow-primary' : ''}`
    }
  >
    <Icon className="w-6 h-6 mr-4 group-hover:scale-110 transition-transform duration-200" />
    <span className="text-lg font-medium">{label}</span>
  </NavLink>
);

const Sidebar: React.FC = () => {
  return (
    <aside className="w-72 bg-surface p-6 flex flex-col shadow-lg rounded-3xl m-4">
      <div className="flex items-center justify-center mb-10">
        <Brain className="w-10 h-10 text-primary mr-3" />
        <h1 className="text-3xl font-bold text-text">StudyFlow</h1>
      </div>
      <nav className="flex-grow space-y-4">
        <SidebarLink to="/" icon={Book} label="Importar Assuntos" />
        <SidebarLink to="/configuracao" icon={Settings} label="Configuração" />
        <SidebarLink to="/cronograma" icon={Calendar} label="Cronograma" />
        <SidebarLink to="/progresso" icon={CheckSquare} label="Progresso & Revisão" />
        <SidebarLink to="/dashboard" icon={BarChart2} label="Dashboard Analítico" />
      </nav>
      <div className="mt-auto pt-6 border-t border-border text-textSecondary text-sm text-center">
        <p>&copy; 2025 StudyFlow. Todos os direitos reservados.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
