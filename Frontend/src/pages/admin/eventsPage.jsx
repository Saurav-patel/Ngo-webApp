import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { eventService } from "../../service/eventService.js"

const Events = () => {
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const res = await eventService.getAllEvents()
        setEvents(res)
      } catch (error) {
        console.error("Failed to fetch events", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Events</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage all events
        </p>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Photos</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-gray-400">
                  Loading events...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-gray-400">
                  No events found
                </td>
              </tr>
            ) : (
              events.map(event => (
                <tr
                  key={event._id}
                  className="border-t border-gray-800 hover:bg-gray-800/40 transition"
                >
                  <td className="px-4 py-3 font-medium">
                    {event.title}
                  </td>

                  <td className="px-4 py-3">
                    {new Date(event.startDate).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    {event.location}
                  </td>

                  <td className="px-4 py-3">
                    {event.photos?.length || 0}
                  </td>

                  <td className="px-4 py-3">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/admin/events/${event._id}`)}
                      className="text-blue-400 hover:underline text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Events
