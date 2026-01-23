import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import SocialProofTicker from "@/components/SocialProofTicker";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import PodcastSection from "@/components/PodcastSection";
import CommunitySection from "@/components/CommunitySection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <SocialProofTicker />
      <AboutSection />
      <ServicesSection />
      <PodcastSection />
      <CommunitySection />
      <ContactSection />
      <Footer />
    </main>
  );
};

export default Index;
