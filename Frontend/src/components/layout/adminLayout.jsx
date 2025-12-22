import { Outlet } from "react-router-dom"
import AdminSidebar from "./AdminSidebar"

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
