import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  preventBackdropClose?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
  preventBackdropClose = false
}) => {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventBackdropClose) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      if (bodyRef.current) {
        bodyRef.current.scrollTop = 0;
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, preventBackdropClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl'
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden animate-fade-in"
      onClick={preventBackdropClose ? undefined : onClose}
    >
      <div
        className={`relative w-full ${maxWidthStyles[maxWidth]} max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-200 animate-fade-up`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle / touch pill */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-slate-50/80">
          <div className="w-12 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="min-w-0 pr-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
          {!preventBackdropClose && (
            <button
              onClick={onClose}
              className="shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div ref={bodyRef} className="flex-1 p-4 sm:p-6 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
