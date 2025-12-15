import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import {
  LayoutDashboard,
  Settings,
  LogOut
} from "lucide-react"
import { logoutUser } from "../store/slices/authSlice.js"

const UserDrawer = ({ open, close }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth?.user)

  // default person image
  const avatar =
    user?.profile_pic_url ||
    "https://cdn-icons-png.flaticon.com/512/847/847969.png"

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      close()
      navigate("/auth/login")
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={close}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 z-50
        bg-gradient-to-b from-gray-950 to-gray-900
        text-gray-200 shadow-[0_0_40px_rgba(0,0,0,0.6)]
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={avatar}
                alt="Profile"
                className="w-14 h-14 rounded-full object-cover
                border-2 border-gray-700 bg-white"
              />
              <span
                className="absolute bottom-0 right-0 w-3 h-3
                bg-green-500 rounded-full ring-2 ring-gray-900"
              />
            </div>

            <div className="leading-tight">
              <p className="text-sm font-semibold">
                {user?.username || "Member"}
              </p>
              <p className="text-xs text-gray-400 truncate max-w-[180px]">
                {user?.email || "user@email.com"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <DrawerItem
            to="/dashboard"
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            onClick={close}
          />

          <DrawerItem
            to="/dashboard/settings"
            icon={<Settings size={18} />}
            label="Account Settings"
            onClick={close}
          />
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2
            rounded-lg text-red-400
            hover:bg-red-500/10 hover:text-red-300
            transition"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default UserDrawer

const DrawerItem = ({ to, icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="group flex items-center gap-3 px-4 py-2 rounded-lg
    text-gray-300 hover:text-white
    hover:bg-gray-800/80 transition"
  >
    <span className="text-gray-400 group-hover:text-white transition">
      {icon}
    </span>
    <span className="text-sm font-medium">{label}</span>
  </Link>
)
