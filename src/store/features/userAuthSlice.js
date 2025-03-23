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

const userAuthSlice = createSlice({
  name: 'userAuth',
  initialState: {
    user: null,
    profile: JSON.parse(localStorage.getItem('userProfile')) || null,
    token: localStorage.getItem('userToken'),
    isLoading: false,
    error: null,
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
      });
  },
});

export const { logout: userLogout, clearError: userClearError, updateProfile } = userAuthSlice.actions;
export default userAuthSlice.reducer;