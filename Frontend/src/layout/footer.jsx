// src/components/layout/Footer.jsx

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-300 mt-12">
      {/* Top section */}
      <div className="w-full px-6 lg:px-12 py-10 grid gap-8 md:grid-cols-4">
        
        {/* Brand Section */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <img
              src="/logo.png"
              alt="NGO Logo"
              className="w-10 h-10 object-cover rounded-full bg-white p-1 shadow-md"
            />
            <p className="font-bold text-sm tracking-wide">
              Bright Future<span className="text-yellow-400"> Foundation</span>
            </p>
          </div>

          <p className="text-xs text-gray-400 mb-3">
            Bright Future Foundation is dedicated to uplifting underprivileged 
            children through education, healthcare and community support.
          </p>

          <p className="text-[11px] text-gray-500 italic">
            “When kindness becomes a habit, someone&apos;s life becomes a story of hope.”
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li className="hover:text-yellow-300 cursor-pointer">Home</li>
            <li className="hover:text-yellow-300 cursor-pointer">Events</li>
            <li className="hover:text-yellow-300 cursor-pointer">About</li>
            <li className="hover:text-yellow-300 cursor-pointer">Contact</li>
            <li className="hover:text-yellow-300 cursor-pointer">Donate</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li>📍 Virat Complex, Near Krishna Apt., Room 302, Boring Road, Patna</li>
            <li>📞 +91 9876543210</li>
            <li>✉️ Brightfuturefoundation.ngo@gmail.com</li>
          </ul>

          <div className="mt-4 flex gap-3 text-lg">
            <button className="hover:text-yellow-300">𝔽</button>
            <button className="hover:text-yellow-300">𝕀</button>
            <button className="hover:text-yellow-300">𝕏</button>
            <button className="hover:text-yellow-300">𝕃</button>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Stay Updated</h4>
          <p className="text-xs text-gray-400 mb-3">
            Get stories of impact and upcoming events in your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-2 text-xs">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-3 py-2 rounded-full bg-gray-900 border border-gray-700 text-gray-200 focus:ring-1 focus:ring-yellow-400"
            />
            <button className="px-4 py-2 rounded-full bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-300 transition">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="w-full px-6 lg:px-12 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-500">
            © {new Date().getFullYear()} Bright Future Foundation. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-gray-500">
            <button className="hover:text-yellow-300">Privacy Policy</button>
            <button className="hover:text-yellow-300">Terms & Conditions</button>
            <button className="hover:text-yellow-300">Refund Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
