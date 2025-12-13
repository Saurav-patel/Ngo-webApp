// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { authService } from "../../service/authService.js"
import { userService } from "../../service/userService.js"

/* --------------------------
   Thunks
-------------------------- */

// SIGNUP
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      const user = await authService.signUp(payload)
      return user // ✅ PURE DATA
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error.message ||
        "Signup failed"
      )
    }
  }
)

// LOGIN
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const user = await authService.login(credentials)
      return user // ✅ PURE USER OBJECT
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error.message ||
        "Login failed"
      )
    }
  }
)

// FETCH CURRENT USER
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await userService.getUserDetails()
      return user // ✅ PURE USER OBJECT
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error.message ||
        "Fetching current user failed"
      )
    }
  }
)

/* --------------------------
   Initial State
-------------------------- */

const initialState = {
  user: null,
  isAuthenticated: false,
  status: "idle", // idle | loading | succeeded | failed
  error: null,

  signUpStatus: "idle",
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
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    },
  },
  extraReducers: (builder) => {
    builder

      // REGISTER
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

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.status = "loading"
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.user = action.payload
        state.isAuthenticated = true
        localStorage.setItem("user", JSON.stringify(action.payload))
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed"
        state.user = null
        state.isAuthenticated = false
        state.error = action.payload
      })

      // FETCH CURRENT USER
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.user = action.payload
        state.isAuthenticated = true
        localStorage.setItem("user", JSON.stringify(action.payload))
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed"
        state.user = null
        state.isAuthenticated = false
        state.error = action.payload
      })
  },
})

export const { logOut } = authSlice.actions
export default authSlice.reducer

/* --------------------------
   Selectors
-------------------------- */

export const selectAuthUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthStatus = (state) => state.auth.status
export const selectAuthError = (state) => state.auth.error
export const selectSignUpStatus = (state) => state.auth.signUpStatus
export const selectSignUpError = (state) => state.auth.signUpError