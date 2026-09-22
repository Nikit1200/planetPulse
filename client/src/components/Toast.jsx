import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3500 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      className="fixed bottom-5 right-5 z-50 animate-slide-up"
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-xl border ${
          isSuccess
            ? 'bg-forest-950 text-white border-forest-800'
            : 'bg-rose-950 text-white border-rose-800'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-mint-400 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-rose-300 flex-shrink-0" />
        )}
        <span className="text-sm font-semibold">{message}</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer ml-1"
          aria-label="Close notification"
        >
          <X className="w-4 h-4 text-gray-300" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
