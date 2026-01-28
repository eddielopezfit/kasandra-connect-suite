import { useRef } from "react";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { CheckCircle, Calendar, MessageCircle } from "lucide-react";
import kasandraHeadshot from "@/assets/kasandra-headshot.jpg";

// Inner component that uses SelenaChatContext (rendered inside V2Layout which provides the context)
const PrivateCashReviewContent = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();
  const schedulingRef = useRef<HTMLDivElement>(null);

  const scrollToScheduling = () => {
    schedulingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* SECTION 1 – Education Block */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
            {t(
              "Compare Your Cash Offer Options Before You Decide",
              "Compare Sus Opciones de Oferta en Efectivo Antes de Decidir"
            )}
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            {t(
              "This platform helps you understand what a real cash sale looks like, how fast it can happen, and how it compares to a traditional listing — so you stay in control.",
              "Esta plataforma le ayuda a entender cómo es una venta en efectivo real, qué tan rápido puede suceder, y cómo se compara con una venta tradicional — para que usted mantenga el control."
            )}
          </p>

          <div className="flex flex-col items-start text-left max-w-xl mx-auto mb-10 space-y-4">
            {[
              t(
                "Review real cash-sale timelines and outcomes",
                "Revise cronogramas y resultados reales de ventas en efectivo"
              ),
              t(
                "Understand your net, speed, and flexibility",
                "Entienda su ganancia neta, velocidad y flexibilidad"
              ),
              t(
                "Decide with clarity, not pressure",
                "Decida con claridad, sin presión"
              ),
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-primary mt-0.5 shrink-0" />
                <span className="text-foreground text-lg">{item}</span>
              </div>
            ))}
          </div>

          <Button 
            size="xl" 
            className="rounded-full px-10"
            onClick={openChat}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {t("Start My Cash Review", "Iniciar Mi Revisión en Efectivo")}
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            {t(
              "No obligation. No pressure. This is a private, educational review.",
              "Sin compromiso. Sin presión. Esta es una revisión privada y educativa."
            )}
          </p>
        </div>
      </section>

      {/* SECTION 2 – Selena Entry Block */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-foreground mb-6">
              {t(
                "Your First Step Is a Private Review With Selena",
                "Su Primer Paso Es Una Revisión Privada Con Selena"
              )}
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t(
                "Selena is Kasandra's digital assistant. She'll ask a few simple questions to understand your situation and prepare your private cash review. She uses AI to help organize information, but Kasandra personally handles all decisions and advice.",
                "Selena es la asistente digital de Kasandra. Ella le hará algunas preguntas simples para entender su situación y preparar su revisión privada en efectivo. Usa IA para ayudar a organizar la información, pero Kasandra personalmente maneja todas las decisiones y consejos."
              )}
            </p>
          </div>

          {/* Chat Widget Placeholder */}
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
            <CardContent className="py-16 flex flex-col items-center justify-center text-center">
              <MessageCircle className="w-12 h-12 text-primary/50 mb-4" />
              <p className="text-muted-foreground mb-4">
                {t(
                  "Chat widget will appear here",
                  "El widget de chat aparecerá aquí"
                )}
              </p>
              <Button variant="outline" onClick={openChat}>
                {t("Open Chat with Selena", "Abrir Chat con Selena")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 3 – Kasandra Authority Block */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Profile Image */}
            <div className="shrink-0">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-background shadow-xl">
                <img
                  src={kasandraHeadshot}
                  alt="Kasandra Prieto"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Profile Content */}
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">
                Kasandra Prieto
              </h3>
              <p className="text-primary font-medium mb-4">
                {t(
                  "Cash Sale Advisor | Tucson",
                  "Asesora de Ventas en Efectivo | Tucson"
                )}
              </p>
              <p className="text-muted-foreground text-lg mb-6 max-w-xl">
                {t(
                  "Kasandra specializes in helping homeowners compare real cash offers, timelines, and traditional selling options so they can make confident decisions without pressure.",
                  "Kasandra se especializa en ayudar a propietarios a comparar ofertas reales en efectivo, cronogramas y opciones de venta tradicional para que puedan tomar decisiones seguras sin presión."
                )}
              </p>
              <Button 
                size="lg" 
                className="rounded-full"
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
      <section ref={schedulingRef} className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-foreground mb-4">
              {t(
                "Request Your Private Cash Review",
                "Solicite Su Revisión Privada en Efectivo"
              )}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t(
                "This is a one-on-one, no-pressure review where Kasandra walks you through your real options.",
                "Esta es una revisión individual, sin presión, donde Kasandra le explica sus opciones reales."
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Video Placeholder */}
            <Card className="border-2 border-dashed border-muted-foreground/30 bg-muted/20">
              <CardContent className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-primary border-b-8 border-b-transparent ml-1" />
                </div>
                <p className="text-muted-foreground">
                  {t(
                    "Personal video from Kasandra",
                    "Video personal de Kasandra"
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Calendar Placeholder */}
            <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
              <CardContent className="py-20 flex flex-col items-center justify-center text-center">
                <Calendar className="w-12 h-12 text-primary/50 mb-4" />
                <p className="text-muted-foreground">
                  {t(
                    "GoHighLevel calendar embed",
                    "Calendario de GoHighLevel"
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
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

// Main component that wraps content in V2Layout (which provides SelenaChatProvider)
const V2PrivateCashReview = () => {
  return (
    <V2Layout>
      <PrivateCashReviewContent />
    </V2Layout>
  );
};

export default V2PrivateCashReview;
