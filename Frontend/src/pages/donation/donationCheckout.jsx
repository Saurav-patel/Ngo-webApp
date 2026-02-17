import { useState } from "react"
import { useSelector } from "react-redux"
import { donationService, loadRazorpay } from "../../service/donationService.js"
import { useDonationPolling } from "./donationPolling.jsx"
import { selectIsAuthenticated } from "../../store/slices/authSlice.js"

const DonationCheckout = () => {
  // 🔐 AUTH STATE
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const authChecked = useSelector(state => state.auth.authChecked)

  // 💰 PAYMENT STATE
  const [amount, setAmount] = useState(500)
  const [orderId, setOrderId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [polling, setPolling] = useState(false)

  // 🧾 UI STATUS
  const [status, setStatus] = useState(null)
  const [message, setMessage] = useState("")

  // 👤 GUEST DETAILS
  const [donorName, setDonorName] = useState("")
  const [donorEmail, setDonorEmail] = useState("")
  const [donorPhone, setDonorPhone] = useState("")

  // 🚫 HARD BLOCK UNTIL AUTH IS RESOLVED
  if (!authChecked) {
    return <p>Loading...</p>
  }

  // 🔁 POLLING (WEBHOOK = SOURCE OF TRUTH)
  useDonationPolling({
    orderId,
    enabled: polling,
    onStatusChange: currentStatus => {
      if (currentStatus === "CAPTURED") {
        setStatus("SUCCESS")
        setMessage("Thank you! Your donation was successful.")
        setPolling(false)
      }

      if (currentStatus === "FAILED") {
        setStatus("FAILED")
        setMessage("Payment failed. No money was deducted.")
        setPolling(false)
      }

      if (currentStatus === "CREATED") {
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

      // 🔒 STRICT GUEST VALIDATION
      if (!isAuthenticated) {
        if (!donorName.trim() || !donorEmail.trim()) {
          setMessage("Please enter your name and email to continue")
          setLoading(false)
          return
        }
      }

      // 🔒 BUILD PAYLOAD (OPTION 2 – SAFE)
      const payload = {
        amount,
        purpose: "DONATION"
      }

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

        // ❗ ACKNOWLEDGE ONLY — NOT VERIFY
        handler: async response => {
          await donationService.acknowledgeDonationPayment(response)
          setStatus("PROCESSING")
          setMessage("Payment received. Confirming...")
          setPolling(true)
        },

        modal: {
          ondismiss: () => {
            setStatus("PROCESSING")
            setMessage("Payment not completed. Checking status...")
            setPolling(true)
          }
        },

        theme: {
          color: "#16a34a"
        }
      }

      new window.Razorpay(options).open()
    } catch {
      setMessage("Unable to initiate donation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2>Make a Donation</h2>

      {!isAuthenticated && (
        <>
          <input
            type="text"
            placeholder="Your name *"
            value={donorName}
            onChange={e => setDonorName(e.target.value)}
            disabled={loading}
          />

          <input
            type="email"
            placeholder="Your email *"
            value={donorEmail}
            onChange={e => setDonorEmail(e.target.value)}
            disabled={loading}
          />

          <input
            type="tel"
            placeholder="Phone (optional)"
            value={donorPhone}
            onChange={e => setDonorPhone(e.target.value)}
            disabled={loading}
          />
        </>
      )}

      <select
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
        disabled={loading}
      >
        <option value={100}>₹100</option>
        <option value={250}>₹250</option>
        <option value={500}>₹500</option>
        <option value={1000}>₹1000</option>
        <option value={5000}>₹5000</option>
      </select>

      <button
        onClick={startDonation}
        disabled={
          loading ||
          (!isAuthenticated && (!donorName.trim() || !donorEmail.trim()))
        }
      >
        {loading ? "Please wait..." : "Donate"}
      </button>

      {message && (
        <p
          style={{
            marginTop: 12,
            color:
              status === "SUCCESS"
                ? "green"
                : status === "FAILED"
                ? "red"
                : "orange"
          }}
        >
          {message}
        </p>
      )}
    </div>
  )
}

export default DonationCheckout
