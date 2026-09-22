import React, { useState, useEffect, useRef } from 'react';
import { Target, X, Loader2, Check } from 'lucide-react';
import { updateWeeklyTarget } from '../../services/api';
import { formatCO2 } from '../../utils/formatters';

const TargetEditModal = ({ isOpen, currentTarget, onClose, onSuccess }) => {
  const [targetInput, setTargetInput] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const inputRef = useRef(null);

  // Pre-fill current target whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setTargetInput(currentTarget !== undefined && currentTarget !== null ? String(currentTarget) : '20');
      setError(null);
      setServerError(null);
      setIsSubmitting(false);

      // Auto-focus input after modal renders
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isOpen, currentTarget]);

  // Handle Escape key to dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  // Real-time error dismissal when user edits
  const handleInputChange = (e) => {
    setTargetInput(e.target.value);
    if (error) setError(null);
    if (serverError) setServerError(null);
  };

  // Client-side validation
  const validate = () => {
    if (targetInput === '' || targetInput === undefined || targetInput === null) {
      setError('Weekly target is required.');
      return null;
    }

    const trimmed = String(targetInput).trim();
    if (trimmed === '') {
      setError('Weekly target is required.');
      return null;
    }

    const num = Number(trimmed);
    if (isNaN(num) || !Number.isFinite(num)) {
      setError('Enter a valid weekly target.');
      return null;
    }

    if (num <= 0) {
      setError('Weekly target must be greater than 0.');
      return null;
    }

    return num;
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validNumber = validate();
    if (validNumber === null) return;

    try {
      setIsSubmitting(true);
      setServerError(null);

      const res = await updateWeeklyTarget(validNumber);
      if (res && res.success) {
        const savedTarget = res.data?.weeklyTarget || validNumber;
        onSuccess(savedTarget);
        onClose();
      } else {
        setServerError(res?.message || 'Unable to update your weekly target. Please try again.');
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
        'Unable to update your weekly target. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="target-modal-title"
    >
      {/* Click outside to cancel */}
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200/80 p-6 sm:p-7 space-y-5 z-10 max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-forest-50 border border-forest-200/60 text-forest-800">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 id="target-modal-title" className="text-lg font-bold text-gray-900 tracking-tight">
                Set Weekly Target
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Adjust your weekly CO₂ budget limit
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server Error Message */}
        {serverError && (
          <div
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium"
            role="alert"
          >
            {serverError}
          </div>
        )}

        {/* Target Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="weekly-target-input"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
            >
              Weekly Target <span className="text-rose-500">*</span>
            </label>

            <div className="relative rounded-xl shadow-xs">
              <input
                ref={inputRef}
                type="number"
                id="weekly-target-input"
                name="weeklyTarget"
                step="any"
                min="0.01"
                placeholder="e.g. 20"
                value={targetInput}
                onChange={handleInputChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'target-input-error' : 'target-unit-hint'}
                className={`w-full pl-3.5 pr-32 py-2.5 rounded-xl border text-base font-extrabold bg-white text-gray-900 transition-colors focus:outline-none focus:ring-2 ${
                  error
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-600'
                    : 'border-gray-300 focus:ring-forest-600/20 focus:border-forest-600'
                }`}
              />

              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span
                  id="target-unit-hint"
                  className="text-xs font-bold text-forest-900 bg-forest-50 border border-forest-200 px-2.5 py-1 rounded-md"
                >
                  kg CO₂ / week
                </span>
              </div>
            </div>

            {error ? (
              <p id="target-input-error" className="mt-1.5 text-xs text-rose-600 font-medium" role="alert">
                {error}
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] text-gray-500">
                Default baseline: <span className="font-semibold text-gray-700">{formatCO2(20)} kg CO₂ / week</span>. Supports decimals.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 active:scale-98 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-5 py-2 bg-forest-800 hover:bg-forest-900 active:scale-98 disabled:bg-gray-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-mint-300" />
                  <span>Save Target</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TargetEditModal;
