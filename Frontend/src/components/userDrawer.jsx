import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  IdCard,
  Award,
  FileText,
  Settings,
  LogOut
} from "lucide-react"

const UserDrawer = ({ open, close }) => {
  const user = useSelector((state) => state.auth?.user)
  console.log(user)

  const avatar =
    user?.photo?.url || "/default-avatar.png"

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={close}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 z-50
        bg-gray-950 text-gray-200 shadow-2xl
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <img
              src={avatar}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border border-gray-700 bg-white"
            />

            <div>
              <p className="text-sm font-semibold leading-tight">
                {user?.name || "Member"}
              </p>
              <p className="text-xs text-gray-400">
                {user?.email || "user@email.com"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <DrawerItem
            to="/my/id-card"
            icon={<IdCard size={18} />}
            label="My ID Card"
            onClick={close}
          />
          <DrawerItem
            to="/my/certificates"
            icon={<Award size={18} />}
            label="Certificates"
            onClick={close}
          />
          <DrawerItem
            to="/my/documents"
            icon={<FileText size={18} />}
            label="Documents"
            onClick={close}
          />
          <DrawerItem
            to="/my/settings"
            icon={<Settings size={18} />}
            label="Account Settings"
            onClick={close}
          />
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <button
            className="flex items-center gap-3 w-full px-3 py-2
            rounded-lg text-red-400 hover:bg-red-500/10
            transition"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
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
    className="flex items-center gap-3 px-3 py-2 rounded-lg
    text-gray-300 hover:text-white
    hover:bg-gray-800 transition"
  >
    {icon}
    <span className="text-sm">{label}</span>
  </Link>
)
