import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, icon: Icon, children }) => {
  return (
    <header className="mb-10 border-b border-border pb-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Icon className="w-8 h-8 mr-3 text-primary" />
          <h2 className="text-4xl font-extrabold text-text">{title}</h2>
        </div>
        {children}
      </div>
      <p className="text-textSecondary mt-2 ml-11">{description}</p>
    </header>
  );
};

export default PageHeader;
