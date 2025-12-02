import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import {authService} from "../../service/authService.js"
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const user = await authService.login(credentials);
      return user;
    } catch (error) {
      const message =
        error?.response?.data?.message || error.message || "Login failed";
      return rejectWithValue(message);
    }
  }
);

// Fetch current user
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Fetching current user failed";
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logOut: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    // optional helper to set user from localStorage (if you want to rehydrate)
    setUserFromStorage: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- loginUser ----
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;

        // persist minimal user info for page refresh (optional)
        try {
          localStorage.setItem("user", JSON.stringify(action.payload));
        } catch (e) {
          // ignore storage errors
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
      })

      // ---- fetchCurrentUser ----
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;

        // keep local copy updated
        try {
          localStorage.setItem("user", JSON.stringify(action.payload));
        } catch (e) {}
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed";
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      });
  },
});

export const { logOut, setUserFromStorage } = authSlice.actions;

export default authSlice.reducer;

/* --------------------------
   Selectors (add these to be imported elsewhere)
   -------------------------- */

// Basic selectors
export const selectAuthUser = (state) => state.auth?.user ?? null;
export const selectIsAuthenticated = (state) => !!state.auth?.isAuthenticated;
export const selectAuthStatus = (state) => state.auth?.status ?? "idle";
export const selectAuthError = (state) => state.auth?.error ?? null;