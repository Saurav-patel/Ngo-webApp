import { useEffect, useState } from "react"
import { idCardService } from "../../service/idCardService"
import { RefreshCcw, Download } from "lucide-react"

const MyIdCard = () => {
  const [idCard, setIdCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [renewing, setRenewing] = useState(false)

  const loadIdCard = async () => {
    try {
      const card = await idCardService.getMyIdCard()
      setIdCard(card)
    } catch {
      try {
        await idCardService.applyForIdCard()
        const card = await idCardService.getMyIdCard()
        setIdCard(card)
      } catch {
        setError("Your ID Card request is under review.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIdCard()
  }, [])

  const handleRenew = async () => {
    if (!idCard?._id) return
    try {
      setRenewing(true)
      await idCardService.renewIdCard(idCard._id)
      await loadIdCard()
    } catch {
      alert("Failed to renew ID Card")
    } finally {
      setRenewing(false)
    }
  }

  if (loading)
    return (
      <>
        <div className="fixed inset-0 bg-gray-950 -z-10" />
        <div className="px-6 py-8">
          <p className="text-gray-400">Loading ID Card...</p>
        </div>
      </>
    )

  if (error)
    return (
      <>
        <div className="fixed inset-0 bg-gray-950 -z-10" />
        <div className="px-6 py-8">
          <p className="text-yellow-400">{error}</p>
        </div>
      </>
    )

  return (
    <>
      
      <div className="fixed inset-0 bg-gray-950 -z-10" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold text-white mb-6">
          My ID Card
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-xl p-4">
            <img
              src={idCard.fileUrl}
              alt="ID Card"
              className="w-full rounded-lg bg-gray-950"
            />
          </div>

          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="space-y-4">

              <div>
                <p className="text-sm text-gray-400">Card Number</p>
                <p className="text-white font-medium">
                  {idCard.cardNumber}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Valid Till</p>
                <p className="text-white">
                  {new Date(idCard.expiryDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium
                  ${
                    idCard.status === "active"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-yellow-500/10 text-yellow-400"
                  }`}
                >
                  {idCard.status.toUpperCase()}
                </span>
              </div>

              <div className="pt-4 flex gap-3">
                <a
                  href={idCard.fileUrl}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2
                  bg-blue-600 hover:bg-blue-500
                  text-white rounded-lg text-sm transition"
                >
                  <Download size={16} />
                  Download
                </a>

                <button
                  onClick={handleRenew}
                  disabled={renewing}
                  className="inline-flex items-center gap-2 px-4 py-2
                  bg-gray-800 hover:bg-gray-700
                  text-gray-200 rounded-lg text-sm
                  transition disabled:opacity-50"
                >
                  <RefreshCcw size={16} />
                  {renewing ? "Renewing..." : "Renew ID Card"}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default MyIdCard
