import { useEffect, useState } from "react";

/**
 * GoHighLevel Booking Calendar Embed
 * Responsive iframe wrapper optimized for mobile/tablet/desktop.
 * 
 * Guardrail 1: overflow-x-hidden on wrapper (no vertical clipping).
 * Guardrail 2: minHeight only (never fixed height) so embed can expand.
 * Script loader is idempotent — injected once globally.
 */
const GHLBookingCalendar = () => {
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      if (width < 768) setViewportSize('mobile');
      else if (width < 1024) setViewportSize('tablet');
      else setViewportSize('desktop');
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    // Idempotent: only inject once globally
    if (!document.querySelector('script[src="https://link.msgsndr.com/js/form_embed.js"]')) {
      const script = document.createElement("script");
      script.src = "https://link.msgsndr.com/js/form_embed.js";
      script.type = "text/javascript";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const getMinHeight = (): string => {
    switch (viewportSize) {
      case 'mobile': return '1400px';
      case 'tablet': return '1200px';
      case 'desktop': return '1100px';
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
      <div className="w-full mx-auto flex justify-center">
        <iframe
          src="https://api.leadconnectorhq.com/widget/booking/N7himS3BLf5KxaVbQPz6"
          style={{
            width: "100%",
            maxWidth: "100%",
            border: "none",
            minHeight: getMinHeight(),
          }}
          scrolling="yes"
          id="N7himS3BLf5KxaVbQPz6_1770095323495"
          title="Schedule a Conversation with Kasandra"
          loading="eager"
        />
      </div>
    </div>
  );
};

export default GHLBookingCalendar;
