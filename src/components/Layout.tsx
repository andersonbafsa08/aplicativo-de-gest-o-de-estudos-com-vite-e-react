import React, { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react'; // Importar o ícone de menu

interface LayoutProps {
  children: ReactNode;
  openReviewModal: () => void; // Passar a função para abrir o modal de revisão
}

const Layout: React.FC<LayoutProps> = ({ children, openReviewModal }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-background font-sans text-text">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} openReviewModal={openReviewModal} />

      {/* Backdrop para fechar a sidebar em telas pequenas */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Conteúdo principal e cabeçalho */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        {/* Novo Header */}
        <header className="bg-surface shadow-lg py-4 px-6 flex items-center sticky top-0 z-30 border-b border-border">
          <button onClick={toggleSidebar} className="text-text hover:text-primary lg:hidden mr-4 p-2 rounded-md hover:bg-background transition-colors duration-200" aria-label="Abrir menu lateral">
            <Menu className="w-7 h-7" />
          </button>
          <Link to="/" className="text-2xl font-bold text-primary hover:text-primary-dark transition-colors duration-200">
            StudyFlow
          </Link>
          {/* Outros elementos do cabeçalho podem ser adicionados aqui */}
        </header>

        <main className="flex-grow p-8 overflow-auto">
          {children}
        </main>

        <footer className="bg-surface text-textSecondary py-6 px-6 text-center border-t border-border mt-auto">
          <p>&copy; {new Date().getFullYear()} StudyFlow. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
