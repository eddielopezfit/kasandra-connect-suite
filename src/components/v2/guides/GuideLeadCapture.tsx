import { useLanguage } from "@/contexts/LanguageContext";
import GoHighLevelForm from "@/components/v2/GoHighLevelForm";
import { Mail } from "lucide-react";

interface GuideLeadCaptureProps {
  variant?: "inline" | "bottom";
  guideTitle?: string;
}

const GuideLeadCapture = ({ variant = "inline" }: GuideLeadCaptureProps) => {
  const { t } = useLanguage();

  return (
    <div className={`${variant === "inline" ? "bg-cc-sand border border-cc-sand-dark" : "bg-white/5 border border-white/10"} rounded-xl p-6`}>
      <div className="flex items-start gap-3 mb-4">
        <div className={`p-2 rounded-full ${variant === "inline" ? "bg-cc-gold/10" : "bg-cc-gold/20"}`}>
          <Mail className={`w-5 h-5 ${variant === "inline" ? "text-cc-navy" : "text-cc-gold"}`} />
        </div>
        <div>
          <h3 className={`font-serif text-lg ${variant === "inline" ? "text-cc-navy" : "text-white"}`}>
            {t("Want the checklist + next steps?", "¿Quieres la lista + próximos pasos?")}
          </h3>
          <p className={`text-sm ${variant === "inline" ? "text-cc-charcoal/70" : "text-white/60"}`}>
            {t("Fill out the form below.", "Completa el formulario a continuación.")}
          </p>
        </div>
      </div>
      
      <GoHighLevelForm 
        className={`rounded-lg overflow-hidden ${variant === "inline" ? "bg-white" : "bg-white/10"}`}
        minHeight="1200px"
      />
    </div>
  );
};

export default GuideLeadCapture;
