
import { useEffect, useState } from "react"
import { ngoService } from "../service/ngoService.js"

const formatDate = (dateStr) => {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })
}

const AboutPage = () => {
  const [ngo, setNgo] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const data = await ngoService.getNgoInfo()
        if (cancelled) return
        setNgo(data.ngo)
        setDocuments(data.documents)
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load information")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => (cancelled = true)
  }, [])

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-300">
        Loading About Page...
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-400">
        {error}
      </div>
    )

  const impactStats = [
    { label: "Families Impacted", value: "100+" },
    { label: "Women Trained", value: "30+" },
    { label: "Children Supported", value: "50+" }
  ]

  return (
    <div className="bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto px-2 md:px-4 py-10 md:py-14 space-y-10 md:space-y-12">
        <section className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
          <div className="w-24 h-24 rounded-3xl bg-white border border-gray-200 shadow-xl overflow-hidden flex items-center justify-center">
            <img
              src="/logo.png"
              alt="NGO Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-3">
            <p className="uppercase text-emerald-400 tracking-[0.25em] text-[11px]">
              About Us
            </p>
            <h1 className="text-3xl md:text-4xl font-bold">
              {ngo.name}
            </h1>

            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
              {ngo.missionStatement}
            </p>

            <div className="flex flex-wrap gap-3 text-xs text-gray-400 pt-2">
              <span className="bg-gray-900 border border-gray-700 px-3 py-1 rounded-full">
                Reg No: {ngo.registrationNumber}
              </span>
              <span className="bg-gray-900 border border-gray-700 px-3 py-1 rounded-full">
                Established: {formatDate(ngo.establishedDate)}
              </span>
              <span className="bg-gray-900 border border-gray-700 px-3 py-1 rounded-full">
                {ngo.address}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 pt-3 text-xs">
              <a className="hover:text-white" href={`mailto:${ngo.contactEmail}`}>
                📧 {ngo.contactEmail}
              </a>
              <a className="hover:text-white" href={`tel:${ngo.contactPhone}`}>
                📞 {ngo.contactPhone}
              </a>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Our Impact</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {impactStats.map((item) => (
              <div
                key={item.label}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/70 rounded-3xl p-6 shadow-xl hover:border-emerald-400/40 transition"
              >
                <p className="text-3xl font-bold text-emerald-400">
                  {item.value}
                </p>
                <p className="text-sm text-gray-300 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900/60 rounded-3xl border border-gray-700 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-emerald-400 mb-2">
              Our Mission
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {ngo.missionStatement}
            </p>
          </div>

          <div className="bg-gray-900/60 rounded-3xl border border-gray-700 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-emerald-400 mb-2">
              Our Vision
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {ngo.visionStatement}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Our Core Team</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ngo.members.map((m) => (
              <div
                key={m._id}
                className="bg-gray-900/70 p-5 border border-gray-700 rounded-3xl shadow-lg hover:border-emerald-400/40 transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-700">
                    <img
                      src={m.photo?.url}
                      className="w-full h-full object-cover"
                      alt={m.name}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">
                      {m.name}
                    </p>
                    <p className="text-[11px] uppercase text-emerald-400 tracking-wide">
                      {m.designation}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-400">📍 {m.city}</p>
                <p className="text-xs text-gray-400 truncate">
                  📧 {m.email}
                </p>
                <p className="text-xs text-gray-400">📞 {m.phone}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Verified Certificates</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {documents.map((doc) => {
              const file = doc.fileUrl?.[0]
              
              if (doc.title.toLowerCase().includes("logo")) return null

              return (
                <div
                  key={doc._id}
                  className="bg-gray-900/70 border border-gray-700 rounded-3xl p-5 shadow-lg hover:border-emerald-400/40 transition flex flex-col justify-between"
                >
                  <div>
                    <p className="font-semibold text-sm text-white">
                      {doc.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-3">
                      {doc.description}
                    </p>
                  </div>

                  <a
                    href={file?.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-400 mt-3 hover:text-emerald-300 inline-flex items-center gap-1"
                  >
                    View Document ↗
                  </a>
                </div>
              )
            })}
          </div>
        </section>

        <section className="bg-gray-900/60 border border-gray-700 rounded-3xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Partner with {ngo.name}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Volunteer, collaborate, or support our mission today.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold">
              Become a Volunteer
            </button>
            <button className="px-4 py-2 rounded-full border border-gray-500 hover:bg-gray-800 text-xs font-semibold">
              Contact Us
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AboutPage
