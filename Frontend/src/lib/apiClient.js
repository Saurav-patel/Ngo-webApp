import axios from "axios"

const baseURL = import.meta.env.VITE_BACKEND_URL

const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true
})

// ---------------------
// Refresh Control
// ---------------------
let isRefreshing = false
let failedQueue = []

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve()
  })
  failedQueue = []
}

// ---------------------
// REQUEST INTERCEPTOR
// ---------------------
apiClient.interceptors.request.use(
  (config) => {
    // ❌ NO localStorage
    // ❌ NO Authorization header
    // Cookies handle auth
    return config
  },
  (error) => Promise.reject(error)
)

// ---------------------
// RESPONSE INTERCEPTOR
// ---------------------
apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config
    const status = error?.response?.status

    if (status !== 401 || !originalRequest) {
      return Promise.reject(error)
    }

    const url = originalRequest.url || ""

    // ❌ NEVER refresh on auth endpoints
    if (
      url.includes("/auth/login") ||
      url.includes("/auth/refresh-token") ||
      url.includes("/auth/logout")
    ) {
      return Promise.reject(error)
    }

    // ❌ Prevent retry loops
    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    // Queue requests while refresh is happening
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // Try refreshing session (cookie-based)
      await apiClient.post("/auth/refresh-token")

      processQueue(null)

      // Retry original request
      return apiClient(originalRequest)

    } catch (refreshError) {
      processQueue(refreshError)

      // ❌ NO redirect
      // ❌ NO storage cleanup
      // Redux will handle logout

      return Promise.reject(refreshError)

    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient
