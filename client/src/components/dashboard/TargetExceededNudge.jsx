import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Lightbulb, PlusCircle, History, Target, X } from 'lucide-react';
import { formatCO2 } from '../../utils/formatters';

const TargetExceededNudge = ({
  targetExceeded,
  exceededBy,
  totalCO2,
  weeklyTarget,
  categoryBreakdown,
  onAdjustTarget
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [animatedExceeded, setAnimatedExceeded] = useState(() => (prefersReducedMotion ? exceededBy : 0));

  // Smooth subtle initial count-up for focal exceeded number
  useEffect(() => {
    if (!targetExceeded || prefersReducedMotion) return;

    const startVal = 0;
    const endVal = Number(exceededBy) || 0;
    const duration = 400;
    let startTime = null;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setAnimatedExceeded(startVal + (endVal - startVal) * easeProgress);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setAnimatedExceeded(endVal);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [exceededBy, targetExceeded, prefersReducedMotion]);

  // DP1 Rule: If not exceeded or temporarily dismissed by user, render nothing
  if (!targetExceeded || isDismissed) {
    return null;
  }

  // Determine top contributing category for dynamic, non-judgmental guidance
  let topCategory = 'travel';
  let topCO2 = -1;

  if (categoryBreakdown) {
    if (Array.isArray(categoryBreakdown)) {
      categoryBreakdown.forEach((item) => {
        const val = typeof item.co2 === 'number' ? item.co2 : (typeof item.value === 'number' ? item.value : 0);
        if (val > topCO2) {
          topCO2 = val;
          topCategory = item.type || item.key || item.category || topCategory;
        }
      });
    } else if (typeof categoryBreakdown === 'object') {
      Object.entries(categoryBreakdown).forEach(([cat, val]) => {
        const num = typeof val === 'number' ? val : (val?.co2 || 0);
        if (num > topCO2) {
          topCO2 = num;
          topCategory = cat;
        }
      });
    }
  }

  // Dynamic constructive tips mapped by top contributing category
  const categoryInsights = {
    nonveg_meal: {
      title: 'Diet is your biggest contributor this week.',
      detail: 'Small changes, such as replacing 1–2 meat-based meals with plant-based alternatives, may help reduce your footprint.'
    },
    veg_meal: {
      title: 'Diet is your biggest contributor this week.',
      detail: 'Plant-based choices are already remarkably low-impact! Sourcing seasonal local produce can enhance footprint efficiency even more.'
    },
    travel: {
      title: 'Travel is your biggest contributor this week.',
      detail: 'Consider grouping short errands or opting for transit/carpooling when convenient to help lower your footprint.'
    },
    bus: {
      title: 'Public transit is your biggest contributor this week.',
      detail: 'You are actively utilizing shared transit! Route planning and combining trips helps keep your footprint low.'
    },
    flight: {
      title: 'Aviation is your biggest contributor this week.',
      detail: 'Aviation accounts for substantial impact. For regional trips, opting for rail where feasible can significantly lower emissions.'
    },
    electricity: {
      title: 'Electricity is your biggest contributor this week.',
      detail: 'Turning off idle appliances and moderating thermostat settings can quickly lower weekly energy use.'
    }
  };

  const currentInsight = categoryInsights[topCategory] || {
    title: 'Small habit shifts can help restore balance.',
    detail: 'Target adjustments and small habit shifts help restore balance over time. Logging remains fully open!'
  };

  const displayExceeded = animatedExceeded > 0 ? formatCO2(animatedExceeded) : formatCO2(exceededBy);

  return (
    <div
      className="rounded-2xl border border-amber-200/90 bg-gradient-to-b from-[#fffcf8] via-[#fffdfa] to-white p-5 sm:p-6 lg:p-7 shadow-card space-y-4 sm:space-y-5 animate-slide-up"
      role="region"
      aria-label="Weekly carbon target notification"
    >
      {/* LEVEL 1: Status Badge & Accessible Dismiss Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-100/90 text-amber-900 border border-amber-200/90">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" aria-hidden="true" />
          <span>Weekly Target Exceeded</span>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-amber-100/60 rounded-xl transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:outline-none flex-shrink-0"
          title="Dismiss weekly target notification"
          aria-label="Dismiss weekly target notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* LEVEL 2 & 3: Main Headline & Focal Exceeded Number */}
      <div className="space-y-1.5">
        <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
          You're above your weekly target
        </h3>

        {/* Visual Focal Point: Exceeded Amount */}
        <div className="pt-1 pb-0.5">
          <div className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight font-sans">
            {displayExceeded}
          </div>
          <p className="text-xs sm:text-sm font-semibold text-stone-600 mt-0.5">
            kg CO₂ above target
          </p>
        </div>
      </div>

      {/* LEVEL 3 (Supporting Metrics): Compact 3-Card Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <div className="bg-white/90 rounded-xl border border-amber-200/70 p-3 sm:py-2.5 sm:px-3.5 shadow-2xs">
          <div className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight font-sans">
            {formatCO2(totalCO2)} <span className="text-xs font-semibold text-stone-500">kg</span>
          </div>
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mt-0.5">
            Recorded
          </div>
        </div>

        <div className="bg-white/90 rounded-xl border border-amber-200/70 p-3 sm:py-2.5 sm:px-3.5 shadow-2xs">
          <div className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight font-sans">
            {formatCO2(weeklyTarget)} <span className="text-xs font-semibold text-stone-500">kg</span>
          </div>
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mt-0.5">
            Weekly target
          </div>
        </div>

        <div className="bg-white/90 rounded-xl border border-amber-200/70 p-3 sm:py-2.5 sm:px-3.5 shadow-2xs">
          <div className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight font-sans">
            {formatCO2(exceededBy)} <span className="text-xs font-semibold text-stone-500">kg</span>
          </div>
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mt-0.5">
            Above target
          </div>
        </div>
      </div>

      {/* LEVEL 4: Short Explanation */}
      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
        You're above this week's target. You can continue logging activities and adjust your target whenever needed.
      </p>

      {/* LEVEL 5: Actionable Insight Soft Panel */}
      <div className="p-3.5 sm:p-4 bg-emerald-50/75 rounded-xl border border-emerald-200/75 text-xs sm:text-sm space-y-1">
        <div className="flex items-center space-x-1.5 text-emerald-800 font-extrabold text-[11px] uppercase tracking-wider">
          <Lightbulb className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Actionable Insight</span>
        </div>
        <p className="font-bold text-stone-900 pt-0.5">
          {currentInsight.title}
        </p>
        <p className="text-stone-600 leading-relaxed text-xs sm:text-sm">
          {currentInsight.detail}
        </p>
      </div>

      {/* LEVEL 6: Actions with Clear Visual Hierarchy */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-2.5 pt-1">
        <Link
          to="/history"
          className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-stone-50 active:scale-98 text-stone-700 hover:text-stone-900 border border-stone-300 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:outline-none"
        >
          <History className="w-3.5 h-3.5 text-stone-500" />
          <span>Review History</span>
        </Link>

        {onAdjustTarget && (
          <button
            type="button"
            onClick={onAdjustTarget}
            className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-stone-50 active:scale-98 text-stone-700 hover:text-stone-900 border border-stone-300 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:outline-none"
          >
            <Target className="w-3.5 h-3.5 text-stone-500" />
            <span>Adjust Target</span>
          </button>
        )}

        <Link
          to="/log"
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-forest-800 hover:bg-forest-900 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:outline-none"
        >
          <PlusCircle className="w-3.5 h-3.5 text-mint-300" />
          <span>Log Activity</span>
        </Link>
      </div>
    </div>
  );
};

export default TargetExceededNudge;
