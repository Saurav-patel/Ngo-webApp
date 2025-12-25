import { Outlet } from "react-router-dom"
import AdminSidebar from "./AdminSidebar"

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex overflow-hidden">
      
      {/* Sidebar */}
      <AdminSidebar />

      {/* ✅ Main Content (ALLOW FLEX SHRINK) */}
      <main className="flex-1 min-w-0 p-6 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  )
}

export default AdminLayout
