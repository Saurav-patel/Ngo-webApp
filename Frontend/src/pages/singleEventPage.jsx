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

    const fetchEvent = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await eventService.getEventDetails(eventId)
        if (!cancelled) setEvent(data)

        const myEvents = await eventService.myParticipatedEvents()
        const alreadyRegistered = myEvents.some(
          (p) => p.eventId?._id === eventId
        )

        if (!cancelled) setRegistered(alreadyRegistered)

      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load event")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (eventId) fetchEvent()

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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-300">
        Loading event...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-400">
        {error}
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">

        <h1 className="text-3xl font-semibold">{event.title}</h1>

        <p className="text-gray-300 text-sm">
          {formatDate(event.startDate)} • {event.location}
        </p>

        <p className="text-gray-200 leading-relaxed">
          {event.description}
        </p>

        <div className="max-w-sm">

          {event.status === "COMPLETED" ? (
            <button
              disabled
              className="w-full bg-gray-700 text-gray-300 py-2.5 rounded-xl cursor-not-allowed"
            >
              Finished
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

        <Link to="/" className="text-sm text-gray-400 hover:text-emerald-400">
          ← Back to events
        </Link>

      </div>
    </div>
  )
}

export default EventDetailPage