import { useEffect, useState } from "react"
import { membershipService } from "../../service/membershipService"

const MembershipDetails = () => {
  const [members, setMembers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const data = await membershipService.getAllMembers()
      setMembers(data)
      setFiltered(data)
    } catch {
      alert("Failed to load members")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const lower = search.toLowerCase()
    const result = members.filter(m =>
      m.user?.name?.toLowerCase().includes(lower) ||
      m.user?.email?.toLowerCase().includes(lower)
    )
    setFiltered(result)
  }, [search, members])

  const getStatusBadge = status => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500"
      case "PENDING":
        return "bg-amber-500/15 text-amber-400 border-amber-500"
      case "FAILED":
        return "bg-red-500/15 text-red-400 border-red-500"
      case "EXPIRED":
        return "bg-slate-500/15 text-slate-400 border-slate-500"
      default:
        return "bg-slate-700 text-slate-300"
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        Loading members...
      </div>
    )
  }

  return (
    <div className="bg-slate-900 min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">

        <h2 className="text-3xl font-bold text-slate-100 mb-6">
          Membership Management
        </h2>

        {/* Search */}
        <div className="mb-6">
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-80 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-700 rounded-xl">
          <table className="min-w-full text-sm text-left text-slate-300">
            <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">End</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(member => (
                <tr
                  key={member._id}
                  className="border-t border-slate-700 hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-100">
                      {member.user?.name || "N/A"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {member.user?.email}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {member.plan?.name}
                  </td>

                  <td className="px-4 py-3">
                    ₹{member.amountPaid}
                  </td>

                  <td className="px-4 py-3">
                    {member.startDate
                      ? new Date(member.startDate).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-4 py-3">
                    {member.endDate
                      ? new Date(member.endDate).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full border ${getStatusBadge(
                        member.status
                      )}`}
                    >
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-6 text-slate-500">
              No members found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MembershipDetails