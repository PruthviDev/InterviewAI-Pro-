// src/components/dashboard/stats-card.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatsCard } from './stats-card';

describe('StatsCard', () => {
  it('hides the trend when there is no valid comparison', () => {
    render(<StatsCard label="Average Score" value="78/100" icon={null} delta={null} caption="Last 30 days" />);
    expect(screen.queryByText(/^\+/)).toBeNull();
    expect(screen.getByText('Last 30 days')).toBeTruthy();
  });

  it('shows a positive trend with accessible text', () => {
    render(<StatsCard label="Total" value="24" icon={null} delta={12} deltaSuffix="%" />);
    expect(screen.getByText('+12%')).toBeTruthy();
    expect(screen.getByText('Up')).toBeTruthy();
  });
});
