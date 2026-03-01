import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface GHLCalendarEmbedProps {
  name?: string;
  email?: string;
  phone?: string;
  className?: string;
}

/**
 * GoHighLevel Calendar Embed with Data Pass-Through
 * Pre-fills user data via URL parameters to avoid redundant entry
 */
const GHLCalendarEmbed = ({ name, email, phone, className = "" }: GHLCalendarEmbedProps) => {
  const { t } = useLanguage();
  
  useEffect(() => {
    // Load the GoHighLevel form embed script
    const existingScript = document.querySelector('script[src="https://link.msgsndr.com/js/form_embed.js"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://link.msgsndr.com/js/form_embed.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Build calendar URL with pre-filled data
  const baseUrl = "https://api.leadconnectorhq.com/widget/booking/N7himS3BLf5KxaVbQPz6";
  const params = new URLSearchParams();
  
  if (name) params.append("name", name);
  if (email) params.append("email", email);
  if (phone) params.append("phone", phone);
  
  const calendarUrl = params.toString() 
    ? `${baseUrl}?${params.toString()}` 
    : baseUrl;

  return (
    <div className={`w-full ${className}`}>
      <iframe
        src={calendarUrl}
        style={{ 
          width: "100%", 
          height: "700px",
          minHeight: "650px",
          border: "none", 
          borderRadius: "8px",
        }}
        id="ghl-calendar-embed"
        title={t("Schedule a Consultation", "Agendar una Consulta")}
      />
    </div>
  );
};

export default GHLCalendarEmbed;
