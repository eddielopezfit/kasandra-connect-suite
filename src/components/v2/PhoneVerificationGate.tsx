import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, Phone, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface PhoneVerificationGateProps {
  onVerified: (leadId: string) => void;
}

const PhoneVerificationGate = ({ onVerified }: PhoneVerificationGateProps) => {
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPhoneDisplay = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneDisplay(e.target.value);
    setPhone(formatted);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract digits only for validation
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length < 10) {
      setError(t(
        "Please enter a valid 10-digit phone number",
        "Por favor ingrese un número de teléfono válido de 10 dígitos"
      ));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-lead-phone', {
        body: { phone: digits },
      });

      if (fnError) {
        throw new Error(fnError.message || "Verification failed");
      }

      if (!data?.ok) {
        setError(data?.error || t(
          "No record found for this phone number",
          "No se encontró registro para este número de teléfono"
        ));
        return;
      }

      // Store lead_id in localStorage for session continuity
      if (data.lead_id) {
        localStorage.setItem('selena_lead_id', data.lead_id);
        toast.success(t("Access granted!", "¡Acceso concedido!"));
        onVerified(data.lead_id);
      }

    } catch (err) {
      console.error("Phone verification error:", err);
      setError(t(
        "Unable to verify. Please try again or contact us directly.",
        "No se pudo verificar. Por favor intente de nuevo o contáctenos directamente."
      ));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
      <Card className="max-w-md w-full border border-primary/20 shadow-elevated">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-serif">
            {t("Private Access Required", "Se Requiere Acceso Privado")}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {t(
              "This page is reserved for leads who have previously submitted their information. Enter the phone number you used to verify your identity.",
              "Esta página está reservada para contactos que previamente enviaron su información. Ingrese el número de teléfono que utilizó para verificar su identidad."
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground/80">
                {t("Phone Number", "Número de Teléfono")}
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(520) 555-1234"
                  className="pl-11"
                  maxLength={14}
                  autoComplete="tel"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || phone.replace(/\D/g, '').length < 10}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t("Verifying...", "Verificando...")}
                </>
              ) : (
                <>
                  {t("Verify & Access", "Verificar y Acceder")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              {t(
                "Haven't submitted your information yet?",
                "¿Aún no ha enviado su información?"
              )}
            </p>
            <a 
              href="/v2/book" 
              className="text-sm text-primary hover:underline font-medium"
            >
              {t("Start a consultation →", "Iniciar una consulta →")}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhoneVerificationGate;
