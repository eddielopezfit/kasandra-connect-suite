import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { MessageCircle, BookOpen, Home, ArrowRight } from "lucide-react";

const NotFoundContent = () => {
  const location = useLocation();
  const { openChat } = useSelenaChat();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <section className="min-h-screen bg-cc-navy flex items-center justify-center px-4 pt-20">
      <div className="max-w-xl w-full text-center">
        {/* Number */}
        <p className="font-serif text-8xl font-bold text-cc-gold/30 mb-2">404</p>

        <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
          Page not found
        </h1>
        <p className="text-white/70 text-lg mb-10 max-w-sm mx-auto">
          That page doesn't exist — but Selena can still help you find what you're looking for.
        </p>

        {/* Three paths forward */}
        <div className="grid gap-4 mb-8">
          <Button
            onClick={() => openChat({ source: "404_page", intent: "explore" })}
            className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold py-5 rounded-xl text-base"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Ask Selena — she'll point you in the right direction
          </Button>

          <Link to="/v2/guides">
            <Button
              variant="outline"
              className="w-full border-white/30 text-white hover:bg-white/10 py-5 rounded-xl text-base"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Browse free real estate guides
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </Link>

          <Link to="/v2">
            <Button
              variant="ghost"
              className="w-full text-white/60 hover:text-white hover:bg-white/5 py-5 rounded-xl text-base"
            >
              <Home className="w-5 h-5 mr-2" />
              Go back home
            </Button>
          </Link>
        </div>

        <p className="text-white/40 text-sm">
          Looking for something specific? Selena can help with buying, selling, cash offers, and more.
        </p>
      </div>
    </section>
  );
};

const NotFound = () => (
  <V2Layout>
    <NotFoundContent />
  </V2Layout>
);

export default NotFound;
