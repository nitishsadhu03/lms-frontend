import { configureStore } from '@reduxjs/toolkit';
import adminAuthReducer from './features/adminAuthSlice';
import userAuthReducer from './features/userAuthSlice';

export const store = configureStore({
  reducer: {
    adminAuth: adminAuthReducer,
    userAuth: userAuthReducer,
  },
});

export default store;