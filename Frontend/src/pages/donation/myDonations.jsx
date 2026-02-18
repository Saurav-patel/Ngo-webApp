import { useEffect, useState } from "react"
import { donationService } from "../../service/donationService.js"

const DonationHistory = () => {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await donationService.getDonationHistory()
        setDonations(data || [])
      } catch {
        setError("Unable to load donation history")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  // ─────────────────────────────────────────────
  // Derived data (API guarantees CAPTURED only)
  // ─────────────────────────────────────────────
  const totalAmount = donations.reduce(
    (sum, d) => sum + (d.amount || 0),
    0
  )

  const lastDonation = donations[0]

  // ─────────────────────────────────────────────
  // States
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        Loading donation history...
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-20 text-center text-red-400">
        {error}
      </div>
    )
  }

  if (!donations.length) {
    return (
      <div className="py-24 text-center">
        <p className="text-slate-400 mb-4">
          You haven’t made any successful donations yet.
        </p>
        <a
          href="/donate"
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold px-6 py-3 rounded-lg transition"
        >
          Make your first donation
        </a>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 px-4 py-12">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-100">
            Donation History
          </h1>
          <p className="text-sm text-slate-400">
            Your successful donations
          </p>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3 mb-10">
          <SummaryCard
            label="Total Donated"
            value={`₹${totalAmount}`}
          />
          <SummaryCard
            label="Total Donations"
            value={donations.length}
          />
          <SummaryCard
            label="Last Donation"
            value={`₹${lastDonation.amount}`}
          />
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Payment ID</th>
              </tr>
            </thead>
            <tbody>
              {donations.map(d => (
                <tr
                  key={d._id}
                  className="border-t border-slate-700 hover:bg-slate-700/40 transition"
                >
                  <td className="px-4 py-3 text-slate-300">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-100 font-medium">
                    ₹{d.amount}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400">
                      SUCCESS
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {d.razorpayPaymentId || d.paymentId || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden space-y-4">
          {donations.map(d => (
            <div
              key={d._id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-4"
            >
              <div className="flex justify-between mb-1">
                <span className="text-slate-400 text-sm">
                  {new Date(d.createdAt).toLocaleDateString()}
                </span>
                <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/15 text-emerald-400">
                  SUCCESS
                </span>
              </div>

              <div className="text-lg font-semibold text-slate-100">
                ₹{d.amount}
              </div>

              <div className="text-xs text-slate-400 mt-1">
                Payment ID: {d.razorpayPaymentId || d.paymentId || "—"}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default DonationHistory

// ─────────────────────────────────────────────

const SummaryCard = ({ label, value }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
    <p className="text-sm text-slate-400 mb-1">{label}</p>
    <p className="text-xl font-semibold text-slate-100">{value}</p>
  </div>
)
