
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { authService } from "../../service/authService.js"

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      await authService.signUp(payload)
      return true
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error.message ||
        "Signup failed"
      )
    }
  }
)

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const user = await authService.login(credentials)
      return user
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error.message ||
        "Login failed"
      )
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser()
      return user
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error.message ||
        "Session expired"
      )
    }
  }
)

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
      return true
    } catch (error) {
      return rejectWithValue("Logout failed")
    }
  }
)

const initialState = {
  user: null,
  isAuthenticated: false,
  status: "idle",        
  error: null,

  signUpStatus: "idle",
  signUpError: null,
}


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    
    logOut: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.status = "idle"
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder

      
      .addCase(registerUser.pending, (state) => {
        state.signUpStatus = "loading"
        state.signUpError = null
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.signUpStatus = "succeeded"
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.signUpStatus = "failed"
        state.signUpError = action.payload
      })

      
      .addCase(loginUser.pending, (state) => {
        state.status = "loading"
        state.error = null
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

      
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        
        state.status = "idle"
        state.user = null
        state.isAuthenticated = false
      })

     
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })
      
  },
})


export const { logOut } = authSlice.actions
export default authSlice.reducer

export const selectAuthUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthStatus = (state) => state.auth.status
export const selectAuthError = (state) => state.auth.error
export const selectSignUpStatus = (state) => state.auth.signUpStatus
export const selectSignUpError = (state) => state.auth.signUpError
