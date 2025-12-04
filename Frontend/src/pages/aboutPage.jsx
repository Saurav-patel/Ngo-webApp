import { useEffect } from "react";

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-slate-950 text-gray-200 min-h-screen">

      {/* HERO SECTION */}
      <section className="relative w-full px-6 lg:px-12 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-sky-600/10 to-fuchsia-600/10 blur-3xl opacity-30" />

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            About{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
              Bright Future Foundation
            </span>
          </h1>

          <p className="mt-4 text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            We are dedicated to empowering underprivileged children and 
            communities through education, healthcare, and sustainable 
            development. Your support helps us turn compassion into action.
          </p>
        </div>
      </section>


      {/* MISSION SECTION */}
      <section className="w-full px-6 lg:px-12 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Our Mission
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Our mission is to provide equal opportunities to children and 
              communities in need by focusing on education, healthcare, and 
              social welfare. We aim to create long-term solutions that uplift 
              families and build a brighter future for the next generation.
            </p>

            <p className="text-gray-400 text-sm leading-relaxed mt-4">
              Through awareness drives, volunteer programs, and inclusive 
              development initiatives, we work directly with communities to 
              bring real, meaningful change.
            </p>
          </div>

          <div className="h-64 rounded-3xl overflow-hidden shadow-lg shadow-emerald-700/20">
            <img
              src="/about-children.jpg"
              alt="Children support"
              className="w-full h-full object-cover"
            />
          </div>

        </div>
      </section>


      {/* VALUES / FEATURES */}
      <section className="w-full px-6 lg:px-12 py-16 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-white text-center mb-10">
            What We Stand For
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">

            <ValueCard
              title="Education First"
              desc="Providing learning resources, scholarships, and academic support to children."
            />

            <ValueCard
              title="Healthcare Access"
              desc="Organizing medical camps, hygiene awareness and emergency support."
            />

            <ValueCard
              title="Community Support"
              desc="Helping families through food drives, shelter assistance and counseling."
            />

            <ValueCard
              title="Youth Empowerment"
              desc="Encouraging skill development and leadership among young volunteers."
            />

          </div>
        </div>
      </section>


      {/* ACHIEVEMENTS / STATS */}
      <section className="w-full px-6 lg:px-12 py-16">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-10 text-center">

          <Stat number="5,000+" label="Children Impacted" />
          <Stat number="250+" label="Events Conducted" />
          <Stat number="700+" label="Active Volunteers" />

        </div>
      </section>


      {/* CTA SECTION */}
      <section className="w-full px-6 lg:px-12 py-16 bg-gradient-to-r from-emerald-600/20 to-sky-600/20 border-t border-slate-800 text-center">
        <h2 className="text-2xl font-semibold text-white mb-4">
          Want to Make a Difference?
        </h2>
        <p className="text-gray-300 text-sm max-w-xl mx-auto mb-6">
          Join our volunteer family or support our initiatives to bring hope 
          and opportunities to those who need it most.
        </p>

        <button className="px-6 py-3 rounded-full bg-emerald-500 text-slate-900 font-semibold hover:bg-emerald-400 transition">
          Become a Volunteer
        </button>
      </section>

    </div>
  );
};

export default AboutPage;



/* COMPONENTS */

const ValueCard = ({ title, desc }) => (
  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md hover:border-emerald-400/40 transition">
    <h3 className="text-white font-semibold mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const Stat = ({ number, label }) => (
  <div>
    <h3 className="text-3xl font-bold text-emerald-400">{number}</h3>
    <p className="text-gray-400 text-sm mt-1">{label}</p>
  </div>
);
