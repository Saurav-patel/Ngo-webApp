import { eventService } from "../service/eventService.js"
import { useEffect, useRef, useState } from "react"
import EventShowcase from "../components/eventShowcase.jsx"

const HomePage = () => {

  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState(null)
  const [eventsSectionVisible, setEventsSectionVisible] = useState(false)
  const [eventsFetched, setEventsFetched] = useState(false)

  const eventsSectionRef = useRef(null)

 
  useEffect(() => {
    const section = eventsSectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setEventsSectionVisible(true)

          if (!eventsFetched) {
            setEventsFetched(true)
            setEventsLoading(true)
            try {
              const data = await eventService.getAllEvents()
              setEvents(data || [])
            } catch (err) {
              console.error(err)
              setEventsError(err.message || "Failed to load events")
            } finally {
              setEventsLoading(false)
            }
          }
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [eventsFetched])

  return (
    <div className="bg-gray-50 relative">
      {/* ---- HERO SECTION ---- */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: "url('/bg-image.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-[1.3fr,1fr] items-center">
            {/* Left text */}
            <div className="space-y-4 md:space-y-6">
              <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-yellow-300">
                Now we need your help
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                Together we can rewrite{" "}
                <span className="text-yellow-300">a child&apos;s future.</span>
              </h1>
              <p className="text-sm md:text-base text-gray-100 max-w-xl">
                Your support turns empty classrooms into learning spaces and
                silent nights into dreams full of possibilities.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button className="px-5 py-2.5 rounded-full bg-yellow-400 text-gray-900 text-sm font-semibold shadow-md hover:bg-yellow-300 transition">
                  Donate Now
                </button>
                <button className="px-5 py-2.5 rounded-full border border-gray-200/60 text-sm font-semibold text-gray-50 hover:bg-white/5 transition">
                  Become a Volunteer
                </button>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="group relative w-[260px] md:w-[320px] lg:w-[360px]">
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/40 backdrop-blur-sm">
                  <img
                    src="/img2.jpg"
                    alt="Children education"
                    className="w-full h-64 md:h-80 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={eventsSectionRef}
        className={`transition-all duration-700 ${
          eventsSectionVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6"
        }`}
      >
        {!eventsLoading && !eventsError && events.length > 0 && (
          <EventShowcase events={events} />
        )}
      </section>

      
    </div>
  )
}

export default HomePage
