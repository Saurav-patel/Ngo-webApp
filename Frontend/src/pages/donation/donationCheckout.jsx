import { useState } from "react"
import { donationService, loadRazorpay } from "../../service/donationService.js"
import { useDonationPolling } from "./donationPolling.jsx"

const DonationCheckout = () => {
  const [amount, setAmount] = useState(500)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [message, setMessage] = useState("")
  const [orderId, setOrderId] = useState(null)
  const [polling, setPolling] = useState(false)

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

      if (
        currentStatus === "CREATED" ||
        currentStatus === "AUTHORIZED"
      ) {
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
        console.log("Initiating donation for amount:", amount)
      const order = await donationService.createDonationOrder({ amount })
      setOrderId(order.id)

      const razorpayLoaded = await loadRazorpay()
      if (!razorpayLoaded) {
        setMessage("Payment gateway failed to load")
        setLoading(false)
        return
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: "NGO Donation",
        description: "Support our cause",
        handler: async response => {
          await donationService.verifyDonationPayment(response)
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

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch {
      setMessage("Unable to initiate donation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2>Make a Donation</h2>

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

      <button onClick={startDonation} disabled={loading}>
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
