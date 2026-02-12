import { describe, it, expect, beforeEach, vi } from 'vitest';
import coiReducer, { addCOI, updateCOI, deleteCOI } from './coiSlice';

describe('coiSlice', () => {
  const initialState = {
    cois: [
      {
        id: '1',
        property: 'Prop 1',
        tenantName: 'Tenant 1',
        tenantEmail: 't1@example.com',
        unit: '1',
        coiName: 'COI 1',
        expiryDate: '2025-01-01',
        status: 'Active' as const,
        reminderStatus: 'Not Sent' as const,
        createdAt: '2025-01-01T00:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  it('should handle addCOI', () => {
    const newCOI = {
      property: 'Prop 2',
      tenantName: 'Tenant 2',
      tenantEmail: 't2@example.com',
      unit: '2',
      coiName: 'COI 2',
      expiryDate: '2025-02-01',
      status: 'Expired' as const,
      reminderStatus: 'Not Sent' as const,
    };
    const state = coiReducer(initialState, addCOI(newCOI));
    expect(state.cois.length).toBe(2);
    expect(state.cois[0].property).toBe('Prop 2');
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should handle updateCOI', () => {
    const updates = { status: 'Rejected' as const };
    const state = coiReducer(initialState, updateCOI({ id: '1', updates }));
    expect(state.cois[0].status).toBe('Rejected');
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should handle deleteCOI', () => {
    const state = coiReducer(initialState, deleteCOI('1'));
    expect(state.cois.length).toBe(0);
    expect(localStorage.setItem).toHaveBeenCalled();
  });
});
