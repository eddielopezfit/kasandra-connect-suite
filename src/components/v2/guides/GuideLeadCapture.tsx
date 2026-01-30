/**
 * Guide Lead Capture - Now using Native Form instead of GHL iframe
 */
import NativeGuideLeadCapture from "./NativeGuideLeadCapture";

interface GuideLeadCaptureProps {
  variant?: "inline" | "bottom";
  guideTitle?: string;
  guideId?: string;
}

const GuideLeadCapture = ({ variant = "inline", guideTitle, guideId }: GuideLeadCaptureProps) => {
  return (
    <NativeGuideLeadCapture 
      variant={variant} 
      guideTitle={guideTitle}
      guideId={guideId}
      source="guide_lead_capture"
    />
  );
};

export default GuideLeadCapture;
