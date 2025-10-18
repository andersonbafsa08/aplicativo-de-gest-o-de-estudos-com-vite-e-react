import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Calendar, TrendingUp, Settings, Upload, ChevronLeft } from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isOpen: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive, isOpen }) => {
  const baseClasses = "flex items-center rounded-xl transition-all duration-200 text-text-secondary hover:bg-surface/70";
  const activeClasses = "bg-primary/20 text-primary font-semibold shadow-glow";
  const paddingClasses = isOpen ? 'p-3' : 'p-3 justify-center';
  const textVisibility = isOpen ? 'opacity-100 transition-opacity duration-200' : 'opacity-0 hidden';

  return (
    <Link to={to} className={`${baseClasses} ${isActive ? activeClasses : ''} ${paddingClasses}`}>
      <span className={`${isOpen ? 'mr-4' : ''}`}>{icon}</span>
      <span className={textVisibility}>{label}</span>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true); // Estado para controlar a abertura/fechamento

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/', label: 'Importar Matérias', icon: <Upload size={20} /> }, // Rota raiz
    { to: '/cronograma', label: 'Cronograma', icon: <Calendar size={20} /> },
    { to: '/progresso', label: 'Revisão de Progresso', icon: <TrendingUp size={20} /> },
    { to: '/configuracao', label: 'Configurações', icon: <Settings size={20} /> },
  ];

  // Classes dinâmicas
  const sidebarWidth = isOpen ? 'w-64' : 'w-20';

  return (
    <div className={`${sidebarWidth} bg-surface flex flex-col border-r border-border-color transition-all duration-300 ease-in-out sticky top-0 h-screen flex-shrink-0`}>
      
      {/* Header e Toggle */}
      <div className={`flex ${isOpen ? 'justify-between' : 'justify-center'} items-center mb-10 ${isOpen ? 'p-6 pb-0' : 'p-4'}`}>
        {isOpen && (
          <div className="text-2xl font-bold text-primary flex items-center">
            <BookOpen className="mr-2" size={28} />
            StudyFlow
          </div>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-full text-text-secondary hover:bg-primary/20 transition-colors ${isOpen ? 'ml-auto' : ''}`}
          aria-label={isOpen ? 'Ocultar Sidebar' : 'Mostrar Sidebar'}
        >
          <ChevronLeft size={24} className={isOpen ? '' : 'rotate-180'} />
        </button>
      </div>

      <nav className={`space-y-2 ${isOpen ? 'px-6' : 'px-4'}`}>
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            isActive={location.pathname === item.to}
            isOpen={isOpen}
          />
        ))}
      </nav>
      
      {/* Footer */}
      <div className={`mt-auto pt-6 border-t border-border-color/50 ${isOpen ? 'px-6' : 'px-4'} pb-6`}>
        <p className={`text-xs text-text-secondary ${isOpen ? 'opacity-100' : 'opacity-0 hidden'} transition-opacity duration-200`}>
          © 2025 Bolt AI.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
