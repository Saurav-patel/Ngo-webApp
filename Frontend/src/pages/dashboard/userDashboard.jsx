import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

import { selectAuthUser } from "../../store/slices/authSlice.js"

import { userService } from "../../service/userService.js"
import { idCardService } from "../../service/idCardService.js"
import { certificateService } from "../../service/certificateService.js"
import { eventService } from "../../service/eventService.js"

const DashboardPage = () => {
  const user = useSelector(selectAuthUser)

  const [membership, setMembership] = useState(null)
  const [idCard, setIdCard] = useState(null)
  const [certificates, setCertificates] = useState([])
  const [participations, setParticipations] = useState([])

  const [loading, setLoading] = useState(true)
  const [certLoading, setCertLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          membershipData,
          idCardData,
          participationData
        ] = await Promise.all([
          userService.getMembershipStatus(),
          idCardService.getMyIdCard().catch(() => null), 
          eventService.myParticipatedEvents()
        ])

        setMembership(membershipData)
        setIdCard(idCardData)
        setParticipations(participationData || [])
      } catch (err) {
        console.error(err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const loadCertificates = async () => {
    if (certificates.length > 0) return
    setCertLoading(true)
    try {
      const data = await certificateService.getMyCertificates()
      setCertificates(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setCertLoading(false)
    }
  }

  const completedParticipations = participations.filter(
    (p) => p.status === "Completed"
  ).length

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back,{" "}
            <span className="text-yellow-400">{user?.username}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Your journey with Bright Future Foundation
          </p>
        </div>

        {loading && (
          <p className="text-sm text-gray-400">
            Loading your dashboard...
          </p>
        )}

        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
           
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Participations"
                value={participations.length}
              />
              <StatCard
                label="Completed"
                value={completedParticipations}
                accent="green"
              />
              <StatCard
                label="Certificates"
                value={certificates.length}
              />
              <StatCard
                label="Membership"
                value={membership?.status || "Inactive"}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <Card title="Membership Status">
                <StatusPill status={membership?.status} />
                {membership?.validity && (
                  <p className="text-sm text-gray-400 mt-3">
                    Valid till{" "}
                    <span className="text-gray-200">
                      {new Date(membership.validity).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </Card>

              <Card title="ID Card">
                {idCard ? (
                  <>
                    <p className="text-sm text-green-400 font-semibold">
                      Issued & Available
                    </p>
                    <a
                      href={idCard.fileUrl}
                      target="_blank"
                      download
                      className="inline-block mt-3 text-sm font-semibold text-yellow-400 hover:text-yellow-300"
                    >
                      Download ID Card
                    </a>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">
                    ID card will be issued after verification
                  </p>
                )}
              </Card>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-100">
                  Support Our Next Initiative
                </h3>
                <p className="text-sm text-gray-400 mt-1 max-w-md">
                  Every contribution helps us reach one more child with
                  education, care, and hope.
                </p>
              </div>

              <button className="px-6 py-3 rounded-full bg-yellow-400 text-gray-900 text-sm font-semibold hover:bg-yellow-300 transition">
                Donate Now
              </button>
            </div>

            <Section title="Certificates" onAction={loadCertificates}>
              {certLoading && (
                <p className="text-sm text-gray-400">
                  Loading certificates...
                </p>
              )}

              {!certLoading && certificates.length === 0 && (
                <p className="text-sm text-gray-400">
                  No certificates available yet.
                </p>
              )}

              {!certLoading && certificates.length > 0 && (
                <ul className="space-y-3">
                  {certificates.map((cert) => (
                    <li
                      key={cert._id}
                      className="flex items-center justify-between bg-gray-800/60 rounded-xl px-4 py-3"
                    >
                      <div>
                        <p className="text-sm text-gray-100">
                          {cert.title || "Participation Certificate"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(cert.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <a
                        href={cert.fileUrl}
                        target="_blank"
                        download
                        className="text-sm text-yellow-400 hover:text-yellow-300"
                      >
                        Download
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="My Participations">
              {participations.length === 0 && (
                <p className="text-sm text-gray-400">
                  You haven’t participated in any events yet.
                </p>
              )}

              {participations.length > 0 && (
                <ul className="space-y-4">
                  {participations.map((p) => (
                    <li
                      key={p._id}
                      className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-gray-100">
                          {p.eventTitle}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(p.date).toLocaleDateString()}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                          ${
                            p.status === "Completed"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-yellow-500/10 text-yellow-400"
                          }`}
                      >
                        {p.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  )
}

export default DashboardPage


const Card = ({ title, children }) => (
  <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
    <div className="absolute inset-x-0 top-0 h-[2px] bg-yellow-400 rounded-t-2xl" />
    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
      {title}
    </h3>
    <div className="mt-3">{children}</div>
  </div>
)

const Section = ({ title, onAction, children }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold">{title}</h2>
      {onAction && (
        <button
          onClick={onAction}
          className="text-sm font-semibold text-yellow-400 hover:text-yellow-300"
        >
          View
        </button>
      )}
    </div>
    {children}
  </div>
)

const StatCard = ({ label, value, accent }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
    <p className="text-sm text-gray-400">{label}</p>
    <p
      className={`text-2xl font-bold mt-1 ${
        accent === "green"
          ? "text-green-400"
          : "text-yellow-400"
      }`}
    >
      {value}
    </p>
  </div>
)

const StatusPill = ({ status }) => (
  <span
    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
      ${
        status === "Active"
          ? "bg-green-500/10 text-green-400"
          : "bg-red-500/10 text-red-400"
      }`}
  >
    {status || "Inactive"}
  </span>
)
