import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import SiteBackground from "@/components/SiteBackground";
import CursorHalo from "@/components/CursorHalo";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0F1115] text-white">
      <SiteBackground />
      <CursorHalo />

      <div className="relative z-10">
        <Navbar />
        <Hero />

        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="border-t border-white/10" />
        </div>

        <About />

        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="border-t border-white/10" />
        </div>

        <Projects />

        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="border-t border-white/10" />
        </div>

        <Contact />
        <Footer />
      </div>
    </main>
  );
}
