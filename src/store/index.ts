import { configureStore } from '@reduxjs/toolkit';
import coiReducer from './coiSlice';

export const store = configureStore({
  reducer: {
    cois: coiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
