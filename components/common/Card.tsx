
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode; // e.g. buttons at the bottom or top-right
  titleClassName?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', actions, titleClassName = '' }) => {
  return (
    <div className={`bg-white shadow-lg rounded-xl overflow-hidden ${className}`}>
      {(title || actions) && (
        <div className="p-4 sm:p-6 border-b border-secondary-200 flex justify-between items-center">
          {title && <h3 className={`text-lg font-semibold text-secondary-800 ${titleClassName}`}>{title}</h3>}
          {actions && !title && <div className="ml-auto">{actions}</div>}
          {actions && title && <div>{actions}</div>}
        </div>
      )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};
