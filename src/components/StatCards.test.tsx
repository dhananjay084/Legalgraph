import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import coiReducer from '../store/coiSlice';
import StatCards from './StatCards';
import type { RootState } from '../store';

const renderWithRedux = (component: React.ReactNode) => {
  const store = configureStore({
    reducer: {
      cois: coiReducer,
    },
    preloadedState: {
      cois: {
        cois: [
          {
            id: '1',
            property: 'Prop 1',
            tenantName: 'Tenant 1',
            tenantEmail: 't1@example.com',
            unit: '1',
            coiName: 'COI 1',
            expiryDate: '2025-01-01',
            status: 'Active',
            reminderStatus: 'Not Sent',
            createdAt: '2025-01-01T00:00:00Z',
          },
        ],
      },
    } as RootState,
  });
  return render(<Provider store={store}>{component}</Provider>);
};

describe('StatCards', () => {
  it('renders correctly with initial state', () => {
    renderWithRedux(<StatCards />);
    expect(screen.getByText('Total COI Processed')).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1); // Total count
  });

  it('filters accepted COIs correctly', () => {
    renderWithRedux(<StatCards />);
    const acceptedValues = screen.getAllByText('1');
    // There should be two '1' values: one for Total, one for Accepted
    expect(acceptedValues.length).toBeGreaterThanOrEqual(2);
  });
});
