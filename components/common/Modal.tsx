
import React, { useEffect } from 'react';
import { XIcon } from '../../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out" onClick={onClose}>
      <div
        className={`bg-white rounded-lg shadow-xl transform transition-all duration-300 ease-in-out m-4 ${sizeClasses[size]} w-full p-6 space-y-4`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between pb-3 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-800">{title}</h3>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-600 transition-colors"
              aria-label="Cerrar modal"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
        )}
        {!title && (
             <button
              onClick={onClose}
              className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600 transition-colors"
              aria-label="Cerrar modal"
            >
              <XIcon className="h-6 w-6" />
            </button>
        )}
        <div className="text-secondary-700 max-h-[70vh] overflow-y-auto pr-2">
            {children}
        </div>
        {footer && (
          <div className="pt-3 border-t border-secondary-200 flex justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
