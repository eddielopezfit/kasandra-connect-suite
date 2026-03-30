import { useState } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { realEstateAgentSchema, localBusinessSchema } from "@/lib/seo/schemaGenerators";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Building2, Instagram, Facebook, Linkedin, Clock, Send } from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { logEvent } from "@/lib/analytics/logEvent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import kasandraHeadshot from "@/assets/kasandra/desert-garden-closeup.jpg";
import KasandraPortrait from "@/components/v2/KasandraPortrait";

const ContactForm = () => {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      await supabase.functions.invoke("upsert-lead-profile", {
        body: {
          email: email.trim(),
          name: name.trim() || undefined,
          source: "contact_form",
          tags: ["contact_form"],
          notes: message.trim() || undefined,
        },
      });
      logEvent("form_submit", { source: "contact_page" });
      setSent(true);
      toast.success(t("Message sent! Kasandra will be in touch.", "¡Mensaje enviado! Kasandra se pondrá en contacto."));
    } catch {
      toast.error(t("Something went wrong. Please try again.", "Algo salió mal. Inténtalo de nuevo."));
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-border/10 p-8 text-center">
        <div className="w-12 h-12 bg-cc-gold/15 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="w-5 h-5 text-cc-gold" />
        </div>
        <h3 className="font-serif text-xl font-bold text-cc-navy mb-2">
          {t("Thanks for reaching out!", "¡Gracias por escribirnos!")}
        </h3>
        <p className="text-muted-foreground text-sm">
          {t(
            "Kasandra typically responds within 2 hours during business hours.",
            "Kasandra normalmente responde en menos de 2 horas durante horario laboral."
          )}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft border border-border/10 p-8 space-y-4">
      <h3 className="font-serif text-lg font-semibold text-cc-navy">
        {t("Send a Message", "Enviar un Mensaje")}
      </h3>
      <Input
        placeholder={t("Your name", "Tu nombre")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border-border/30"
      />
      <Input
        type="email"
        required
        placeholder={t("Your email *", "Tu correo electrónico *")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border-border/30"
      />
      <Textarea
        placeholder={t(
          "What can Kasandra help you with?",
          "¿En qué puede ayudarte Kasandra?"
        )}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        className="border-border/30 resize-none"
      />
      <Button
        type="submit"
        disabled={sending || !email.trim()}
        className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full shadow-gold"
      >
        <Send className="w-4 h-4 mr-2" />
        {sending
          ? t("Sending...", "Enviando...")
          : t("Send Message", "Enviar Mensaje")}
      </Button>
      <p className="text-[11px] text-muted-foreground text-center">
        {t("No spam, ever. Just a real response from Kasandra.", "Sin spam, nunca. Solo una respuesta real de Kasandra.")}
      </p>
    </form>
  );
};

const V2ContactContent = () => {
  const { t } = useLanguage();

  useDocumentHead({
    titleEn: "Contact Kasandra Prieto | Tucson REALTOR®",
    titleEs: "Contactar a Kasandra Prieto | REALTOR® en Tucson",
    descriptionEn: "Get in touch with Kasandra Prieto. Call, email, or visit. No pressure, no obligation.",
    descriptionEs: "Ponte en contacto con Kasandra Prieto. Llama, envía un correo o visita. Sin presión, sin obligación.",
  });

  const socials = [
    { href: "https://www.instagram.com/prietorealestate/", label: "Instagram", icon: Instagram },
    { href: "https://www.facebook.com/prietorealestategroup", label: "Facebook", icon: Facebook },
    { href: "https://www.linkedin.com/in/kasandraprieto/", label: "LinkedIn", icon: Linkedin },
    { href: "https://www.tiktok.com/@kasandraprieto", label: "TikTok", icon: TikTokIcon },
    {
      href: "https://www.youtube.com/@KasandraPrietoTucson",
      label: "YouTube",
      icon: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <JsonLd data={realEstateAgentSchema()} />
      <JsonLd data={localBusinessSchema()} />
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end w-full overflow-hidden">
        <div className="absolute inset-0 bg-cc-navy">
          <div className="absolute inset-0 bg-gradient-to-br from-cc-navy via-cc-navy/95 to-cc-blue/80" />
        </div>
        <div className="relative container mx-auto px-4 pt-32 pb-16 text-center">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
            {t("Let's Talk", "Hablemos")}
          </h1>
          <p className="text-xl text-white/80 max-w-xl mx-auto mb-6">
            {t(
              "I'm here when you're ready. No pitch, no pressure — just a real conversation.",
              "Aquí estoy cuando estés lista. Sin pitch, sin presión — solo una conversación real."
            )}
          </p>
          <span className="inline-flex items-center gap-2 bg-cc-gold/15 text-cc-gold rounded-full px-4 py-1.5 text-sm font-medium">
            <Clock className="w-4 h-4" />
            {t("Typically responds within 2 hours", "Responde en menos de 2 horas")}
          </span>
        </div>
      </section>

      {/* Two-Column Contact */}
      <section className="bg-cc-ivory py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-start">
            {/* Left — Headshot + Personal Message */}
            <div className="space-y-6">
              <div className="rounded-2xl overflow-hidden ring-4 ring-cc-gold/20 shadow-elevated">
                <KasandraPortrait
                  src={kasandraHeadshot}
                  alt="Kasandra Prieto — Tucson REALTOR®"
                  size="lg"
                  className="w-full rounded-none"
                />
              </div>

              {/* Personal message — Kasandra's touch */}
              <div className="bg-white rounded-2xl shadow-soft border border-border/10 p-6">
                <p className="font-serif text-lg text-cc-navy font-semibold mb-3">
                  {t("A quick note", "Una nota rápida")}
                </p>
                <p className="text-foreground text-sm md:text-base leading-relaxed mb-3">
                  {t(
                    "Whatever brought you here — whether you're just starting to think about it or you've been losing sleep over a decision — I want you to know there's no wrong time to reach out.",
                    "Lo que sea que te trajo aquí — ya sea que apenas estés pensándolo o que lleves noches sin dormir por una decisión — quiero que sepas que no hay mal momento para escribirme."
                  )}
                </p>
                <p className="text-foreground text-sm md:text-base leading-relaxed">
                  {t(
                    "I'll personally read your message and get back to you. No scripts, no hand-offs. Just me.",
                    "Yo personalmente leo tu mensaje y te respondo. Sin guiones, sin intermediarios. Solo yo."
                  )}
                </p>
                <p className="text-cc-gold font-semibold text-sm mt-4 italic">
                  — Kasandra 🐾
                </p>
              </div>
            </div>

            {/* Right — Contact Details + Form */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-soft border border-border/10 p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-cc-gold mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-cc-navy text-sm">{t("Phone", "Teléfono")}</p>
                    <a href="tel:+15203493248" className="text-foreground hover:text-cc-gold transition-colors">
                      (520) 349-3248
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-cc-gold mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-cc-navy text-sm">{t("Email", "Correo Electrónico")}</p>
                    <a href="mailto:kasandra@prietorealestategroup.com" className="text-foreground hover:text-cc-gold transition-colors">
                      kasandra@prietorealestategroup.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-cc-gold mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-cc-navy text-sm">{t("Office", "Oficina")}</p>
                    <p className="text-foreground text-sm">4007 E Paradise Falls Dr, Suite 125</p>
                    <p className="text-foreground text-sm">Tucson, AZ 85712</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Building2 className="w-5 h-5 text-cc-gold mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-cc-navy text-sm">{t("Brokerage", "Corretaje")}</p>
                    <p className="text-foreground text-sm">Corner Connect</p>
                    <p className="text-foreground text-sm">Realty Executives Arizona Territory</p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <ContactForm />

              {/* Social icons */}
              <div className="flex gap-3 px-1">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-cc-navy flex items-center justify-center text-white hover:bg-cc-gold transition-colors"
                    aria-label={`Visit Kasandra on ${s.label}`}
                  >
                    <s.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const V2Contact = () => (
  <V2Layout>
    <V2ContactContent />
  </V2Layout>
);

export default V2Contact;
