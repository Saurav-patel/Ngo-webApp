import axios from "axios"

const baseURL = import.meta.env.VITE_BACKEND_URL

const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true, // ✅ send cookies
})

/* =========================
   REFRESH CONTROL
========================= */
let isRefreshing = false
let failedQueue = []

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve()
  })
  failedQueue = []
}

/* =========================
   REQUEST INTERCEPTOR
   (Nothing added — cookies only)
========================= */
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

/* =========================
   RESPONSE INTERCEPTOR
========================= */
apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config
    const status = error?.response?.status

    // Only handle unauthorized errors
    if (status !== 401 || !originalRequest) {
      return Promise.reject(error)
    }

    const url = originalRequest.url || ""

    // ❌ Never refresh on auth endpoints
    if (
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout")
    ) {
      return Promise.reject(error)
    }

    // ❌ Prevent infinite retry loops
    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    // ⏳ Queue requests while refresh is in progress
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // 🔄 Refresh access token using refresh-token cookie
      await apiClient.post("/auth/refresh")

      // Retry all queued requests
      processQueue(null)

      // Retry original request
      return apiClient(originalRequest)

    } catch (refreshError) {
      processQueue(refreshError)

      // ❌ Do NOT redirect here
      // ❌ Do NOT clear cookies here
      // Redux / app-level logic should handle logout

      return Promise.reject(refreshError)

    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient
