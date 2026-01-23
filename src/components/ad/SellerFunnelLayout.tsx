import { ReactNode } from "react";
import { Home } from "lucide-react";
import { SelenaWidgetProvider } from "@/contexts/SelenaWidgetContext";
import SelenaVoiceWidget from "./SelenaVoiceWidget";

interface SellerFunnelLayoutProps {
  children: ReactNode;
}

const SellerFunnelLayout = ({ children }: SellerFunnelLayoutProps) => {
  return (
    <SelenaWidgetProvider>
      <div className="min-h-screen bg-cc-navy flex flex-col">
        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Compliance Footer */}
        <footer className="bg-cc-navy border-t border-white/10 py-6 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-2">
                {/* Equal Housing Logo */}
                <div className="w-8 h-8 border border-white/50 flex items-center justify-center">
                  <Home className="w-5 h-5 text-white/70" />
                </div>
                <span className="text-white/50 text-xs">EQUAL HOUSING OPPORTUNITY</span>
              </div>
              <div className="space-y-1">
                <p className="text-white/60 text-xs">
                  Realty Executives Arizona Territory – Corner Connect Team
                </p>
                <p className="text-white/40 text-[10px]">
                  2443 N. Campbell Ave, Tucson, AZ 85719
                </p>
              </div>
            </div>
          </div>
        </footer>

        {/* Selena AI Voice Widget */}
        <SelenaVoiceWidget />
      </div>
    </SelenaWidgetProvider>
  );
};

export default SellerFunnelLayout;
