import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, RotateCcw, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { createActivity } from '../services/api';
import {
  getActivityConfig,
  getUnitForType,
  calculateFrontendEstimate,
  ACTIVITY_TYPES
} from '../utils/carbonFactors';
import ActivityTypeSelect from '../components/activity/ActivityTypeSelect';
import QuantityInput from '../components/activity/QuantityInput';
import DateInput from '../components/activity/DateInput';
import Co2Preview from '../components/activity/Co2Preview';
import ActivitySuccess from '../components/activity/ActivitySuccess';
import AbsurdInputDialog from '../components/AbsurdInputDialog';
import { isUnusualActivity } from '../utils/unusualActivity';

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 * Avoids UTC timezone conversion shifts.
 */
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const LogActivity = () => {
  const today = useMemo(() => getTodayDateString(), []);

  // Form State
  const [type, setType] = useState('travel');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(today);

  // Status & Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [lastCreatedActivity, setLastCreatedActivity] = useState(null);

  // DP2: Absurd Input Modal State
  const [showAbsurdDialog, setShowAbsurdDialog] = useState(false);
  const [pendingActivityData, setPendingActivityData] = useState(null);
  const [absurdModalError, setAbsurdModalError] = useState(null);

  // Derived unit and config
  const activeConfig = useMemo(() => getActivityConfig(type) || ACTIVITY_TYPES[0], [type]);
  const activeUnit = useMemo(() => getUnitForType(type) || 'km', [type]);

  // Live estimated CO2 calculation
  const liveEstimate = useMemo(() => {
    return calculateFrontendEstimate(type, quantity);
  }, [type, quantity]);

  // Field change handlers with real-time error clearing
  const handleTypeChange = (newType) => {
    setType(newType);
    if (errors.type) {
      setErrors((prev) => ({ ...prev, type: null }));
    }
  };

  const handleQuantityChange = (newQty) => {
    setQuantity(newQty);
    if (errors.quantity) {
      setErrors((prev) => ({ ...prev, quantity: null }));
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (errors.date) {
      setErrors((prev) => ({ ...prev, date: null }));
    }
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!type || typeof type !== 'string' || type.trim() === '') {
      newErrors.type = 'Please select an activity type.';
    }

    if (quantity === '' || quantity === undefined || quantity === null) {
      newErrors.quantity = 'Quantity is required.';
    } else {
      const num = Number(quantity);
      if (isNaN(num) || !Number.isFinite(num) || num <= 0) {
        newErrors.quantity = 'Quantity must be greater than 0.';
      }
    }

    if (!date || typeof date !== 'string' || date.trim() === '') {
      newErrors.date = 'Please select a date.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Perform API call to persist activity (authoritative calculation on backend)
  const executeSaveActivity = async (payload) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      setAbsurdModalError(null);

      const res = await createActivity(payload);

      if (res && res.success) {
        // Successful submission feedback
        setLastCreatedActivity(res.data);
        setServerError(null);
        setErrors({});

        // Close absurd input dialog if open
        setShowAbsurdDialog(false);
        setPendingActivityData(null);

        // Reset form inputs for next entry, keeping sensible defaults
        setQuantity('');
        setDate(today);
      } else {
        const msg = res?.message || 'Failed to record activity.';
        setServerError(msg);
        setAbsurdModalError(msg);
      }
    } catch (err) {
      let msg = 'Something went wrong while saving the activity.';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        msg = 'Unable to connect to the server. Please try again.';
      } else if (err.response?.status === 400) {
        msg = err.response.data?.message || 'Please check your input values.';
      }
      setServerError(msg);
      setAbsurdModalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form Submission Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    setAbsurdModalError(null);

    // Guard against rapid duplicate submissions
    if (isSubmitting) return;

    // Validate inputs
    const isValid = validateForm();
    if (!isValid) return;

    const numQuantity = Number(quantity);
    const payload = {
      type,
      quantity: numQuantity,
      date
    };

    // DP2: Outlier detection check
    if (isUnusualActivity(type, numQuantity)) {
      setPendingActivityData(payload);
      setShowAbsurdDialog(true);
      return; // Do NOT send request yet; wait for explicit confirmation
    }

    // Normal value -> save directly
    executeSaveActivity(payload);
  };

  // DP2: User confirmed "Record Anyway"
  const handleConfirmAbsurd = () => {
    if (pendingActivityData && !isSubmitting) {
      executeSaveActivity(pendingActivityData);
    }
  };

  // DP2: User selected "Go Back" (preserves form data)
  const handleCancelAbsurd = () => {
    setShowAbsurdDialog(false);
    setPendingActivityData(null);
    setAbsurdModalError(null);
  };

  // Reset Form
  const handleReset = () => {
    setType('travel');
    setQuantity('');
    setDate(today);
    setErrors({});
    setServerError(null);
    setLastCreatedActivity(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* DP2: Absurd Input Confirmation Dialog */}
      <AbsurdInputDialog
        isOpen={showAbsurdDialog}
        quantity={pendingActivityData?.quantity || 0}
        unit={activeUnit}
        activityLabel={activeConfig.label}
        estimatedCO2={liveEstimate}
        isSubmitting={isSubmitting}
        serverError={absurdModalError}
        onCancel={handleCancelAbsurd}
        onConfirm={handleConfirmAbsurd}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-forest-800 bg-forest-100/80 px-2.5 py-0.5 rounded-full border border-forest-200/80 inline-flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-forest-700" />
              <span>Authoritative Tracking</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
            Log an Activity
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Record everyday emissions from transit, electricity, or meals
          </p>
        </div>

        <Link
          to="/"
          className="self-start sm:self-center inline-flex items-center space-x-1.5 text-xs font-bold text-forest-800 hover:text-forest-950 bg-forest-50 hover:bg-forest-100/80 px-3.5 py-2 rounded-xl border border-forest-200/60 transition-colors"
        >
          <span>View Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Success Notification Card */}
      {lastCreatedActivity && (
        <ActivitySuccess
          activity={lastCreatedActivity}
          onDismiss={() => setLastCreatedActivity(null)}
        />
      )}

      {/* Main Logging Form Card */}
      <div className="card-base p-6 sm:p-8 bg-white rounded-2xl shadow-card border border-gray-200/80">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* General Server Error Notification */}
          {serverError && (
            <div
              className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium animate-slide-up"
              role="alert"
            >
              <p>{serverError}</p>
            </div>
          )}

          {/* 1. Activity Type Selector */}
          <ActivityTypeSelect
            value={type}
            onChange={handleTypeChange}
            disabled={isSubmitting}
            error={errors.type}
          />

          {/* 2 & 3. Quantity and Date Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuantityInput
              value={quantity}
              onChange={handleQuantityChange}
              unit={activeUnit}
              disabled={isSubmitting}
              error={errors.quantity}
            />

            <DateInput
              value={date}
              onChange={handleDateChange}
              disabled={isSubmitting}
              error={errors.date}
            />
          </div>

          {/* 4. Estimated Footprint Live Preview */}
          <Co2Preview
            config={activeConfig}
            quantity={quantity}
            estimatedCO2={liveEstimate}
          />

          {/* 5. Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 active:scale-98 disabled:opacity-50 rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 bg-forest-800 hover:bg-forest-900 active:scale-98 disabled:bg-gray-400 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding Activity...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 text-mint-300" />
                  <span>Record Activity</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogActivity;
