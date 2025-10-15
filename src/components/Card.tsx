import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className }) => {
  return (
    <div className={`bg-surface p-6 rounded-2xl shadow-lg border border-border ${className}`}>
      {title && <h2 className="text-2xl font-semibold text-primary mb-4">{title}</h2>}
      {children}
    </div>
  );
};

export default Card;
