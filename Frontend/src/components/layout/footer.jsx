// src/components/layout/Footer.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (e) => {
    if (!e) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).trim());
  };

  const handleSubscribe = async (ev) => {
    ev.preventDefault();
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setBusy(true);
      // We are not auto-subscribing on backend — navigate to signup with email prefilled.
      // The signup page should read ?email=... and prefill the input.
      navigate(`/auth/register?email=${encodeURIComponent(email.trim())}`);
      toast.success("Redirecting to signup — complete subscription there");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="bg-gray-950 text-gray-300 w-full">
      {/* Top section */}
      <div className="w-full px-6 lg:px-12 py-10 grid gap-10 md:grid-cols-4">
        {/* Brand Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/logo.png"
              alt="NGO Logo"
              className="w-10 h-10 object-cover rounded-full bg-white p-1 shadow-md"
            />
            <p className="font-bold text-sm tracking-wide leading-tight">
              Bright Future
              <span className="text-yellow-400"> Foundation</span>
            </p>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed mb-3">
            Bright Future Foundation is dedicated to uplifting underprivileged 
            children through education, healthcare, and community support.
          </p>

          <p className="text-[11px] text-gray-500 italic">
            “When kindness becomes a habit, someone&apos;s life becomes a story of hope.”
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li>
              <Link to="/" className="hover:text-yellow-300">Home</Link>
            </li>
            <li>
              <Link to="/events" className="hover:text-yellow-300">Events</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-yellow-300">About</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-yellow-300">Contact</Link>
            </li>
            <li>
              <Link to="/donate" className="hover:text-yellow-300">Donate</Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
          <ul className="space-y-2 text-xs text-gray-400 leading-relaxed">
            <li>📍 Virat Complex, Near Krishna Apt., Room 302, Boring Road, Patna</li>
            <li>📞 <a href="tel:+919876543210" className="hover:text-yellow-300">+91 9876543210</a></li>
            <li>✉️ <a href="mailto:Brightfuturefoundation.ngo@gmail.com" className="hover:text-yellow-300">Brightfuturefoundation.ngo@gmail.com</a></li>
          </ul>

          <div className="mt-4 flex gap-4 text-lg">
            <a aria-label="Facebook" href="#" className="hover:text-yellow-300">𝔽</a>
            <a aria-label="Instagram" href="#" className="hover:text-yellow-300">𝕀</a>
            <a aria-label="Twitter" href="#" className="hover:text-yellow-300">𝕏</a>
            <a aria-label="LinkedIn" href="#" className="hover:text-yellow-300">𝕃</a>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Stay Updated</h4>
          <p className="text-xs text-gray-400 mb-3">
            Get stories of impact and upcoming events in your inbox.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 text-xs" aria-label="Subscribe to newsletter">
            <label htmlFor="footer-email" className="sr-only">Email address</label>
            <input
              id="footer-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-3 py-2 rounded-full bg-gray-900 border border-gray-700 text-gray-200 focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 rounded-full bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-300 transition disabled:opacity-60"
            >
              {busy ? "Please wait..." : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="w-full px-6 lg:px-12 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-500 text-center md:text-left">
            © {new Date().getFullYear()} Bright Future Foundation. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-[11px] text-gray-500">
            <Link to="/privacy" className="hover:text-yellow-300">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-yellow-300">Terms & Conditions</Link>
            <Link to="/refund" className="hover:text-yellow-300">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
