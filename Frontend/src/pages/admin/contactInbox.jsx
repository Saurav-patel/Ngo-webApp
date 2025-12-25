import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { contactService } from "../../service/contactService.js"

const ContactInbox = () => {
  const navigate = useNavigate()

  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const res = await contactService.getContactRequests({ page })
        setItems(res.items)
        setTotalPages(res.totalPages)
      } catch (err) {
        setError(err.message || "Failed to load contact requests")
      } finally {
        setLoading(false)
      }
    }

    loadRequests()
  }, [page])

  if (loading) {
    return <div className="p-6 text-gray-400">Loading contact requests…</div>
  }

  if (error) {
    return <div className="p-6 text-red-400">{error}</div>
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-100">
        Contact Requests
      </h1>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-gray-300">
          <thead className="bg-gray-800 text-gray-400">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Message</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-400">
                  No contact requests found
                </td>
              </tr>
            )}

            {items.map((req) => (
              <tr
                key={req._id}
                className="border-t border-gray-800 hover:bg-gray-800/40 transition"
              >
                <td className="p-3">{req.name}</td>
                <td className="p-3 text-gray-400">{req.email}</td>
                <td className="p-3">{req.phone || "—"}</td>
                <td className="p-3 capitalize">{req.reason}</td>
                <td className="p-3 max-w-xs truncate">
                  {req.message}
                </td>
                <td className="p-3">
                  {new Date(req.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <span
                    className={`capitalize ${
                      req.status === "pending"
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() =>
                      navigate(`/admin/contacts/${req._id}`)
                    }
                    className="text-blue-400 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-end gap-3 text-sm">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 rounded bg-gray-800 text-gray-300 disabled:opacity-40"
        >
          Prev
        </button>

        <span className="text-gray-400">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 rounded bg-gray-800 text-gray-300 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default ContactInbox
