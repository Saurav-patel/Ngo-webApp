import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { contactService } from "../../service/contactService.js"

const ContactMessage = () => {
  const { contactId } = useParams()
  const navigate = useNavigate()

  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadMessage = async () => {
      try {
        const data = await contactService.getContactRequestById(contactId)
        setMessage(data)
      } catch (err) {
        setError(err.message || "Failed to load contact message")
      } finally {
        setLoading(false)
      }
    }

    loadMessage()
  }, [contactId])

  const markAsResolved = async () => {
    try {
      setUpdating(true)
      await contactService.updateContactRequestStatus(contactId, {
        status: "resolved",
      })
      setMessage((prev) => ({ ...prev, status: "resolved" }))
    } catch (err) {
      alert(err.message || "Failed to update status")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-gray-400">Loading message…</div>
  }

  if (error) {
    return <div className="p-6 text-red-400">{error}</div>
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-400 hover:underline"
      >
        ← Back to Contact Inbox
      </button>

      <h1 className="text-xl font-semibold text-gray-100">
        Contact Message
      </h1>

      {/* Meta Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Info label="Name" value={message.name} />
        <Info label="Email" value={message.email} />
        <Info label="Phone" value={message.phone || "—"} />
        <Info label="Reason" value={message.reason} />
        <Info
          label="Status"
          value={message.status}
          status
        />
        <Info
          label="Submitted On"
          value={new Date(message.createdAt).toLocaleString()}
        />
      </div>

      {/* Message Body */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">
          Message
        </h2>
        <p className="text-gray-200 whitespace-pre-line leading-relaxed">
          {message.message}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {message.status === "pending" && (
          <button
            onClick={markAsResolved}
            disabled={updating}
            className="px-4 py-2 bg-green-600 text-sm rounded hover:bg-green-700 disabled:opacity-60"
          >
            Mark as Resolved
          </button>
        )}

        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-800 text-sm rounded hover:bg-gray-700"
        >
          Back
        </button>
      </div>
    </div>
  )
}

const Info = ({ label, value, status }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p
      className={`text-sm ${
        status
          ? value === "pending"
            ? "text-yellow-400 capitalize"
            : "text-green-400 capitalize"
          : "text-gray-200"
      }`}
    >
      {value}
    </p>
  </div>
)

export default ContactMessage
