import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import TargetExceededNudge from '../src/components/dashboard/TargetExceededNudge';

describe('TargetExceededNudge Component (DP1 Redesign)', () => {
  const defaultProps = {
    targetExceeded: true,
    exceededBy: 12577.80,
    totalCO2: 12597.80,
    weeklyTarget: 20.00,
    categoryBreakdown: {
      travel: 10,
      nonveg_meal: 12500,
      electricity: 50
    },
    onAdjustTarget: vi.fn()
  };

  const renderComponent = (props = {}) => {
    return renderToString(
      <MemoryRouter>
        <TargetExceededNudge {...defaultProps} {...props} />
      </MemoryRouter>
    );
  };

  it('renders when targetExceeded is true (DP1)', () => {
    const html = renderComponent({ targetExceeded: true });
    expect(html).toContain('Weekly Target Exceeded');
    expect(html).toContain('You&#x27;re above your weekly target');
  });

  it('renders nothing when targetExceeded is false (DP1)', () => {
    const html = renderComponent({ targetExceeded: false });
    expect(html).toBe('');
  });

  it('renders nothing when totalCO2 <= weeklyTarget (equal or below target)', () => {
    const html = renderComponent({
      targetExceeded: false,
      totalCO2: 20.00,
      weeklyTarget: 20.00,
      exceededBy: 0
    });
    expect(html).toBe('');
  });

  it('displays the focal exceeded amount and formatted metrics', () => {
    const html = renderComponent();
    expect(html).toContain('12,577.80');
    expect(html).toContain('12,597.80');
    expect(html).toContain('20.00');
    expect(html).toContain('kg CO₂ above target');
    expect(html).toContain('Recorded');
    expect(html).toContain('Weekly target');
    expect(html).toContain('Above target');
  });

  it('renders proper CO₂ formatting everywhere (not raw CO2)', () => {
    const html = renderComponent();
    expect(html).toContain('CO₂');
    expect(html).not.toContain('CO2');
  });

  it('renders dynamic actionable insight based on categoryBreakdown (Diet top contributor)', () => {
    const html = renderComponent({
      categoryBreakdown: {
        travel: 10,
        nonveg_meal: 500,
        electricity: 20
      }
    });
    expect(html).toContain('Actionable Insight');
    expect(html).toContain('Diet is your biggest contributor this week.');
    expect(html).toContain('replacing 1–2 meat-based meals with plant-based alternatives');
  });

  it('renders dynamic actionable insight for Travel when travel is the highest', () => {
    const html = renderComponent({
      categoryBreakdown: {
        travel: 800,
        nonveg_meal: 50,
        electricity: 20
      }
    });
    expect(html).toContain('Travel is your biggest contributor this week.');
    expect(html).toContain('Consider grouping short errands');
  });

  it('renders dynamic actionable insight for Electricity when electricity is the highest', () => {
    const html = renderComponent({
      categoryBreakdown: {
        travel: 10,
        electricity: 900
      }
    });
    expect(html).toContain('Electricity is your biggest contributor this week.');
    expect(html).toContain('Turning off idle appliances');
  });

  it('renders all three actions: Review History, Adjust Target, and Log Activity', () => {
    const html = renderComponent();
    expect(html).toContain('Review History');
    expect(html).toContain('href="/history"');
    expect(html).toContain('Adjust Target');
    expect(html).toContain('Log Activity');
    expect(html).toContain('href="/log"');
  });

  it('renders accessible labels and aria attributes', () => {
    const html = renderComponent();
    expect(html).toContain('aria-label="Weekly carbon target notification"');
    expect(html).toContain('aria-label="Dismiss weekly target notification"');
  });
});
