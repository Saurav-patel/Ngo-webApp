import { loginUser } from "../store/slices/authSlice.js";
import { useState } from "react";
import { useDispatch , useSelector } from "react-redux";

const LoginPage = () => {
  const dispatch = useDispatch()
  const { status, error, user } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) return

    await dispatch(loginUser(formData))
    // after success you can navigate to dashboard
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md px-8 py-10">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Enter your password"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={status === "loading"}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white transition 
              ${
                status === "loading"
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {status === "loading" ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Error message */}
        {error && (
          <p className="mt-3 text-sm text-red-600 text-center">
            {error}
          </p>
        )}

        {/* Debug / success info */}
        {user && (
          <p className="mt-3 text-sm text-green-600 text-center">
            Logged in as{" "}
            <span className="font-semibold">
              {user.username || user.email}
            </span>
          </p>
        )}
      </div>
    </div>
  )
}

export default LoginPage