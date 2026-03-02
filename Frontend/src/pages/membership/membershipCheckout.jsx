import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { membershipService } from "../../service/membershipService.js"
import { donationService, loadRazorpay } from "../../service/donationService.js"
import { useDonationPolling } from "../donation/donationPolling.jsx"

const MembershipCheckout = () => {
  const navigate = useNavigate()

  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)

  const [orderId, setOrderId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [polling, setPolling] = useState(false)

  const [status, setStatus] = useState(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const data = await membershipService.getMembershipPlans()
      setPlans(data)
      if (data.length) setSelectedPlan(data[0])
    } catch {
      setMessage("Unable to load membership plans")
    }
  }

  useEffect(() => {
    if (status === "SUCCESS") {
      const t = setTimeout(() => navigate("/"), 1500)
      return () => clearTimeout(t)
    }
  }, [status, navigate])

  useDonationPolling({
    orderId,
    enabled: polling,
    onStatusChange: s => {
      if (s === "CAPTURED") {
        setStatus("SUCCESS")
        setMessage("Membership activated successfully 🎉")
        setPolling(false)
      }
      if (s === "FAILED") {
        setStatus("FAILED")
        setMessage("Payment failed. No money deducted.")
        setPolling(false)
      }
      if (s === "CREATED") {
        setStatus("PROCESSING")
        setMessage("Confirming payment...")
      }
    },
    onTimeout: () => {
      setStatus("PROCESSING")
      setMessage("Payment verification taking longer...")
      setPolling(false)
    }
  })

  const startMembership = async () => {
    if (!selectedPlan) return

    try {
      setLoading(true)
      setMessage("")
      setStatus(null)

      const order = await membershipService.createMembership(
        selectedPlan._id
      )

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
        name: "NGO Membership",
        description: `${selectedPlan.name} Plan`,

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

        theme: { color: "#2563eb" } // blue for membership
      }

      new window.Razorpay(options).open()
    } catch (err) {
      setMessage(err?.message || "Unable to initiate membership")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900 py-16 px-4">
      <div className="flex justify-center">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl shadow-lg px-6 py-6">

          <h2 className="text-2xl font-semibold text-slate-100 text-center">
            Become a Member
          </h2>
          <p className="text-sm text-slate-400 text-center mb-6">
            Unlock exclusive benefits • Support our mission
          </p>

          {/* Plan Selection */}
          <div className="mb-6 space-y-3">
            {plans.map(plan => (
              <button
                key={plan._id}
                onClick={() => setSelectedPlan(plan)}
                disabled={loading}
                className={`w-full text-left p-4 rounded-lg border transition ${
                  selectedPlan?._id === plan._id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-700 hover:border-slate-500"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-100">
                    {plan.name}
                  </span>
                  <span className="text-blue-400 font-bold">
                    ₹{plan.price}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  {plan.duration} days
                </p>
              </button>
            ))}
          </div>

          {/* Selected Plan Benefits */}
          {selectedPlan && (
            <div className="mb-6 text-sm text-slate-300">
              <p className="mb-2 font-medium">Benefits:</p>
              <ul className="space-y-1 text-slate-400">
                {selectedPlan.benefits.map((b, i) => (
                  <li key={i}>• {b}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={startMembership}
            disabled={loading || !selectedPlan}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
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
            Secure payment powered by Razorpay
          </div>
        </div>
      </div>
    </div>
  )
}

export default MembershipCheckout