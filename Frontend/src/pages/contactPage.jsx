import contactService from "../service/contactService.js"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"

const stripHtml = (s) =>
  typeof s === "string" ? s.replace(/<[^>]*>/g, "").trim() : ""

const ContactPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm()

  const [ticket, setTicket] = useState(null)

  async function onSubmit(values) {
    try {
      if (values.website) {
        toast.error("Bad request")
        return
      }

      const payload = {
        name: String(values.name).trim(),
        email: String(values.email).trim().toLowerCase(),
        phone: values.phone?.trim() || undefined,
        reason: values.reason || "other",
        message: stripHtml(values.message),
        website: values.website || ""
      }

      const data = await contactService.createContactRequest(payload)
      setTicket(data.id || null)
      toast.success(data.message || "Message sent successfully")
      reset()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send message")
    }
  }

  const cardClass = `
    bg-gray-900/60 border border-gray-700 rounded-3xl shadow-lg
    transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/40
  `

  const inputClass = `
    w-full bg-gray-900 border border-gray-700 rounded-xl
    px-4 py-3 text-gray-100
    focus:outline-none focus:ring-2 focus:ring-emerald-500/40
  `

  return (
    <div className="w-full bg-gray-950 py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className={`${cardClass} p-8 flex flex-col lg:flex-row gap-10`}>

          <div className="flex-1">
            <h1 className="text-3xl font-semibold mb-2 text-gray-100">
              Contact Us
            </h1>
            <p className="text-sm text-gray-400 mb-6">
              Questions about volunteering, donations, partnerships, or events —
              we’re here to help.
            </p>

            {ticket && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-900/20 border border-emerald-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-300">
                    Your support ticket ID
                  </p>
                  <p className="font-mono text-lg font-semibold text-emerald-200">
                    {ticket}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(ticket)
                    toast.success("Copied")
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-sm font-medium"
                >
                  Copy
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">
                    Full name
                  </label>
                  <input
                    {...register("name", { required: true })}
                    className={`${inputClass} ${
                      errors.name && "border-red-500"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-1 block">
                    Email
                  </label>
                  <input
                    {...register("email", { required: true })}
                    className={`${inputClass} ${
                      errors.email && "border-red-500"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-1 block">
                  Phone (optional)
                </label>
                <input {...register("phone")} className={inputClass} />
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-1 block">
                  Reason
                </label>
                <select {...register("reason")} className={inputClass}>
                  <option value="other">Other</option>
                  <option value="volunteering">Volunteering</option>
                  <option value="donation">Donation</option>
                  <option value="partnership">Partnership</option>
                  <option value="event">Event</option>
                </select>
              </div>

              {/* Honeypot */}
              <input
                {...register("website")}
                type="text"
                tabIndex={-1}
                className="hidden"
              />

              <div>
                <label className="text-sm text-gray-300 mb-1 block">
                  Message
                </label>
                <textarea
                  {...register("message", { required: true })}
                  rows={6}
                  className={`${inputClass} ${
                    errors.message && "border-red-500"
                  }`}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <p className="text-sm text-gray-400">
                  Or email us at{" "}
                  <a
                    href="mailto:Brightfuturefoundation.ngo@gmail.com"
                    className="text-emerald-400 hover:underline"
                  >
                    Brightfuturefoundation.ngo@gmail.com
                  </a>
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-medium"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>

          <aside className="w-full lg:w-80">
            <div className={`${cardClass} p-6 sticky top-24`}>
              <h3 className="text-lg font-semibold mb-3 text-gray-100">
                Contact Info
              </h3>

              <p className="text-sm font-semibold text-gray-200 mb-2">
                BRIGHT FUTURE FOUNDATION
              </p>

              <p className="text-sm text-gray-400 leading-relaxed">
                Virat Complex Near Krishna Apt.<br />
                Boring Road, Patna, Bihar
              </p>

              <div className="mt-4">
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-gray-200 font-medium">
                  +91 98765 43210
                </p>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-500">Office hours</p>
                <p className="text-gray-200 font-medium">
                  Mon — Fri, 9:00 — 18:00
                </p>
              </div>

              <div className="mt-6">
                <a
                  href="/volunteer"
                  className="block text-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-medium"
                >
                  Join as Volunteer
                </a>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}

export default ContactPage
