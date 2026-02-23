import { useEffect, useState } from "react";

/**
 * GoHighLevel Booking Calendar Embed
 * Responsive iframe wrapper optimized for mobile/tablet/desktop
 */
const GHLBookingCalendar = () => {
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    // Responsive breakpoint detection
    const updateViewport = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setViewportSize('mobile');
      } else if (width < 1024) {
        setViewportSize('tablet');
      } else {
        setViewportSize('desktop');
      }
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    // Load the GoHighLevel form embed script
    const existingScript = document.querySelector('script[src="https://link.msgsndr.com/js/form_embed.js"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://link.msgsndr.com/js/form_embed.js";
      script.type = "text/javascript";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Responsive height based on viewport
  const getMinHeight = () => {
    switch (viewportSize) {
      case 'mobile': return '1100px';
      case 'tablet': return '1000px';
      case 'desktop': return '900px';
    }
  };

  return (
    <div 
      className="w-full max-w-full overflow-hidden"
      style={{ 
        // Prevent any horizontal overflow
        overflowX: "hidden",
      }}
    >
      <div 
        className="w-full mx-auto"
        style={{
          // Center the content
          display: "flex",
          justifyContent: "center",
        }}
      >
        <iframe
          src="https://api.leadconnectorhq.com/widget/booking/N7himS3BLf5KxaVbQPz6"
          style={{
            width: "100%",
            maxWidth: "100%",
            border: "none",
            overflow: "hidden",
            minHeight: getMinHeight(),
          }}
          scrolling="no"
          id="N7himS3BLf5KxaVbQPz6_1770095323495"
          title="Schedule a Conversation with Kasandra"
          // Prevent layout shift by reserving space
          loading="eager"
        />
      </div>
    </div>
  );
};

export default GHLBookingCalendar;
