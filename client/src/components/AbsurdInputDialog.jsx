import React, { useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { formatCO2, formatQuantity } from '../utils/formatters';

const AbsurdInputDialog = ({
  isOpen,
  quantity,
  unit,
  activityLabel,
  estimatedCO2,
  isSubmitting,
  serverError,
  onCancel,
  onConfirm
}) => {
  // Handle Escape key to dismiss dialog (same as Go Back)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="absurd-dialog-title"
      aria-describedby="absurd-dialog-desc"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isSubmitting) onCancel();
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200/90 p-6 sm:p-7 space-y-5 z-10 max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header Icon & Title */}
        <div className="flex items-start space-x-3.5">
          <div className="p-3 bg-amber-100 text-amber-800 border border-amber-200 rounded-2xl flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold uppercase tracking-wider mb-1">
              Soft Confirmation
            </div>
            <h3 id="absurd-dialog-title" className="text-lg font-bold text-gray-900 tracking-tight">
              Unusually Large Value
            </h3>
            <p id="absurd-dialog-desc" className="text-xs text-gray-500 mt-0.5">
              Please verify your input before recording
            </p>
          </div>
        </div>

        {/* Server Error Message if submission failed */}
        {serverError && (
          <div
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium"
            role="alert"
          >
            {serverError}
          </div>
        )}

        {/* Description & Details */}
        <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed bg-amber-50/40 p-4 rounded-xl border border-amber-200/60">
          <p>
            <span className="font-black text-gray-900">
              {formatQuantity(quantity, unit)}
            </span>{' '}
            is an unusually large distance or quantity for{' '}
            <span className="font-bold text-forest-950">{activityLabel}</span>.
          </p>

          <p className="text-gray-500 text-xs">
            PlanetPulse does not clamp or silently modify your numbers. If this large figure is accurate, you can record it anyway.
          </p>

          {/* Estimated Footprint Preview */}
          <div className="pt-2 border-t border-amber-200/80 flex items-baseline justify-between">
            <span className="text-xs font-semibold text-gray-600">
              Estimated footprint:
            </span>
            <span className="text-lg font-black text-forest-950 font-sans">
              {formatCO2(estimatedCO2)}{' '}
              <span className="text-xs font-bold text-forest-700">kg CO₂</span>
            </span>
          </div>
        </div>

        {/* Action Buttons: Go Back vs Record Anyway */}
        <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 active:scale-98 disabled:opacity-50 rounded-xl transition-all cursor-pointer"
          >
            Go Back
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center space-x-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 active:scale-98 disabled:bg-gray-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Recording...</span>
              </>
            ) : (
              <span>Record Anyway</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AbsurdInputDialog;
