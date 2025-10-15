import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Book, Settings, Calendar, CheckSquare, BarChart2, Brain, Home, Repeat, X } from 'lucide-react'; // Adicionado Home, Repeat, X

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void; // Adicionado prop onClick
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick} // Passa o onClick para o NavLink
    className={({ isActive }) =>
      `flex items-center p-4 rounded-xl text-textSecondary hover:bg-background hover:text-primary transition-all duration-200 group
      ${isActive ? 'bg-background text-primary shadow-glow-primary' : ''}`
    }
  >
    <Icon className="w-6 h-6 mr-4 group-hover:scale-110 transition-transform duration-200" />
    <span className="text-lg font-medium">{label}</span>
  </NavLink>
);

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  openReviewModal: () => void; // Função para abrir o modal de revisão
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, openReviewModal }) => {
  const handleOpenReviewModal = () => {
    openReviewModal();
    onClose(); // Fecha a sidebar após abrir o modal
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 w-72 bg-surface p-6 flex flex-col shadow-lg z-50
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none lg:border-r lg:border-border
        transition-transform duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-between mb-10">
        <Link to="/" className="flex items-center" onClick={onClose}> {/* Link para a home no logo */}
          <Brain className="w-10 h-10 text-primary mr-3" />
          <h1 className="text-3xl font-bold text-text">StudyFlow</h1>
        </Link>
        <button onClick={onClose} className="text-textSecondary hover:text-error lg:hidden p-2 rounded-md hover:bg-background transition-colors duration-200" aria-label="Fechar menu lateral">
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-grow space-y-4">
        <SidebarLink to="/" icon={Home} label="Início" onClick={onClose} />
        <SidebarLink to="/importar-assuntos" icon={Book} label="Importar Assuntos" onClick={onClose} />
        <SidebarLink to="/configuracao" icon={Settings} label="Configuração" onClick={onClose} />
        <SidebarLink to="/cronograma" icon={Calendar} label="Cronograma" onClick={onClose} />
        <SidebarLink to="/progresso" icon={CheckSquare} label="Progresso & Revisão" onClick={onClose} />
        <SidebarLink to="/dashboard" icon={BarChart2} label="Dashboard Analítico" onClick={onClose} />
        <button
          onClick={handleOpenReviewModal}
          className="flex items-center p-4 rounded-xl text-textSecondary hover:bg-background hover:text-accent transition-all duration-200 group w-full text-left"
          aria-label="Abrir revisões pendentes"
        >
          <Repeat className="w-6 h-6 mr-4 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-lg font-medium">Revisões Pendentes</span>
        </button>
      </nav>
      <div className="mt-auto pt-6 border-t border-border text-textSecondary text-sm text-center">
        <p>&copy; 2025 StudyFlow. Todos os direitos reservados.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
