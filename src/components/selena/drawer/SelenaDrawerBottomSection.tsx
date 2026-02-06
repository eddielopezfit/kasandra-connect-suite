import { Button } from "@/components/ui/button";
import { ConciergeTabBar, type ConciergeTab, type JourneyIntent } from "@/components/selena/ConciergeTabBar";
import { ConciergeTabPanels } from "@/components/selena/ConciergeTabPanels";
import { cn } from "@/lib/utils";

export function SelenaDrawerBottomSection({
  activeTab,
  onCloseTabPanel,
  onTabChange,
  onSuggestedReplyClick,
  onActionClick,
  language,
  leadId,
  hasReports,
  closeDrawer,
  currentIntent,
  journeyStep,
  isMobile,
  input,
  setInput,
  inputRef,
  onSubmit,
  isLoading,
  placeholder,
  disclaimer,
}: {
  activeTab: ConciergeTab | null;
  onCloseTabPanel: () => void;
  onTabChange: (tab: ConciergeTab | null) => void;
  onSuggestedReplyClick: (text: string) => void;
  onActionClick: (action: any) => void;
  language: "en" | "es";
  leadId?: string | null;
  hasReports?: boolean;
  closeDrawer: () => void;
  currentIntent?: JourneyIntent;
  journeyStep?: number;
  isMobile: boolean;
  input: string;
  setInput: (next: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  placeholder: string;
  disclaimer: string;
}) {
  return (
    <div
      className="shrink-0 relative bg-background"
      style={{ paddingBottom: isMobile ? "env(safe-area-inset-bottom, 0px)" : undefined }}
    >
      <ConciergeTabPanels
        activeTab={activeTab}
        onClose={onCloseTabPanel}
        onSendMessage={onSuggestedReplyClick}
        onActionClick={onActionClick}
        language={language}
        leadId={leadId}
        hasReports={hasReports}
        closeDrawer={closeDrawer}
        currentIntent={currentIntent}
      />

      <ConciergeTabBar
        activeTab={activeTab}
        onTabChange={onTabChange}
        language={language}
        currentIntent={currentIntent}
        journeyStep={journeyStep}
      />

      <form onSubmit={onSubmit} className="border-t border-border p-4 bg-background">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "flex-1 min-w-0 px-4 py-2 rounded-full",
              "bg-muted border-0",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "text-base"
            )}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="rounded-full w-10 h-10 shrink-0"
          >
            {/* icon is rendered by parent; keep button shape stable */}
            <span className="sr-only">Send</span>
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              aria-hidden="true"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 2L11 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">{disclaimer}</p>
      </form>
    </div>
  );
}
