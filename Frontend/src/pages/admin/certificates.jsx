import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { certificateService } from "../../service/certificateService.js"

const Certificates = () => {
  const navigate = useNavigate()
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        const data = await certificateService.getAllCertificates()
        setCertificates(data)
      } catch (err) {
        setError(err.message || "Failed to load certificates")
      } finally {
        setLoading(false)
      }
    }

    loadCertificates()
  }, [])

  if (loading) {
    return (
      <div className="p-6 text-gray-400">
        Loading certificates...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-red-400">
        {error}
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-100 mb-6">
        Certificates
      </h1>

      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
        <table className="w-full text-sm text-gray-300">
          <thead className="bg-gray-800 text-gray-400">
            <tr>
              <th className="p-3 text-left">Certificate Code</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Issued On</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {certificates.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-400">
                  No certificates found
                </td>
              </tr>
            )}

            {certificates.map((c) => (
              <tr
                key={c._id}
                className="border-t border-gray-800 hover:bg-gray-800/40 transition"
              >
                <td className="p-3 font-mono text-xs">
                  {c.certificateCode}
                </td>

                <td className="p-3">
                  {c.name}
                </td>

                <td className="p-3 text-gray-400">
                  {c.email}
                </td>

                <td className="p-3">
                  {c.type}
                </td>

                <td className="p-3">
                  {new Date(c.issueDate).toLocaleDateString()}
                </td>

                <td className="p-3">
                  <span className="text-green-400 capitalize">
                    {c.status}
                  </span>
                </td>

                <td className="p-3 flex gap-4">
                  <a
                    href={c.fileUrl}
                    download
                    className="text-blue-400 hover:underline"
                  >
                    Download
                  </a>

                  <button
                    onClick={() =>
                      navigate(`/admin/certificates/${c._id}`)
                    }
                    className="text-yellow-400 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Certificates
