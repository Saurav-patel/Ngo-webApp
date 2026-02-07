import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { certificateService } from "../../service/certificateService.js"

const CertificateDetails = () => {
  const { certificateId } = useParams()
  const navigate = useNavigate()

  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadCertificate = async () => {
      try {
        const data = await certificateService.getCertificateDetails(certificateId)
        setCertificate(data)
      } catch (err) {
        setError(err.message || "Failed to fetch certificate")
      } finally {
        setLoading(false)
      }
    }

    loadCertificate()
  }, [certificateId])

  if (loading) {
    return <div className="p-6 text-gray-400">Loading certificate...</div>
  }

  if (error) {
    return <div className="p-6 text-red-400">{error}</div>
  }

  return (
    <div className="p-6 space-y-6">
    
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-400 hover:underline"
      >
        ← Back to Certificates
      </button>

      <h1 className="text-xl font-semibold text-gray-100">
        Certificate Details
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-3">
          <Detail label="Certificate Code" value={certificate.certificateCode} mono />
          <Detail label="Name" value={certificate.name} />
          <Detail label="Email" value={certificate.email} />
          <Detail label="Type" value={certificate.type} />
          <Detail label="Status" value={certificate.status} status />
          <Detail
            label="Issued On"
            value={new Date(certificate.issueDate).toLocaleString()}
          />
          <Detail label="Template" value={certificate.templateUsed} />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <p className="text-sm text-gray-400 mb-3">Certificate Preview</p>

          <img
            src={certificate.fileUrl}
            alt="Certificate"
            className="w-full rounded-md border border-gray-800"
          />

          <a
            href={certificate.fileUrl}
            download
            className="inline-block mt-4 text-blue-400 hover:underline"
          >
            Download Certificate
          </a>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">
          Audit Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
          <Detail label="Issued By" value={certificate.createdBy} mono />
          <Detail label="Issued To" value={certificate.issuedTo} mono />
          <Detail
            label="Created At"
            value={new Date(certificate.createdAt).toLocaleString()}
          />
        </div>
      </div>
    </div>
  )
}

const Detail = ({ label, value, mono, status }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p
      className={`text-sm ${
        mono ? "font-mono text-xs" : ""
      } ${
        status ? "text-green-400 capitalize" : "text-gray-200"
      }`}
    >
      {value || "—"}
    </p>
  </div>
)

export default CertificateDetails
