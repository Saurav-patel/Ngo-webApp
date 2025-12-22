import { Navigate, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"
import { selectAuthUser, selectAuthStatus } from "../store/slices/authSlice.js"

const RequireAdmin = () => {
    const user = useSelector(selectAuthUser)
    const status = useSelector(selectAuthStatus)

    if (status === "idle" || status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-400 text-sm">Checking admin access…</p>
            </div>
        )
    }

    // not admin
    if (!user || user.role !== "admin") {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default RequireAdmin