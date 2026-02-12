import { createSlice, current } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type COIStatus = 'Active' | 'Expired' | 'Rejected' | 'Expiring Soon' | 'Not Processed';
export type ReminderStatus = 'Not Sent' | 'Sent (30d)' | 'N/A';

export interface COIData {
  id: string;
  property: string;
  tenantName: string;
  tenantEmail: string;
  unit: string;
  coiName: string;
  expiryDate: string;
  status: COIStatus;
  reminderStatus: ReminderStatus;
  createdAt: string;
}

interface COIState {
  cois: COIData[];
}

const INITIAL_DATA: COIData[] = [
  {
    id: "1",
    property: "Maplewood Shopping Center",
    tenantName: "Johnson & Sons",
    tenantEmail: "johnson@example.com",
    unit: "101",
    coiName: "Tenant_CedarHeights_COI_2026",
    expiryDate: "2026-11-17",
    status: "Active",
    reminderStatus: "Not Sent",
    createdAt: "2025-01-15T10:00:00Z"
  },
  {
    id: "2",
    property: "Oak Tree Tower",
    tenantName: "Smith Enterprises",
    tenantEmail: "smith@example.com",
    unit: "Suite 300",
    coiName: "GlobalMart_Insurance_COI_2025",
    expiryDate: "2025-11-20",
    status: "Expired",
    reminderStatus: "Sent (30d)",
    createdAt: "2024-12-10T10:00:00Z"
  },
  {
    id: "3",
    property: "Meadowbrook Plaza",
    tenantName: "Global Solutions",
    tenantEmail: "global@example.com",
    unit: "B-12",
    coiName: "UrbanOutfitters_COI_2027",
    expiryDate: "2027-11-19",
    status: "Rejected",
    reminderStatus: "N/A",
    createdAt: "2025-01-20T10:00:00Z"
  },
  {
    id: "4",
    property: "Pine Hill Shopping Center",
    tenantName: "Patel Industries",
    tenantEmail: "patel@example.com",
    unit: "402",
    coiName: "TechInnovators_COI_2028",
    expiryDate: "2028-11-23",
    status: "Expiring Soon",
    reminderStatus: "Not Sent",
    createdAt: "2025-02-01T10:00:00Z"
  },
  {
    id: "5",
    property: "Maplewood Shopping Center",
    tenantName: "Green Thumb Landscaping",
    tenantEmail: "green@example.com",
    unit: "Kiosk 3",
    coiName: "GreenEarth_COI_2025",
    expiryDate: "2025-11-22",
    status: "Expiring Soon",
    reminderStatus: "Not Sent",
    createdAt: "2025-02-05T10:00:00Z"
  }
];

const STORAGE_KEY = 'legalgraph_cois_v2';

const loadState = (): COIData[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  } catch (err) {
    return INITIAL_DATA;
  }
};

const initialState: COIState = {
  cois: loadState(),
};

const coiSlice = createSlice({
  name: 'cois',
  initialState,
  reducers: {
    addCOI: (state, action: PayloadAction<Omit<COIData, 'id' | 'createdAt'>>) => {
      const newCOI: COIData = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
      state.cois.unshift(newCOI);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current(state).cois));
    },
    updateCOI: (state, action: PayloadAction<{ id: string; updates: Partial<COIData> }>) => {
      const index = state.cois.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.cois[index] = { ...state.cois[index], ...action.payload.updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current(state).cois));
      }
    },
    deleteCOI: (state, action: PayloadAction<string>) => {
      state.cois = state.cois.filter(item => item.id !== action.payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current(state).cois));
    },
    bulkDelete: (state, action: PayloadAction<string[]>) => {
      state.cois = state.cois.filter(item => !action.payload.includes(item.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current(state).cois));
    },
    bulkSendReminder: (state, action: PayloadAction<string[]>) => {
      state.cois = state.cois.map(item =>
        action.payload.includes(item.id) ? { ...item, reminderStatus: 'Sent (30d)' } : item
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current(state).cois));
    }
  },
});

export const { addCOI, updateCOI, deleteCOI, bulkDelete, bulkSendReminder } = coiSlice.actions;
export default coiSlice.reducer;
