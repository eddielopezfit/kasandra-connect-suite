import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface GoHighLevelFormProps {
  className?: string;
  minHeight?: string;
}

const GoHighLevelForm = ({ className = "", minHeight = "1200px" }: GoHighLevelFormProps) => {
  const { language } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Use taller height on mobile to avoid internal scrollbars
  const effectiveHeight = isMobile ? "1400px" : minHeight;

  return (
    <div 
      key={language} 
      className={`${className} w-full max-w-full overflow-hidden box-border`} 
      style={{ minHeight: effectiveHeight }}
    >
      <iframe
        src="https://api.leadconnectorhq.com/widget/form/y3N8kzV03nx4q4NamSX4"
        style={{ 
          width: "100%", 
          maxWidth: "100%", 
          height: effectiveHeight, 
          minHeight: effectiveHeight,
          border: "none", 
          borderRadius: "3px",
          display: "block"
        }}
        id="inline-y3N8kzV03nx4q4NamSX4"
        data-layout="{'id':'INLINE'}"
        data-trigger-type="alwaysShow"
        data-trigger-value=""
        data-activation-type="alwaysActivated"
        data-activation-value=""
        data-deactivation-type="neverDeactivate"
        data-deactivation-value=""
        data-form-name="Kasandra | Consultation Intake (EN/ES)"
        data-height="1200"
        data-layout-iframe-id="inline-y3N8kzV03nx4q4NamSX4"
        data-form-id="y3N8kzV03nx4q4NamSX4"
        title="Kasandra | Consultation Intake (EN/ES)"
      />
    </div>
  );
};

export default GoHighLevelForm;
