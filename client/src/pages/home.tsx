import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import EventsCarousel from "@/components/EventsCarousel";
import MentorsSection from "@/components/MentorsSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

export default function Home() {
  useEffect(() => {
    // Load GSAP
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--dark-primary)] text-slate-100 overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <EventsCarousel />
      <MentorsSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
