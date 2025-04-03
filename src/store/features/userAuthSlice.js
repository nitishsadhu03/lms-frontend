import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axios';

export const loginUser = createAsyncThunk(
  'userAuth/login',
  async ({ userId, password, role }, { rejectWithValue }) => {
    try {
      const loginData = {
        username: userId,
        password,
        role // 'student' or 'teacher'
      };
      const response = await axiosInstance.post('/login/login', loginData);
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userProfile', JSON.stringify(response.data.profile));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'userAuth/forgotPassword',
  async ({ username, role }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/login/forgot-password', {
        username,
        role
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'userAuth/resetPassword',
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

const userAuthSlice = createSlice({
  name: 'userAuth',
  initialState: {
    user: null,
    profile: JSON.parse(localStorage.getItem('userProfile')) || null,
    token: localStorage.getItem('userToken'),
    isLoading: false,
    error: null,
    resetStatus: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.profile = null;
      state.token = null;
      localStorage.removeItem('userToken');
      localStorage.removeItem('userProfile');
    },
    clearError: (state) => {
      state.error = null;
    },
    clearResetStatus: (state) => {
      state.resetStatus = null;
    },
    updateProfile: (state, action) => {
      state.profile = action.payload;
      localStorage.setItem('userProfile', JSON.stringify(action.payload));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      // Forgot Password cases
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.resetStatus = 'pending'; // Indicates email was sent
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to send reset email';
      })
      
      // Reset Password cases
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.resetStatus = 'success';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to reset password';
        state.resetStatus = 'failed';
      });
  },
});

export const { logout: userLogout, clearError: userClearError, updateProfile, clearResetStatus } = userAuthSlice.actions;
export default userAuthSlice.reducer;