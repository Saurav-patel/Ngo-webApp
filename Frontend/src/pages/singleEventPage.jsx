import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { eventService } from "../service/eventService.js"

const formatDate = (dateStr) => {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })
}

const EventDetailPage = () => {
  const { eventId } = useParams()

  const [event, setEvent] = useState(null)
  const [registered, setRegistered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      try {
        setLoading(true)

        const [eventData, myEvents] = await Promise.all([
          eventService.getEventDetails(eventId),
          eventService.myParticipatedEvents()
        ])

        if (cancelled) return

        setEvent(eventData)

        const alreadyRegistered = myEvents.some(
          (p) => p.eventId?._id === eventId
        )

        setRegistered(alreadyRegistered)

      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load event")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (eventId) fetchData()

    return () => {
      cancelled = true
    }
  }, [eventId])

  const handleParticipate = async () => {
    try {
      await eventService.registerParticipants(eventId)
      setRegistered(true)
      alert("Successfully registered for event")
    } catch (error) {
      alert(error?.response?.data?.message || "Registration failed")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-300">
        Loading event...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-red-400">
        {error}
      </div>
    )
  }

  if (!event) return null

  const isCompleted =
    event.endDate && new Date(event.endDate) < new Date()

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">

        <h1 className="text-3xl font-semibold">{event.title}</h1>

        <p className="text-gray-300 text-sm">
          {formatDate(event.startDate)} • {event.location}
        </p>

        {/* EVENT PHOTOS */}
        {event.photos?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {event.photos.map((photo, i) => (
              <img
                key={i}
                src={photo.url}
                alt={`event-${i}`}
                className="rounded-xl object-cover h-60 w-full"
              />
            ))}
          </div>
        )}

        <p className="text-gray-200 leading-relaxed">
          {event.description}
        </p>

        <div className="max-w-sm">

          {isCompleted ? (
            <button
              disabled
              className="w-full bg-gray-700 text-gray-300 py-2.5 rounded-xl cursor-not-allowed"
            >
              Completed
            </button>
          ) : registered ? (
            <button
              disabled
              className="w-full bg-emerald-700 text-white py-2.5 rounded-xl cursor-not-allowed"
            >
              Registered ✓
            </button>
          ) : (
            <button
              onClick={handleParticipate}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 py-2.5 rounded-xl font-semibold"
            >
              Participate
            </button>
          )}

        </div>

        <Link
          to="/"
          className="text-sm text-gray-400 hover:text-emerald-400"
        >
          ← Back to events
        </Link>

      </div>
    </div>
  )
}

export default EventDetailPage