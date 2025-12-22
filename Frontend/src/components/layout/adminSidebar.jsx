import { NavLink } from "react-router-dom"

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
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-800">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
        <p className="text-xs text-gray-400 mt-1">
          NGO Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => (
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
    </aside>
  )
}

export default AdminSidebar
