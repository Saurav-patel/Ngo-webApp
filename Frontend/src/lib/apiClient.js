import axios from "axios"

const baseURL = import.meta.env.VITE_BACKEND_URL

const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true
})

// -------- Helpers for refresh handling --------
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

// -------- Request Interceptor --------
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

// -------- Response Interceptor (Silent Refresh) --------
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error?.response?.status

    // If no response or it's not 401 -> just reject
    if (!status || status !== 401) {
      return Promise.reject(error)
    }

    // Already retried once -> don't loop
    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    // Queue requests while refresh is in progress
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

    originalRequest._retry = true
    isRefreshing = true

    try {
      // Call refresh-token endpoint using cookie
      const refreshResponse = await axios.post(
        `${baseURL}/auth/refresh-token`,
        {},
        {
          withCredentials: true
        }
      )

      const newToken = refreshResponse?.data?.accessToken

      if (!newToken) {
        throw new Error("No access token returned from refresh-token endpoint")
      }

      // Save new access token
      localStorage.setItem("token", newToken)

      // Update default header for future requests
      apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`

      // Resolve queued requests
      processQueue(null, newToken)

      // Retry the original request with new token
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)

      // Hard logout
      localStorage.removeItem("token")
      localStorage.removeItem("user") // if you store user here

      window.location.href = "/login"

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient
