// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { authService } from "../../service/authService.js"
import { userService } from "../../service/userService.js"

/* =========================
   THUNKS
========================= */

// REGISTER
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      const user = await authService.signUp(payload)
      return user
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Signup failed"
      )
    }
  }
)

// LOGIN (COOKIE-BASED)
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const user = await authService.login(credentials)
      return user // ✅ user object only
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Login failed"
      )
    }
  }
)

// FETCH CURRENT USER (/me)
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await userService.getUserDetails()
      return user
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Fetching current user failed"
      )
    }
  }
)

/* =========================
   INITIAL STATE
========================= */

const initialState = {
  user: null,
  isAuthenticated: false,
  status: "idle", // idle | loading | succeeded | failed
  error: null,

  signUpStatus: "idle",
  signUpError: null,
}

/* =========================
   SLICE
========================= */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logOut: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.status = "idle"
      state.error = null
      // ❌ no localStorage cleanup needed
    },
  },
  extraReducers: (builder) => {
    builder

      /* ---------- REGISTER ---------- */
      .addCase(registerUser.pending, (state) => {
        state.signUpStatus = "loading"
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.signUpStatus = "succeeded"
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.signUpStatus = "failed"
        state.signUpError = action.payload
      })

      /* ---------- LOGIN ---------- */
      .addCase(loginUser.pending, (state) => {
        state.status = "loading"
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed"
        state.user = null
        state.isAuthenticated = false
        state.error = action.payload
      })

      /* ---------- FETCH CURRENT USER ---------- */
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed"
        state.user = null
        state.isAuthenticated = false
        state.error = action.payload
      })
  },
})

/* =========================
   EXPORTS
========================= */

export const { logOut } = authSlice.actions
export default authSlice.reducer

/* =========================
   SELECTORS
========================= */

export const selectAuthUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthStatus = (state) => state.auth.status
export const selectAuthError = (state) => state.auth.error
export const selectSignUpStatus = (state) => state.auth.signUpStatus
export const selectSignUpError = (state) => state.auth.signUpError
