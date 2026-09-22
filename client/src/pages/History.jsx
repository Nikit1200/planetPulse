import React, { useState, useEffect, useCallback } from 'react';
import { getActivities, deleteActivity } from '../services/api';
import HistoryHeader from '../components/history/HistoryHeader';
import HistoryFilters from '../components/history/HistoryFilters';
import HistoryList from '../components/history/HistoryList';
import HistoryEmptyState from '../components/history/HistoryEmptyState';
import HistorySkeleton from '../components/history/HistorySkeleton';
import HistoryError from '../components/history/HistoryError';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import { formatQuantity, formatCO2 } from '../utils/formatters';
import { getActivityConfig } from '../utils/carbonFactors';

const History = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active filter state used for backend requests
  const [appliedFilters, setAppliedFilters] = useState({
    type: 'all',
    from: '',
    to: ''
  });

  // Delete modal state (preserved from Phase 2/4)
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  // Server-side filtering data fetch (Section 22 & 24)
  const fetchActivities = useCallback(async (filtersToUse = appliedFilters) => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filtersToUse.type && filtersToUse.type !== 'all') {
        params.type = filtersToUse.type;
      }
      if (filtersToUse.from && filtersToUse.from.trim() !== '') {
        params.from = filtersToUse.from.trim();
      }
      if (filtersToUse.to && filtersToUse.to.trim() !== '') {
        params.to = filtersToUse.to.trim();
      }

      const res = await getActivities(params);
      if (res && res.success) {
        setActivities(Array.isArray(res.data) ? res.data : []);
      } else {
        setError(res?.message || 'Unable to load activity history.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load activity history. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  // Initial load
  useEffect(() => {
    fetchActivities(appliedFilters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply filters handler (Section 19)
  const handleApplyFilters = (newFilters) => {
    setAppliedFilters(newFilters);
    fetchActivities(newFilters);
  };

  // Clear filters handler (Section 20)
  const handleClearFilters = () => {
    const cleanFilters = { type: 'all', from: '', to: '' };
    setAppliedFilters(cleanFilters);
    fetchActivities(cleanFilters);
  };

  // Activity Deletion (Section 41)
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const targetId = deleteTarget.id || deleteTarget._id;
      const res = await deleteActivity(targetId);

      if (res && res.success) {
        setToastMessage('Activity deleted successfully.');
        setActivities((prev) => prev.filter((a) => (a.id || a._id) !== targetId));
      } else {
        setToastMessage(res?.message || 'Failed to delete activity.');
      }
    } catch (err) {
      setToastMessage(err.response?.data?.message || 'Failed to delete activity.');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const hasActiveFilters =
    (appliedFilters.type && appliedFilters.type !== 'all') ||
    Boolean(appliedFilters.from) ||
    Boolean(appliedFilters.to);

  const deleteLabel = deleteTarget ? getActivityConfig(deleteTarget.type)?.label || deleteTarget.type : '';

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Activity"
        message={
          deleteTarget
            ? `Are you sure you want to delete this ${deleteLabel} entry (${formatQuantity(
                deleteTarget.quantity,
                deleteTarget.unit
              )} • ${formatCO2(deleteTarget.co2)} kg CO₂)? This cannot be undone.`
            : ''
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* 1. Header (Title, Refresh, Log Activity CTA) */}
      <HistoryHeader
        onRefresh={() => fetchActivities(appliedFilters)}
        isRefreshing={loading}
      />

      {/* 2. Filter Controls Card */}
      <HistoryFilters
        appliedFilters={appliedFilters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        isLoading={loading}
      />

      {/* 3. Dynamic Results Area */}
      {loading ? (
        <HistorySkeleton />
      ) : error ? (
        <HistoryError
          message={error}
          onRetry={() => fetchActivities(appliedFilters)}
          isRetrying={loading}
        />
      ) : activities.length === 0 ? (
        <HistoryEmptyState
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
      ) : (
        <HistoryList
          activities={activities}
          onDeleteRequest={(act) => setDeleteTarget(act)}
        />
      )}
    </div>
  );
};

export default History;
