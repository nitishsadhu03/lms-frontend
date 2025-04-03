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

export const forgotAdminPassword = createAsyncThunk(
  'adminAuth/forgotPassword',
  async ({ username }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/login/forgot-password', {
        username,
        role: 'admin'
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const resetAdminPassword = createAsyncThunk(
  'adminAuth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/login/reset-password/${token}`, {
        newPassword
      });
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
    resetStatus: null,
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
    clearResetStatus: (state) => {
      state.resetStatus = null;
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
      })
      .addCase(forgotAdminPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotAdminPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.resetStatus = 'pending';
      })
      .addCase(forgotAdminPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to send reset email';
      })
      .addCase(resetAdminPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetAdminPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.resetStatus = 'success';
      })
      .addCase(resetAdminPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to reset password';
        state.resetStatus = 'failed';
      });
  },
});

export const { logout: adminLogout, clearError: adminClearError, updateProfile, clearResetStatus  } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;