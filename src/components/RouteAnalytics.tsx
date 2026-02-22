/**
 * RouteAnalytics — fires Meta Pixel PageView on every route change.
 * Mount once inside <BrowserRouter>.
 */
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { init, pageView } from "@/lib/metaPixel";

const RouteAnalytics = () => {
  const location = useLocation();
  const lastPathRef = useRef("");

  // Init pixel once
  useEffect(() => {
    init();
  }, []);

  // PageView on route change (deduplicated for React strict mode)
  useEffect(() => {
    const key = location.pathname + location.search;
    if (key === lastPathRef.current) return;
    lastPathRef.current = key;
    pageView();
  }, [location.pathname, location.search]);

  return null;
};

export default RouteAnalytics;
