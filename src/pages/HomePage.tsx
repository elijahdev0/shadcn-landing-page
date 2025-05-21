import { About } from "../components/About";
import { Cta } from "../components/Cta";
import { FAQ } from "../components/FAQ";
import { Features } from "../components/Features";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { HowItWorks } from "../components/HowItWorks";
// Navbar will be part of the main App layout, so not imported here
// import { Navbar } from "../components/Navbar";
import { Newsletter } from "../components/Newsletter";
import { Pricing } from "../components/Pricing";
import { ScrollToTop } from "../components/ScrollToTop";
import { Services } from "../components/Services";
import { Sponsors } from "../components/Sponsors";
import { Team } from "../components/Team";
import { Testimonials } from "../components/Testimonials";
// App.css will be imported in the main App.tsx
// import "../App.css";

export function HomePage() {
  return (
    <>
      {/* Navbar will be rendered in App.tsx */}
      <Hero />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Cta />
      {/* Footer and ScrollToTop might also be part of a main layout in App.tsx or here, depending on design */}
      <Footer />
      <ScrollToTop />
    </>
  );
}