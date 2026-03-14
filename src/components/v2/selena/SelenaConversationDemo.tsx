import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, RotateCcw } from "lucide-react";

interface Message {
  role: "user" | "selena";
  lang: "en" | "es";
  text: string;
}

const SCRIPT: Message[] = [
  { role: "user", lang: "en", text: "Do I qualify for a VA loan? I served 4 years active duty." },
  { role: "selena", lang: "en", text: "Thank you for your service 🇺🇸 Yes — with 4 years active duty, you almost certainly qualify for a VA loan. In Tucson, that means zero down payment, no PMI, and loan limits up to $766,550 for Pima County. Many veterans near Davis-Monthan use this benefit every year. Want me to walk you through the pre-approval process?" },
  { role: "user", lang: "es", text: "¿Y si soy DACA? ¿Puedo comprar también?" },
  { role: "selena", lang: "es", text: "¡Claro que sí! Los beneficiarios de DACA pueden calificar para préstamos FHA en Arizona desde 2021. Con 3.5% de enganche y un puntaje de crédito de 580 o más, el proceso es muy similar al de cualquier comprador. Hay prestamistas en Tucson con experiencia específica en casos DACA — Kasandra trabaja con ellos. ¿Te gustaría saber cuáles son los primeros pasos?" },
  { role: "user", lang: "en", text: "That's amazing. How do I get started?" },
  { role: "selena", lang: "en", text: "Let's start with a 20-minute strategy call with Kasandra — she'll review your specific situation and map out exactly what your path looks like. No pressure, just clarity. I can find you a time right now. Would that work?" },
];

const WORD_DELAY = 30;
const USER_PAUSE = 800;
const TYPING_DURATION = 1200;

interface Props {
  onStartChat: () => void;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 mr-auto bg-white/10 rounded-2xl rounded-tl-sm w-fit">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-cc-ivory/60"
          style={{
            animation: "typing-dot 1.2s infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function SelenaConversationDemo({ onStartChat }: Props) {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [wordCounts, setWordCounts] = useState<Record<number, number>>({});
  const [showTyping, setShowTyping] = useState(false);
  const [complete, setComplete] = useState(false);

  const hasPlayed = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const playSequence = useCallback(() => {
    let delay = 400;

    SCRIPT.forEach((msg, idx) => {
      const isSelena = msg.role === "selena";

      if (isSelena) {
        // Show typing indicator
        addTimeout(() => {
          setShowTyping(true);
          scrollToBottom();
        }, delay);
        delay += TYPING_DURATION;

        // Hide typing, show message word-by-word
        const wordCount = msg.text.split(" ").length;
        addTimeout(() => {
          setShowTyping(false);
          setVisibleMessages((prev) => [...prev, idx]);
          setWordCounts((prev) => ({ ...prev, [idx]: 0 }));

          let w = 0;
          const wordInterval = setInterval(() => {
            w++;
            setWordCounts((prev) => ({ ...prev, [idx]: w }));
            scrollToBottom();
            if (w >= wordCount) clearInterval(wordInterval);
          }, WORD_DELAY);
        }, delay);

        delay += wordCount * WORD_DELAY + 600;
      } else {
        // User message — appears after pause
        addTimeout(() => {
          setVisibleMessages((prev) => [...prev, idx]);
          scrollToBottom();
        }, delay);
        delay += USER_PAUSE;
      }
    });

    // Complete
    addTimeout(() => setComplete(true), delay + 500);
  }, [addTimeout, scrollToBottom]);

  // IntersectionObserver trigger
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed.current) {
          hasPlayed.current = true;
          playSequence();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeouts();
    };
  }, [playSequence, clearTimeouts]);

  const handleReplay = () => {
    clearTimeouts();
    setVisibleMessages([]);
    setWordCounts({});
    setShowTyping(false);
    setComplete(false);
    hasPlayed.current = false;

    // Small delay then replay
    setTimeout(() => {
      hasPlayed.current = true;
      playSequence();
    }, 200);
  };

  const getDisplayText = (idx: number, text: string) => {
    const wc = wordCounts[idx];
    if (wc === undefined) return text;
    const words = text.split(" ");
    return words.slice(0, wc).join(" ") + (wc < words.length ? " ▌" : "");
  };

  return (
    <div ref={containerRef} className="max-w-[600px] mx-auto">
      {/* iPhone-style frame */}
      <div className="bg-cc-navy-dark rounded-3xl overflow-hidden shadow-luxury border border-white/5">
        {/* Top bar */}
        <div className="px-5 py-3 bg-cc-navy-dark border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cc-gold/20 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-cc-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-cc-ivory font-semibold text-sm">Selena</span>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            <span className="text-cc-ivory/50 text-xs">AI Concierge • Bilingual</span>
          </div>
        </div>

        {/* Messages area */}
        <div
          ref={scrollRef}
          className="px-4 py-5 space-y-3 min-h-[320px] max-h-[480px] overflow-y-auto"
          style={{ scrollBehavior: "smooth" }}
        >
          {visibleMessages.map((idx) => {
            const msg = SCRIPT[idx];
            const isUser = msg.role === "user";
            return (
              <div
                key={idx}
                className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`px-4 py-2.5 text-sm leading-relaxed max-w-[80%] ${
                    isUser
                      ? "bg-cc-gold text-cc-navy rounded-2xl rounded-tr-sm font-medium"
                      : "bg-white/10 text-cc-ivory rounded-2xl rounded-tl-sm"
                  }`}
                >
                  {msg.lang === "es" && (
                    <span className="text-xs opacity-60 mr-1">🇲🇽</span>
                  )}
                  {isUser ? msg.text : getDisplayText(idx, msg.text)}
                </div>
              </div>
            );
          })}

          {showTyping && <TypingIndicator />}

          {complete && (
            <div className="flex flex-col items-center gap-3 pt-4 animate-fade-in">
              <Button
                onClick={onStartChat}
                className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Your Own Conversation
              </Button>
              <button
                onClick={handleReplay}
                className="flex items-center gap-1.5 text-cc-ivory/40 hover:text-cc-ivory/70 text-xs transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Replay
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Typing dots keyframes injected via style tag */}
      <style>{`
        @keyframes typing-dot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
