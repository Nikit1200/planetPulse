import React, { useEffect } from 'react';
import { Trash2 } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onCancel, onConfirm, confirmText = 'Delete', isDanger = true }) => {
  // Handle Escape key to dismiss dialog
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
    >
      {/* Click outside to cancel */}
      <div
        className="fixed inset-0"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200/90 animate-scale-in z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start space-x-3.5">
          {isDanger && (
            <div className="p-2.5 bg-rose-100 text-rose-700 border border-rose-200 rounded-xl flex-shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 id="confirm-modal-title" className="text-base font-bold text-gray-900 tracking-tight">
              {title}
            </h3>
            <p id="confirm-modal-desc" className="mt-1.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-2.5 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 active:scale-98 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs sm:text-sm font-bold text-white rounded-xl active:scale-98 transition-all shadow-xs cursor-pointer ${
              isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-forest-800 hover:bg-forest-900'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
