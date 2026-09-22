import React, { useState, useEffect, useCallback } from 'react';
import { getDashboardData } from '../services/api';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SummaryCards from '../components/dashboard/SummaryCards';
import ProgressCard from '../components/dashboard/ProgressCard';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import DailyBreakdown from '../components/dashboard/DailyBreakdown';
import RecentActivities from '../components/dashboard/RecentActivities';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';
import DashboardError from '../components/dashboard/DashboardError';
import TargetEditModal from '../components/dashboard/TargetEditModal';
import TargetExceededNudge from '../components/dashboard/TargetExceededNudge';
import Toast from '../components/Toast';
import { formatCO2 } from '../utils/formatters';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Weekly Target Modal and Notification State
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch dashboard data from authoritative backend endpoint
  const fetchDashboard = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await getDashboardData();
      if (res && res.success) {
        setData(res.data);
      } else {
        setError(res?.message || 'Unable to load your dashboard.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to connect to the server. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch fresh metrics on component mount or return
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Handle successful target update
  const handleTargetUpdateSuccess = async (newTarget) => {
    setToastMessage(`✓ Weekly target updated to ${formatCO2(newTarget)} kg CO₂ / week`);
    // Immediately re-fetch authoritative dashboard calculations
    await fetchDashboard();
  };

  // Loading State (Section 21)
  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  // Error State with Retry (Section 22)
  if (error && !data) {
    return (
      <DashboardError
        message={error}
        onRetry={() => fetchDashboard(false)}
        isRetrying={loading || refreshing}
      />
    );
  }

  if (!data) return null;

  const {
    week,
    totalCO2,
    weeklyTarget,
    percentage,
    remaining,
    exceededBy,
    targetExceeded,
    activityCount,
    categoryBreakdown,
    dailyBreakdown,
    recentActivities
  } = data;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Target Edit Modal Dialog */}
      <TargetEditModal
        isOpen={isTargetModalOpen}
        currentTarget={weeklyTarget}
        onClose={() => setIsTargetModalOpen(false)}
        onSuccess={handleTargetUpdateSuccess}
      />

      {/* 1. Header (Week range, refresh button, Log Activity CTA) */}
      <DashboardHeader
        week={week}
        onRefresh={() => fetchDashboard(true)}
        isRefreshing={refreshing}
      />

      {/* 2. Top Summary Stat Cards */}
      <SummaryCards
        totalCO2={totalCO2}
        weeklyTarget={weeklyTarget}
        percentage={percentage}
        remaining={remaining}
        exceededBy={exceededBy}
        targetExceeded={targetExceeded}
        activityCount={activityCount}
        onEditTarget={() => setIsTargetModalOpen(true)}
      />

      {/* 3. Weekly Progress Visualization & Factual Target Status */}
      <ProgressCard
        totalCO2={totalCO2}
        weeklyTarget={weeklyTarget}
        percentage={percentage}
        remaining={remaining}
        exceededBy={exceededBy}
        targetExceeded={targetExceeded}
        onEditTarget={() => setIsTargetModalOpen(true)}
      />

      {/* DP1: The Nudge - Constructive target exceeded card */}
      <TargetExceededNudge
        targetExceeded={targetExceeded}
        exceededBy={exceededBy}
        totalCO2={totalCO2}
        weeklyTarget={weeklyTarget}
        categoryBreakdown={categoryBreakdown}
        onAdjustTarget={() => setIsTargetModalOpen(true)}
      />

      {/* 4. Visualizations: Category Breakdown & Daily Emissions Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdown
          categoryBreakdown={categoryBreakdown}
          totalCO2={totalCO2}
        />
        <DailyBreakdown
          dailyBreakdown={dailyBreakdown}
        />
      </div>

      {/* 5. Recent Activities Feed & Empty State */}
      <RecentActivities
        activities={recentActivities}
      />
    </div>
  );
};

export default Dashboard;

