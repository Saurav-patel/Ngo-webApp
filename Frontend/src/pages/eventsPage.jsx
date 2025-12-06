import { useEffect, useState } from "react"
import { eventService } from "../service/eventService.js"
import EventShowcase from "../components/eventShowcase"

const AllEventsPage = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const fetchEvents = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await eventService.getAllEvents()
        if (!cancelled) {
          setEvents(data || [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load events")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchEvents()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="bg-gray-950 min-h-screen text-gray-100">
      {/* keep spacing consistent with EventShowcase (max-w-7xl etc.) */}
      <div className="max-w-7xl mx-auto px-2 md:px-4 py-10 md:py-14 space-y-6">
        {/* Small page heading / breadcrumb */}
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-400">
              All Events
            </p>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold">
              Every initiative in one place.
            </h1>
            <p className="text-xs md:text-sm text-gray-400 max-w-2xl">
              Browse all our programs, drives, and training sessions captured
              directly from the field.
            </p>
          </div>
        </div>

        {/* Loading / error / empty */}
        {loading && (
          <div className="text-sm text-gray-400 pt-4">Loading events...</div>
        )}

        {error && (
          <div className="text-sm text-red-400 pt-4">
            {error} – please try again later.
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="text-sm text-gray-400 pt-4">
            No events to display right now. Check back soon.
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <EventShowcase
            events={events}
            headingPrefix="All Events"
            headingTitle="See every moment of impact."
            headingSubtitle="From skills training to hunger relief, explore the full timeline of our work on the ground."
          />
        )}
      </div>
    </div>
  )
}

export default AllEventsPage