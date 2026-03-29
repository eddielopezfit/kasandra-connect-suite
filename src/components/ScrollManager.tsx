import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollManager = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      // Wait for DOM to render before scrolling to anchor
      requestAnimationFrame(() => {
        const elementId = location.hash.slice(1);
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    } else {
      // Instant scroll to top on route change — "auto" prevents race
      // conditions with lazy-loaded content that shifts the viewport
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [location.pathname, location.hash]);

  return null;
};

export default ScrollManager;
