// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { authService } from "../../service/authService.js"

/* --------------------------
   Thunks
   -------------------------- */

// SIGNUP
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      // payload should include: { username, email, password, ... }
      const data = await authService.signUp(payload)
      return data
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Signup failed"
      return rejectWithValue(message)
    }
  }
)

// LOGIN
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const user = await authService.login(credentials)
      return user
    } catch (error) {
      const message =
        error?.response?.data?.message || error.message || "Login failed"
      return rejectWithValue(message)
    }
  }
)

// Fetch current user
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser()
      return user
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Fetching current user failed"
      return rejectWithValue(message)
    }
  }
)

/* --------------------------
   Initial State
   -------------------------- */

const initialState = {
  user: null,
  isAuthenticated: false,

  // for login / fetchCurrentUser
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,

  // for signup
  signUpStatus: "idle", // "idle" | "loading" | "succeeded" | "failed"
  signUpError: null,
}

/* --------------------------
   Slice
   -------------------------- */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logOut: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.status = "idle"
      state.error = null
      state.signUpStatus = "idle"
      state.signUpError = null
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    },
    // optional helper to set user from localStorage (if you want to rehydrate)
    setUserFromStorage: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- registerUser (signup) ---------- */
      .addCase(registerUser.pending, (state) => {
        state.signUpStatus = "loading"
        state.signUpError = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.signUpStatus = "succeeded"
        state.signUpError = null
        // we do NOT auto-login here; user will login manually after signup
        // you could set some "justSignedUp" flag here if needed
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.signUpStatus = "failed"
        state.signUpError = action.payload
      })

      /* ---------- loginUser ---------- */
      .addCase(loginUser.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.user = action.payload
        state.isAuthenticated = true

        // persist minimal user info for page refresh (optional)
        try {
          localStorage.setItem("user", JSON.stringify(action.payload))
        } catch (e) {
          // ignore storage errors
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
        state.user = null
        state.isAuthenticated = false
      })

      /* ---------- fetchCurrentUser ---------- */
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.user = action.payload
        state.isAuthenticated = true

        // keep local copy updated
        try {
          localStorage.setItem("user", JSON.stringify(action.payload))
        } catch (e) {}
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed"
        state.user = null
        state.isAuthenticated = false
        state.error = action.payload
      })
  },
})

export const { logOut, setUserFromStorage } = authSlice.actions

export default authSlice.reducer

/* --------------------------
   Selectors
   -------------------------- */

export const selectAuthUser = (state) => state.auth?.user ?? null
export const selectIsAuthenticated = (state) => !!state.auth?.isAuthenticated
export const selectAuthStatus = (state) => state.auth?.status ?? "idle"
export const selectAuthError = (state) => state.auth?.error ?? null

export const selectSignUpStatus = (state) =>
  state.auth?.signUpStatus ?? "idle"
export const selectSignUpError = (state) => state.auth?.signUpError ?? null
