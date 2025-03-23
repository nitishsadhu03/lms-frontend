import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axios';

export const loginAdmin = createAsyncThunk(
  'adminAuth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const loginData = {
        username: credentials.adminId,
        password: credentials.password,
        role: 'admin'
      };
      const response = await axiosInstance.post('/login/login', loginData);
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminProfile', JSON.stringify(response.data.profile));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState: {
    user: null,
    profile: JSON.parse(localStorage.getItem('adminProfile')) || null,
    token: localStorage.getItem('adminToken'),
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.profile = null;
      state.token = null;
      localStorage.removeItem('adminProfile');
      localStorage.removeItem('adminToken');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProfile: (state, action) => {
      state.profile = action.payload;
      localStorage.setItem('adminProfile', JSON.stringify(action.payload));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.token = action.payload.token;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
      });
  },
});

export const { logout: adminLogout, clearError: adminClearError, updateProfile } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;