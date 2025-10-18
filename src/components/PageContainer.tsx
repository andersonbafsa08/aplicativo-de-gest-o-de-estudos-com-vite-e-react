import React, { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  description: string;
  children: ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ title, description, children }) => {
  return (
    <div className="space-y-8">
      <header className="pb-4 border-b border-border">
        <h1 className="text-4xl font-extrabold text-text tracking-tight">{title}</h1>
        <p className="mt-2 text-lg text-textSecondary">{description}</p>
      </header>
      <div className="bg-surface p-6 rounded-2xl shadow-xl min-h-[60vh]">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
