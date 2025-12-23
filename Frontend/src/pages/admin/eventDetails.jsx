import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { eventService } from "../../service/eventService.js"

const EventDetails = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        const res = await eventService.getEventDetails(eventId)
        setEvent(res)
      } catch (error) {
        console.error("Failed to fetch event details", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  if (loading) {
    return (
      <div className="p-6 text-gray-400">
        Loading event details...
      </div>
    )
  }

  if (!event) {
    return (
      <div className="p-6 text-gray-400">
        Event not found
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-400 hover:text-gray-200 mb-4"
      >
        ← Back to events
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          {event.title}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {new Date(event.startDate).toLocaleDateString()} • {event.location}
        </p>
      </div>

      {/* Description */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-medium text-gray-300 mb-2">
          Description
        </h2>
        <p className="text-sm text-gray-400 whitespace-pre-line">
          {event.description}
        </p>
      </div>

      {/* Photos */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-medium text-gray-300 mb-4">
          Event Photos
        </h2>

        {event.photos && event.photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {event.photos.map((photo, index) => (
              <img
                key={index}
                src={photo.url}
                alt={`Event photo ${index + 1}`}
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

      {/* System Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Created on</span>
          <span>
            {new Date(event.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default EventDetails
