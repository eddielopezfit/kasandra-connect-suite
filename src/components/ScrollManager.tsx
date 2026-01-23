import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollManager = () => {
  const location = useLocation();

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const behavior = isMobile ? "smooth" : "auto";

    if (location.hash) {
      // Wait for DOM to render before scrolling to anchor
      requestAnimationFrame(() => {
        const elementId = location.hash.slice(1);
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior, block: "start" });
        }
      });
    } else {
      // Scroll to top on route change
      window.scrollTo({ top: 0, left: 0, behavior });
    }
  }, [location.pathname, location.hash]);

  return null;
};

export default ScrollManager;
