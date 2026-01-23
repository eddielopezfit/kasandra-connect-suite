import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, FileText, DollarSign, Calendar, Heart, Globe, Users, Shield, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const CashOffer = () => {
  const { t } = useLanguage();

  const goodFitItems = [
    t("You need speed or certainty", "Necesitas rapidez o certeza"),
    t("The home needs repairs", "La casa necesita reparaciones"),
    t("You're facing a life transition", "Estás pasando por una transición de vida"),
    t("You inherited a property", "Heredaste una propiedad"),
    t("You prefer simplicity over maximizing price", "Prefieres simplicidad sobre maximizar el precio")
  ];

  const notFitItems = [
    t("You're not in a rush", "No tienes prisa"),
    t("Your home is market-ready", "Tu casa está lista para el mercado"),
    t("You want top-of-market pricing", "Quieres el precio máximo del mercado")
  ];

  const processSteps = [
    { 
      icon: FileText, 
      step: "1", 
      title: t("Share Details", "Comparte Detalles"), 
      desc: t("Tell me about your property — just the basics.", "Cuéntame sobre tu propiedad — solo lo básico.") 
    },
    { 
      icon: DollarSign, 
      step: "2", 
      title: t("Review Options", "Revisa Opciones"), 
      desc: t("We'll compare cash vs. traditional sale together.", "Compararemos juntos la venta en efectivo vs. tradicional.") 
    },
    { 
      icon: Clock, 
      step: "3", 
      title: t("Receive Offer", "Recibe Oferta"), 
      desc: t("Get a clear, no-obligation cash offer.", "Recibe una oferta clara en efectivo, sin compromiso.") 
    },
    { 
      icon: Calendar, 
      step: "4", 
      title: t("You Decide", "Tú Decides"), 
      desc: t("Choose your timeline — or walk away freely.", "Elige tu tiempo — o retírate libremente.") 
    }
  ];

  const trustItems = [
    { icon: Clock, label: t("18+ Years in Tucson", "18+ Años en Tucson") },
    { icon: Globe, label: t("Bilingual Guidance", "Asesoría Bilingüe") },
    { icon: Users, label: t("Community Involved", "Comprometida con la Comunidad") },
    { icon: Shield, label: t("Honesty First", "Honestidad Primero") }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-cream to-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-primary leading-tight mb-6">
              {t(
                "A Clear, No-Pressure Cash Offer — On Your Timeline",
                "Una Oferta Clara en Efectivo, Sin Presión — En Tu Tiempo"
              )}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t(
                "If selling traditionally isn't the right fit right now, I'll help you understand your options clearly and respectfully.",
                "Si vender de manera tradicional no es lo mejor para ti en este momento, te ayudaré a entender tus opciones con claridad y respeto."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="accent" size="lg" className="rounded-full text-base px-8" asChild>
                <a href="#intake-form">{t("Get My Cash Offer", "Obtener Mi Oferta en Efectivo")}</a>
              </Button>
              <Button variant="heroOutline" size="lg" className="rounded-full text-base px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
                <a href="#contact">{t("Talk With Kasandra First", "Habla Con Kasandra Primero")}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary text-center mb-12">
              {t("Is a Cash Offer Right for You?", "¿Es Una Oferta en Efectivo Adecuada Para Ti?")}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* Good Fit */}
              <div className="bg-cream/50 rounded-2xl p-8 border border-gold/20">
                <h3 className="font-serif text-xl font-semibold text-primary mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-gold" />
                  </span>
                  {t("This may be a good fit if:", "Esto puede ser buena opción si:")}
                </h3>
                <ul className="space-y-4">
                  {goodFitItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-foreground/80">
                      <Check className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Not a Fit */}
              <div className="bg-background rounded-2xl p-8 border border-border">
                <h3 className="font-serif text-xl font-semibold text-primary mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </span>
                  {t("This may not be the best fit if:", "Esto puede no ser lo mejor si:")}
                </h3>
                <ul className="space-y-4">
                  {notFitItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-foreground/80">
                      <X className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-center text-lg text-muted-foreground mt-10 font-medium italic">
              {t(
                '"If a cash offer isn\'t your best option, I\'ll tell you."',
                '"Si una oferta en efectivo no es tu mejor opción, te lo diré."'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* The Process Section */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary text-center mb-4">
              {t("How It Works", "Cómo Funciona")}
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
              {t(
                "A straightforward process with no deadlines and no pressure.",
                "Un proceso sencillo sin plazos y sin presión."
              )}
            </p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((item, index) => (
                <div key={index} className="bg-background rounded-2xl p-6 text-center border border-border/50 hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-gold" />
                  </div>
                  <span className="text-xs font-semibold text-gold tracking-wider uppercase mb-2 block">
                    {t("Step", "Paso")} {item.step}
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-primary mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Authority Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-6">
              {t("You're Working With a Real Person", "Trabajas Con Una Persona Real")}
            </h2>
            <p className="text-lg text-muted-foreground mb-12">
              {t(
                "Not a call center. Not a faceless investor. Just someone who cares about getting you the right outcome.",
                "No un centro de llamadas. No un inversionista sin rostro. Solo alguien que se preocupa por conseguirte el mejor resultado."
              )}
            </p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trustItems.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-3 p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Selena AI Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-background rounded-3xl p-8 md:p-12 border border-border shadow-lg">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-10 h-10 text-gold" />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-4">
                    {t("Meet Selena AI, My Digital Concierge", "Conoce a Selena AI, Mi Asistente Digital")}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {t(
                      "Have questions late at night or want to understand your options before filling anything out? Selena AI is here to help guide you through the process — no pressure, no sales pitch.",
                      "¿Tienes preguntas a altas horas de la noche o quieres entender tus opciones antes de llenar algo? Selena AI está aquí para guiarte en el proceso — sin presión, sin discurso de ventas."
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    {t(
                      "Selena AI can answer common questions and explain next steps, but she'll never quote prices or replace a real conversation with me.",
                      "Selena AI puede responder preguntas comunes y explicar los siguientes pasos, pero nunca cotizará precios ni reemplazará una conversación real conmigo."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intake Form Section */}
      <section id="intake-form" className="py-20 md:py-28 bg-cream">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-4">
              {t("Ready to Explore Your Options?", "¿Lista Para Explorar Tus Opciones?")}
            </h2>
            <p className="text-muted-foreground">
              {t(
                "Share a few details and I'll reach out personally — no automated calls, no pressure.",
                "Comparte algunos detalles y me comunicaré personalmente — sin llamadas automatizadas, sin presión."
              )}
            </p>
          </div>
          
          {/* GoHighLevel Form Placeholder */}
          <div className="max-w-xl mx-auto">
            <div className="bg-muted/50 rounded-2xl p-12 border-2 border-dashed border-border text-center min-h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">
                {t("GoHighLevel form will be embedded here", "El formulario de GoHighLevel se integrará aquí")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Connection Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <Heart className="w-10 h-10 text-gold mx-auto mb-6" />
            <p className="text-lg text-muted-foreground mb-6">
              {t(
                "If you decide a traditional sale makes more sense, that's completely okay. I'm here to help either way.",
                "Si decides que una venta tradicional tiene más sentido, está perfectamente bien. Estoy aquí para ayudarte de cualquier manera."
              )}
            </p>
            <Button variant="outline" size="lg" className="rounded-full" asChild>
              <Link to="/">{t("Learn About Traditional Listings", "Conoce Sobre Listados Tradicionales")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CashOffer;
