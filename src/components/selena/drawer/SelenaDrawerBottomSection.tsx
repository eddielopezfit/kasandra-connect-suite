import { useRef, useState } from "react";
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
  onSubmitText,
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
  onSubmitText: (text: string) => void;
  isLoading: boolean;
  placeholder: string;
  disclaimer: string;
}) {
  // UNCONTROLLED INPUT: Use ref to bypass React state churn that causes "one letter at a time" bug
  const inputEl = useRef<HTMLInputElement | null>(null);
  // Local state only for button disabled check (doesn't control input value)
  const [hasText, setHasText] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = (inputEl.current?.value || "").trim();
    if (!text || isLoading || isDebouncing) return;

    setIsDebouncing(true);
    onSubmitText(text);

    // Clear after send
    if (inputEl.current) {
      inputEl.current.value = "";
      setHasText(false);
    }

    // Prevent rapid-fire submissions
    setTimeout(() => setIsDebouncing(false), 500);
  };

  const handleInputChange = () => {
    // Only track whether there's text for button state, don't control value
    const hasValue = !!(inputEl.current?.value?.trim());
    if (hasValue !== hasText) {
      setHasText(hasValue);
    }
  };

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

      <form onSubmit={handleSubmit} className="border-t border-border p-4 bg-background">
        <div className="flex gap-2">
          {/* 
            ⚠️ REGRESSION TRIPWIRE - DO NOT MODIFY WITHOUT READING ⚠️
            
            This input MUST remain UNCONTROLLED to prevent the "one letter at a time" typing bug.
            
            NEVER:
            - Add value={...} prop (makes it controlled, breaks on remount)
            - Add key={...} prop (forces remount on each keystroke)
            - Wrap parent components in key={language/route/messages/activeTab}
            
            The ref={inputEl} pattern reads value on submit, bypassing React state churn.
            See: .lovable/plan.md for full context on this fix.
          */}
          <input
            ref={inputEl}
            type="text"
            onChange={handleInputChange}
            placeholder={placeholder}
            className={cn(
              "flex-1 min-w-0 px-4 py-2 rounded-full",
              "bg-muted border-0",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "text-base"
            )}
            disabled={isLoading}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!hasText || isLoading || isDebouncing}
            className="rounded-full w-10 h-10 shrink-0"
          >
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

        <p className="text-[10px] md:text-xs text-muted-foreground text-center mt-1.5">{disclaimer}</p>
      </form>
    </div>
  );
}
