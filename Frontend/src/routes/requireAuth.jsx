import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  selectIsAuthenticated,
  selectAuthStatus
} from "../store/slices/authSlice"

const RequireAuth = () => {
  const isAuth = useSelector(selectIsAuthenticated)
  const status = useSelector(selectAuthStatus)
  const location = useLocation()

  console.log("RequireAuth:", { isAuth, status })

  // ⏳ WAIT while auth is NOT resolved
  if (status === "idle" || status === "loading") {
    return null // or a full-page loader
  }

  // 🔐 NOT AUTHENTICATED
  if (!isAuth) {
    return (
      <Navigate
        to="/auth/login"
        state={{ from: location }}
        replace
      />
    )
  }

  return <Outlet />
}

export default RequireAuth
