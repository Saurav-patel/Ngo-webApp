// src/pages/ContactPage.jsx
import contactService from "../service/contactService.js";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const stripHtml = (s) => (typeof s === "string" ? s.replace(/<[^>]*>/g, "").trim() : "");

const ContactPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
  const [ticket, setTicket] = useState(null);

  async function onSubmit(values) {
    try {
      if (values.website) {
        toast.error("Bad request");
        return;
      }

      const payload = {
        name: String(values.name).trim(),
        email: String(values.email).trim().toLowerCase(),
        phone: values.phone?.trim() || undefined,
        reason: values.reason || "other",
        message: stripHtml(values.message),
        website: values.website || ""
      };

      const data = await contactService.createContactRequest(payload);
      setTicket(data.id || null);
      toast.success(data.message || "Message sent. We'll contact you soon.");
      reset();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to send message";
      toast.error(msg);
    }
  }

  return (
    <div className="w-full bg-gray-950 py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 flex flex-col lg:flex-row gap-8">
          
          {/* Form Section */}
          <div className="flex-1">
            <h1 className="text-3xl font-semibold mb-2 text-gray-100">Contact Us</h1>
            <p className="text-sm text-gray-300 mb-6">
              Questions about volunteering, donations, partnerships, events, or anything else — we’re here to help.
            </p>

            {ticket && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-900/20 border border-emerald-800 flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-300">Thanks — your ticket ID:</p>
                  <p className="font-mono font-semibold text-lg text-emerald-200">{ticket}</p>
                </div>
                <div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(ticket);
                      toast.success("Ticket ID copied");
                    }}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-lg shadow-sm text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Full name</label>
                  <input
                    {...register("name", { required: "Name is required", minLength: { value: 2, message: "Too short" } })}
                    className={`w-full p-3 rounded-xl border bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.name ? "border-red-500" : "border-gray-700"
                    }`}
                    placeholder="Your full name"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" }
                    })}
                    className={`w-full p-3 rounded-xl border bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.email ? "border-red-500" : "border-gray-700"
                    }`}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Phone (optional)</label>
                <input
                  {...register("phone")}
                  className="w-full p-3 rounded-xl border bg-gray-900 text-gray-100 border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+91 98765 43210"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Reason</label>
                <select
                  {...register("reason")}
                  defaultValue="other"
                  className="w-full p-3 rounded-xl border bg-gray-900 text-gray-100 border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="other" className="bg-gray-900 text-gray-100">Other</option>
                  <option value="volunteering" className="bg-gray-900 text-gray-100">Volunteering</option>
                  <option value="donation" className="bg-gray-900 text-gray-100">Donation</option>
                  <option value="partnership" className="bg-gray-900 text-gray-100">Partnership</option>
                  <option value="event" className="bg-gray-900 text-gray-100">Event</option>
                </select>
              </div>

              {/* Honeypot */}
              <input {...register("website")} type="text" tabIndex={-1} style={{ display: "none" }} />

              {/* Message */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Message</label>
                <textarea
                  {...register("message", { required: "Message is required", minLength: { value: 10, message: "Too short" } })}
                  rows={6}
                  className={`w-full p-4 rounded-xl border bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.message ? "border-red-500" : "border-gray-700"
                  }`}
                  placeholder="Tell us what's on your mind..."
                />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
              </div>

              {/* Bottom */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-sm text-gray-300">
                  Or email us at:{" "}
                  <a href="mailto:Brightfuturefoundation.ngo@gmail.com" className="text-indigo-400 hover:underline">
                    Brightfuturefoundation.ngo@gmail.com
                  </a>
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-5 py-3 bg-indigo-600 text-white rounded-2xl font-medium shadow hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>

          {/* Right Contact Info */}
          <aside className="w-80 hidden lg:block">
            <div className="sticky top-24 p-6 bg-gray-800 border border-gray-700 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-100">Contact info</h3>
              <p className="text-sm text-gray-200 font-semibold mb-2">BRIGHT FUTURE FOUNDATION</p>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                Virat Complex Near By Krishna Apt., Room No: 302, Boring Road<br />
                Patna, Bihar
              </p>

              <div className="mt-4">
                <p className="text-xs text-gray-400">Phone</p>
                <p className="font-medium text-gray-200">+91 98765 43210</p>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-400">Office hours</p>
                <p className="font-medium text-gray-200">Mon — Fri, 9:00 — 18:00</p>
              </div>

              <div className="mt-6">
                <a href="/volunteer" className="block text-center px-3 py-2 bg-indigo-600 text-white rounded-lg shadow">
                  Join as volunteer
                </a>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;
