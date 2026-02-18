import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { donationService, loadRazorpay } from "../../service/donationService.js"
import { useDonationPolling } from "./donationPolling.jsx"
import { selectIsAuthenticated } from "../../store/slices/authSlice.js"

const AMOUNTS = [100, 250, 500, 1000, 5000]

const DonationCheckout = () => {
  const navigate = useNavigate()

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const authChecked = useSelector(state => state.auth.authChecked)

  const [amount, setAmount] = useState(500)
  const [orderId, setOrderId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [polling, setPolling] = useState(false)

  const [status, setStatus] = useState(null)
  const [message, setMessage] = useState("")

  const [donorName, setDonorName] = useState("")
  const [donorEmail, setDonorEmail] = useState("")
  const [donorPhone, setDonorPhone] = useState("")

  useEffect(() => {
    if (status === "SUCCESS") {
      const t = setTimeout(() => {
        navigate("/")
      }, 1200)
      return () => clearTimeout(t)
    }
  }, [status, navigate])

  if (!authChecked) {
    return (
      <div className="py-20 text-center text-slate-400">
        Loading...
      </div>
    )
  }

  useDonationPolling({
    orderId,
    enabled: polling,
    onStatusChange: s => {
      if (s === "CAPTURED") {
        setStatus("SUCCESS")
        setMessage("Thank you! Your donation was successful.")
        setPolling(false)
      }
      if (s === "FAILED") {
        setStatus("FAILED")
        setMessage("Payment failed. No money was deducted.")
        setPolling(false)
      }
      if (s === "CREATED") {
        setStatus("PROCESSING")
        setMessage("Payment is processing. Please wait.")
      }
    },
    onTimeout: () => {
      setStatus("PROCESSING")
      setMessage("Payment is taking longer. Please check later.")
      setPolling(false)
    }
  })

  const startDonation = async () => {
    try {
      setLoading(true)
      setMessage("")
      setStatus(null)

      if (!isAuthenticated && (!donorName.trim() || !donorEmail.trim())) {
        setMessage("Please enter your name and email to continue")
        setLoading(false)
        return
      }

      const payload = { amount, purpose: "DONATION" }

      if (!isAuthenticated) {
        payload.name = donorName.trim()
        payload.email = donorEmail.trim().toLowerCase()
        if (donorPhone.trim()) payload.phone = donorPhone.trim()
      }

      const order = await donationService.createDonationOrder(payload)
      setOrderId(order.orderId)

      const razorpayLoaded = await loadRazorpay()
      if (!razorpayLoaded) {
        setMessage("Payment gateway failed to load")
        return
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "NGO Donation",
        description: "Support our cause",

        handler: async response => {
          await donationService.acknowledgeDonationPayment(response)
          setStatus("PROCESSING")
          setMessage("Payment received. Confirming...")
          setPolling(true)
        },

        modal: {
          ondismiss: () => {
            setStatus("PROCESSING")
            setMessage("Checking payment status...")
            setPolling(true)
          }
        },

        theme: { color: "#16a34a" }
      }

      new window.Razorpay(options).open()
    } catch {
      setMessage("Unable to initiate donation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900 py-16 px-4">
      <div className="flex justify-center">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl shadow-lg px-6 py-6">

          <h2 className="text-2xl font-semibold text-slate-100 text-center">
            Make a Donation
          </h2>
          <p className="text-sm text-slate-400 text-center mb-6">
            Secure • Transparent • 80G Tax Benefits
          </p>

          {!isAuthenticated && (
            <div className="space-y-4 mb-6">
              <input
                placeholder="Your name *"
                value={donorName}
                onChange={e => setDonorName(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Your email *"
                value={donorEmail}
                onChange={e => setDonorEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
              <input
                placeholder="Phone (optional)"
                value={donorPhone}
                onChange={e => setDonorPhone(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-slate-300 mb-2">Amount</p>
            <div className="flex flex-wrap gap-2">
              {AMOUNTS.map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-full text-sm border transition
                    ${
                      amount === v
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-400"
                        : "border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                >
                  ₹{v}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startDonation}
            disabled={
              loading ||
              (!isAuthenticated && (!donorName.trim() || !donorEmail.trim()))
            }
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold py-3 rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Proceed to Secure Payment"}
          </button>

          {message && (
            <p
              className={`mt-4 text-sm text-center font-medium ${
                status === "SUCCESS"
                  ? "text-emerald-400"
                  : status === "FAILED"
                  ? "text-red-400"
                  : "text-amber-400"
              }`}
            >
              {message}
            </p>
          )}

          <div className="mt-6 text-xs text-slate-400 text-center">
            Registered NGO • 12A & 80G • Razorpay Secure
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonationCheckout
