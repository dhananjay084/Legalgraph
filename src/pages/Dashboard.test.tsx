import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import coiReducer from '../store/coiSlice';
import Dashboard from './Dashboard';
import { BrowserRouter } from 'react-router-dom';

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
            property: 'Maplewood Shopping Center',
            tenantName: 'Johnson & Sons',
            tenantEmail: 'johnson@example.com',
            unit: '101',
            coiName: 'Tenant_CedarHeights_COI_2026',
            expiryDate: '2026-11-17',
            status: 'Active',
            reminderStatus: 'Not Sent',
            createdAt: '2025-01-15T10:00:00Z',
          },
          {
            id: '2',
            property: 'Oak Tree Tower',
            tenantName: 'Smith Enterprises',
            tenantEmail: 'smith@example.com',
            unit: 'Suite 300',
            coiName: 'GlobalMart_Insurance_COI_2025',
            expiryDate: '2025-11-20',
            status: 'Expired',
            reminderStatus: 'Sent (30d)',
            createdAt: '2024-12-10T10:00:00Z',
          },
        ],
      },
    } as any,
  });
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Dashboard Search', () => {
  it('filters table rows based on search input', async () => {
    renderWithRedux(<Dashboard />);
    
    const searchInput = screen.getByPlaceholderText(/Search by tenant/i);
    
    fireEvent.change(searchInput, { target: { value: 'Johnson' } });
    
    // Wait for debounce (300ms)
    await waitFor(() => {
      expect(screen.getByText('Johnson & Sons')).toBeInTheDocument();
      expect(screen.queryByText('Smith Enterprises')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('shows "Page 1 of 1" when filtered results are few', async () => {
    renderWithRedux(<Dashboard />);
    expect(screen.getByText(/Page 1 of 1/i)).toBeInTheDocument();
  });
});
