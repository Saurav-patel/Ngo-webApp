import { NavLink, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import toast from "react-hot-toast"
import { logoutUser } from "../../store/slices/authSlice.js"

const navItems = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Users", path: "/admin/users" },
  { label: "Members", path: "/admin/members" },
  { label: "Events", path: "/admin/events" },
  { label: "Certificates", path: "/admin/certificates" },
  { label: "Notices", path: "/admin/notices" },
  { label: "Contact Messages", path: "/admin/contacts" },
]

const AdminSidebar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

 const handleLogout = async () => {
    try {
      console.log("Logging out admin...")
      await dispatch(logoutUser()).unwrap()
      close()
      navigate("/auth/login")
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  return (
    <aside className="w-64 h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-gray-100">
          Admin Panel
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          NGO Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md text-sm transition
              ${
                isActive
                  ? "bg-gray-800 text-gray-100"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* ✅ LOGOUT — STICKS TO BOTTOM */}
      <div className="px-3 py-4 border-t border-gray-800 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm text-red-500 font-medium
                     rounded-md hover:bg-gray-800 transition text-left"
        >
          Logout
        </button>
      </div>

    </aside>
  )
}

export default AdminSidebar
