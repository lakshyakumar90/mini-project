import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const SlideOver = ({ isOpen, onClose, title, subtitle, children, footer, size = 'md' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl'
  }[size] || 'max-w-xl';

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 z-40 flex justify-end animate-fade-bg-in bg-black/30 backdrop-blur-[2px]">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div 
        className={`relative w-full ${widthClass} h-full bg-card border-l border-border shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3),0_8px_10px_-6px_rgba(0,0,0,0.2)] flex flex-col z-10 animate-slide-in-right overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-3.5 sm:px-6 py-4 sm:py-5 border-b border-border bg-card shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-satoshi font-semibold text-foreground tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground mt-1 font-inter">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-transparent hover:border-border"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3.5 sm:px-6 py-4 sm:py-6 bg-card space-y-5 sm:space-y-6">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-3.5 sm:px-6 py-3 sm:py-4 border-t border-border bg-secondary/80 shrink-0 flex items-center justify-end gap-2 sm:gap-3 flex-wrap">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default SlideOver;
