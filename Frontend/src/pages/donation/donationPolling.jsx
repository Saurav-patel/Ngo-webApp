import { useEffect, useRef } from "react"
import { donationService } from "../../service/donationService.js"

export const useDonationPolling = ({
  orderId,
  enabled,
  onStatusChange,
  onTimeout,
  intervalMs = 4000,
  maxAttempts = 30
}) => {
  const attemptsRef = useRef(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!enabled || !orderId) return

    const poll = async () => {
      try {
        attemptsRef.current += 1

        const res = await donationService.getDonationStatus(orderId)
        const status = res.status

        onStatusChange(status)

        if (
          status === "CAPTURED" ||
          status === "FAILED" ||
          status === "REFUNDED"
        ) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }

        if (attemptsRef.current >= maxAttempts) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          onTimeout()
        }
      } catch {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        onTimeout()
      }
    }

    intervalRef.current = setInterval(poll, intervalMs)
    poll()

    return () => {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [enabled, orderId])
}
