import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { adminService } from "../../service/adminService.js"
import { certificateService } from "../../service/certificateService.js"
import { eventService } from "../../service/eventService.js"
import contactService from "../../service/contactService.js"

const StatCard = ({ title, value, subtitle, route }) => {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => route && navigate(route)}
      className="bg-gray-900 border border-gray-800 rounded-xl p-5
                 cursor-pointer hover:border-gray-700
                 hover:bg-gray-800/40 transition
                 w-full"
    >
      <p className="text-sm text-gray-400">{title}</p>
      <h2 className="text-2xl font-semibold text-gray-100 mt-1">
        {value}
      </h2>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-2">
          {subtitle}
        </p>
      )}
    </div>
  )
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: "—",
    totalEvents: "—",
    certificatesIssued: "—",
    newContacts: "—",
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true)

        const [
          usersRes,
          eventsRes,
          certificatesRes,
          contactsRes,
        ] = await Promise.all([
          adminService.getAllUsers(),
          eventService.getAllEvents(),
          certificateService.getAllCertificates(),
          contactService.getContactRequests({ page: 1, limit: 1000 }),
        ])

        setStats({
          totalUsers: usersRes.totalUsers,
          totalEvents: eventsRes.length,
          certificatesIssued: certificatesRes.filter(
            c => c.status === "issued"
          ).length,
          newContacts: contactsRes.total,
        })
      } catch (error) {
        console.error("Admin dashboard fetch failed:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  return (
    /* ✅ WIDTH CONSTRAINER (CRITICAL FIX) */
    <div className="w-full max-w-full overflow-hidden">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Overview of platform activity
        </p>
      </div>

      {/* ✅ GRID CONSTRAINED TO AVAILABLE WIDTH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-full">
        <StatCard
          title="Total Users"
          value={loading ? "—" : stats.totalUsers}
          subtitle="Including members & admins"
          route="/admin/users"
        />

        <StatCard
          title="Active Members"
          value="—"
          subtitle="Approved memberships"
          route="/admin/members"
        />

        <StatCard
          title="Events"
          value={loading ? "—" : stats.totalEvents}
          subtitle="Past & upcoming events"
          route="/admin/events"
        />

        <StatCard
          title="Certificates Issued"
          value={loading ? "—" : stats.certificatesIssued}
          subtitle="Across all events"
          route="/admin/certificates"
        />

        <StatCard
          title="New Contact Messages"
          value={loading ? "—" : stats.newContacts}
          subtitle="Last 7 days"
          route="/admin/contacts"
        />
      </div>

    </div>
  )
}

export default AdminDashboard
