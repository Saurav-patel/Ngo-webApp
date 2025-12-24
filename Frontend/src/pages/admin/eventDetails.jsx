import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { eventService } from "../../service/eventService.js"

const EventDetails = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const eventRes = await eventService.getEventDetails(eventId)
        const participantsRes = await eventService.getAllParticipants(eventId)
        console.log("Event details:", eventRes)
        setEvent(eventRes)
        setParticipants(participantsRes)
      } catch (error) {
        console.error("Failed to fetch event details", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [eventId])

  const handleDelete = async () => {
    const ok = window.confirm(
      "This action is irreversible. Do you really want to delete this event?"
    )
    if (!ok) return

    try {
      setDeleting(true)
      await eventService.deleteEvent(eventId)
      navigate("/admin/events")
    } catch (err) {
      alert("Failed to delete event")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-gray-400">Loading event details...</div>
  }

  if (!event) {
    return <div className="p-6 text-gray-400">Event not found</div>
  }

  return (
    <div className="p-6 max-w-6xl space-y-6 text-gray-200">

      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-400 hover:text-gray-200"
      >
        ← Back to events
      </button>

      {/* HEADER */}
      <div className="flex justify-between items-start bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div>
          <h1 className="text-2xl font-semibold">{event.title}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {new Date(event.startDate).toLocaleDateString()} • {event.location}
          </p>
        </div>

        <div className="space-x-3">
          <button
            onClick={() => navigate(`/admin/events/edit/${eventId}`)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
          >
            Edit Event
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Event"}
          </button>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-medium text-gray-300 mb-2">
          Description
        </h2>
        <p className="text-sm text-gray-400 whitespace-pre-line">
          {event.description}
        </p>
      </div>

      {/* PHOTOS */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-medium text-gray-300 mb-4">
          Event Photos
        </h2>

        {event.photos?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {event.photos.map((photo, index) => (
              <img
                key={index}
                src={photo.url}
                alt="event"
                className="rounded-lg object-cover h-32 w-full border border-gray-800"
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            No photos uploaded for this event
          </p>
        )}
      </div>

      {/* PARTICIPANTS */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-medium text-gray-300 mb-4">
          Participants ({participants.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {participants.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    No participants yet
                  </td>
                </tr>
              ) : (
                participants.map(p => (
                  <tr
                    key={p._id}
                    className="border-t border-gray-800 hover:bg-gray-800/40"
                  >
                    <td className="px-4 py-2">
                      {p.userId?.username || "-"}
                    </td>
                    <td className="px-4 py-2">
                      {p.userId?.email || "-"}
                    </td>
                    <td className="px-4 py-2">
                      <span className="px-3 py-1 text-xs rounded-full bg-gray-700">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SYSTEM INFO */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Created on</span>
          <span>{new Date(event.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}

export default EventDetails
