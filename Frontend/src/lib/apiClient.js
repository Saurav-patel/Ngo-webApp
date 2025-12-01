import axios from "axios"

const baseURL = import.meta.env.VITE_BACKEND_URL

const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true
})

// ---------------------
// Refresh Helpers
// ---------------------
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// ---------------------
// Request Interceptor
// ---------------------
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ---------------------
// Response Interceptor
// ---------------------
apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config
    const status = error?.response?.status

    // No response OR not a 401 -> reject normally
    if (!status || status !== 401) {
      return Promise.reject(error)
    }

    // 👉 Skip refresh for login & refresh-token endpoint itself
    const url = originalRequest?.url || ""
    if (
      url.includes("/auth/login") ||
      url.includes("/auth/refresh-token")
    ) {
      return Promise.reject(error)
    }

    // Prevent infinite loops
    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    // Queue request if refresh already in progress
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          },
          reject
        })
      })
    }

    // Mark this request for retry
    originalRequest._retry = true
    isRefreshing = true

    try {
      // Call refresh-token endpoint (cookie included automatically)
      const refreshResponse = await axios.post(
        `${baseURL}/auth/refresh-token`,
        {},
        { withCredentials: true }
      )

      const newToken = refreshResponse?.data?.accessToken

      if (!newToken) {
        throw new Error("No access token returned from refresh-token endpoint")
      }

      // Set new token
      localStorage.setItem("token", newToken)
      apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`

      // Resolve all queued requests
      processQueue(null, newToken)

      // Retry original request
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return apiClient(originalRequest)

    } catch (refreshError) {
      processQueue(refreshError, null)

      // Hard logout
      localStorage.removeItem("token")
      localStorage.removeItem("user")

      window.location.href = "/login"

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient
