import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DollarSign } from 'lucide-react';
import { StatCard } from '../StatCard';

describe('StatCard', () => {
  it('renders title and value correctly', () => {
    render(
      <StatCard
        title="Total Import Value"
        value="$8.01B"
        icon={DollarSign}
        delay={0}
      />
    );

    expect(screen.getByText('Total Import Value')).toBeInTheDocument();
    expect(screen.getByText('$8.01B')).toBeInTheDocument();
  });

  it('displays change when provided', () => {
    render(
      <StatCard
        title="Trade Deficit"
        value="$4.02B"
        change={-65.2}
        changeLabel="widening"
        icon={DollarSign}
        delay={0}
      />
    );

    expect(screen.getByText('-65.2%')).toBeInTheDocument();
    expect(screen.getByText('widening')).toBeInTheDocument();
  });

  it('applies correct CSS classes based on change value', () => {
    const { rerender } = render(
      <StatCard
        title="Test"
        value="$100"
        change={10}
        icon={DollarSign}
        delay={0}
      />
    );

    expect(screen.getByText('+10%')).toHaveClass('text-success');

    rerender(
      <StatCard
        title="Test"
        value="$100"
        change={-10}
        icon={DollarSign}
        delay={0}
      />
    );

    expect(screen.getByText('-10%')).toHaveClass('text-destructive');
  });
});
