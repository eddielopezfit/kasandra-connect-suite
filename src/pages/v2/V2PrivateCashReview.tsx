import { useRef, useEffect, useState } from "react";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { Calendar, MessageCircle, FileText, User } from "lucide-react";
import kasandraHeadshot from "@/assets/kasandra-headshot.jpg";
import { updateSessionContext } from "@/lib/analytics/selenaSession";
import { logEvent } from "@/lib/analytics/logEvent";
import { getLeadId, getStoredUserName, getLastReportId } from "@/lib/analytics/bridgeLeadIdToV2";
import PhoneVerificationGate from "@/components/v2/PhoneVerificationGate";

type GateState = 'checking' | 'locked' | 'unlocked';

const PrivateCashReviewContent = () => {
  const { t } = useLanguage();
  const { openChat, openLastReport } = useSelenaChat();
  const schedulingRef = useRef<HTMLDivElement>(null);
  
  const [leadName, setLeadName] = useState<string | null>(null);
  const [hasExistingReport, setHasExistingReport] = useState(false);

  useEffect(() => {
    const storedName = getStoredUserName();
    const reportId = getLastReportId();
    
    if (storedName) setLeadName(storedName.split(' ')[0]);
    if (reportId) setHasExistingReport(true);
    
    updateSessionContext({ has_viewed_report: true });
    logEvent('private_cash_review_view', { 
      source: 'direct_navigation',
      is_returning: true,
      has_report: !!reportId,
    });
  }, []);

  const scrollToScheduling = () => {
    schedulingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* SECTION 1 – Dynamic Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-cc-gold/10 to-cc-ivory">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="w-16 h-16 rounded-full bg-cc-gold/20 flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-cc-gold" />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-cc-navy mb-6 leading-tight">
            {t(
              `Welcome Back${leadName ? `, ${leadName}` : ""}`,
              `Bienvenido/a de Nuevo${leadName ? `, ${leadName}` : ""}`
            )}
          </h1>
          <p className="text-lg md:text-xl text-cc-charcoal/80 mb-6 max-w-3xl mx-auto">
            {hasExistingReport ? (
              t(
                "Your personalized cash offer analysis is ready for review.",
                "Su análisis personalizado de oferta en efectivo está listo para revisar."
              )
            ) : (
              t(
                "Continue your cash offer review where you left off.",
                "Continue su revisión de oferta en efectivo donde lo dejó."
              )
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {hasExistingReport && (
              <Button 
                size="xl" 
                className="rounded-full px-10 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold shadow-gold"
                onClick={() => openLastReport()}
              >
                <FileText className="w-5 h-5 mr-2" />
                {t("View My Report", "Ver Mi Reporte")}
              </Button>
            )}
            <Button 
              size="xl" 
              variant={hasExistingReport ? "outline" : "default"}
              className={`rounded-full px-10 ${hasExistingReport ? "border-cc-gold text-cc-gold hover:bg-cc-gold hover:text-cc-navy" : "bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold shadow-gold"}`}
              onClick={() => openChat({ source: 'hero', intent: 'cash' })}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {t("Chat with Selena", "Chatear con Selena")}
            </Button>
          </div>
          
          <p className="text-sm text-cc-charcoal/60 mt-4">
            {t(
              "No obligation. No pressure. This is a private, educational review.",
              "Sin compromiso. Sin presión. Esta es una revisión privada y educativa."
            )}
          </p>
        </div>
      </section>

      {/* SECTION 2 – Selena Entry Block */}
      <section className="py-16 md:py-24 bg-cc-ivory">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-cc-navy mb-6">
              {t(
                "Your First Step Is a Private Review With Selena",
                "Su Primer Paso Es Una Revisión Privada Con Selena"
              )}
            </h2>
            
            <p className="text-lg text-cc-charcoal/80 max-w-2xl mx-auto">
              {t(
                "Selena is Kasandra's digital assistant. She'll ask a few simple questions to understand your situation and prepare your private cash review. She uses AI to help organize information, but Kasandra personally handles all decisions and advice.",
                "Selena es la asistente digital de Kasandra. Ella le hará algunas preguntas simples para entender su situación y preparar su revisión privada en efectivo. Usa IA para ayudar a organizar la información, pero Kasandra personalmente maneja todas las decisiones y consejos."
              )}
            </p>
          </div>

          <Card className="border border-cc-gold/30 bg-gradient-to-br from-cc-gold/5 to-cc-ivory shadow-elevated">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-cc-gold flex items-center justify-center mb-4 shadow-lg">
                <MessageCircle className="w-8 h-8 text-cc-navy" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-cc-navy mb-2">
                {t("Chat with Selena", "Chatea con Selena")}
              </h3>
              <p className="text-cc-charcoal/80 mb-6 max-w-sm">
                {t(
                  "She'll gather your details and prepare your personalized cash comparison.",
                  "Ella recopilará sus datos y preparará su comparación de efectivo personalizada."
                )}
              </p>
              <Button onClick={() => openChat({ source: 'hero', intent: 'cash' })} size="lg" className="rounded-full px-8 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold shadow-gold">
                <MessageCircle className="w-5 h-5 mr-2" />
                {t("Start My Review", "Iniciar Mi Revisión")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 3 – Kasandra Authority Block */}
      <section className="py-16 md:py-24 bg-cc-sand">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="shrink-0">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-cc-ivory shadow-xl">
                <img
                  src={kasandraHeadshot}
                  alt="Kasandra Prieto"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-cc-navy mb-2">
                Kasandra Prieto
              </h3>
              <p className="text-cc-gold font-medium mb-4">
                {t(
                  "Cash Sale Advisor | Tucson",
                  "Asesora de Ventas en Efectivo | Tucson"
                )}
              </p>
              <p className="text-cc-charcoal/80 text-lg mb-6 max-w-xl">
                {t(
                  "Kasandra specializes in helping homeowners compare real cash offers, timelines, and traditional selling options so they can make confident decisions without pressure.",
                  "Kasandra se especializa en ayudar a propietarios a comparar ofertas reales en efectivo, cronogramas y opciones de venta tradicional para que puedan tomar decisiones seguras sin presión."
                )}
              </p>
              <Button 
                size="lg" 
                className="rounded-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold shadow-gold"
                onClick={scrollToScheduling}
              >
                <Calendar className="w-5 h-5 mr-2" />
                {t(
                  "Schedule My Private Cash Review",
                  "Agendar Mi Revisión Privada en Efectivo"
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 – Scheduling Gateway Block */}
      <section ref={schedulingRef} className="py-16 md:py-24 bg-cc-ivory">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-cc-navy mb-4">
              {t(
                "Request Your Private Cash Review",
                "Solicite Su Revisión Privada en Efectivo"
              )}
            </h2>
            <p className="text-lg text-cc-charcoal/80 max-w-2xl mx-auto">
              {t(
                "This is a one-on-one, no-pressure review where Kasandra walks you through your real options.",
                "Esta es una revisión individual, sin presión, donde Kasandra le explica sus opciones reales."
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border border-cc-sand-dark/30 overflow-hidden shadow-elevated">
              <CardContent className="p-0">
                <div className="aspect-video">
                  <video
                    src="/videos/kasandra-welcome.mp4"
                    poster={kasandraHeadshot}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 bg-cc-sand">
                  <p className="text-sm text-cc-charcoal/70 text-center">
                    {t(
                      "A personal message from Kasandra",
                      "Un mensaje personal de Kasandra"
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-cc-gold/30 bg-gradient-to-br from-cc-gold/5 to-cc-ivory shadow-elevated">
              <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-cc-gold/10 flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-cc-gold" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-cc-navy mb-2">
                  {t("Ready to Schedule?", "¿Listo para Agendar?")}
                </h3>
                <p className="text-cc-charcoal/80 mb-6 max-w-sm">
                  {t(
                    "Book a private consultation with Kasandra to review your options in person.",
                    "Agende una consulta privada con Kasandra para revisar sus opciones en persona."
                  )}
                </p>
                <Button 
                  size="lg" 
                  className="rounded-full px-8 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold shadow-gold"
                  onClick={() => openChat({ source: 'hero', intent: 'cash' })}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {t("Schedule My Review", "Agendar Mi Revisión")}
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-cc-charcoal/60 mt-8">
            {t(
              "This is a private consultation. You can cancel or reschedule anytime.",
              "Esta es una consulta privada. Puede cancelar o reprogramar en cualquier momento."
            )}
          </p>
        </div>
      </section>
    </>
  );
};

const GateLoadingSkeleton = () => (
  <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
    <div className="max-w-md w-full space-y-6">
      <Skeleton className="h-16 w-16 rounded-full mx-auto" />
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6 mx-auto" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  </div>
);

const V2PrivateCashReview = () => {
  const [gateState, setGateState] = useState<GateState>('checking');

  useEffect(() => {
    const leadId = getLeadId();
    if (leadId) {
      setGateState('unlocked');
    } else {
      setGateState('locked');
    }
  }, []);

  const handleVerified = (leadId: string) => {
    setGateState('unlocked');
  };

  return (
    <V2Layout>
      {gateState === 'checking' && <GateLoadingSkeleton />}
      {gateState === 'locked' && <PhoneVerificationGate onVerified={handleVerified} />}
      {gateState === 'unlocked' && <PrivateCashReviewContent />}
    </V2Layout>
  );
};

export default V2PrivateCashReview;
