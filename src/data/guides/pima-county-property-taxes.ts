import type { GuideContentData } from './types';

const data: GuideContentData = {
  title: 'Pima County Property Taxes: What Tucson Homeowners Should Know',
  titleEs: 'Impuestos de Propiedad del Condado de Pima: Lo Que Deben Saber los Propietarios de Tucson',
  category: 'Buying a Home',
  categoryEs: 'Comprar una Casa',
  author: 'Kasandra Prieto',
  intro: "Property taxes come up in almost every conversation I have with Tucson buyers, and there's almost always some confusion about how Arizona's system actually works. That's okay — it's genuinely different from most states, and the jargon doesn't help. This guide explains it plainly, including the programs that can reduce what you owe if you qualify.",
  introEs: "Los impuestos de propiedad surgen en casi todas las conversaciones que tengo con compradores de Tucson, y casi siempre hay algo de confusión sobre cómo funciona realmente el sistema de Arizona. Eso está bien — es genuinamente diferente a la mayoría de los estados, y la jerga no ayuda. Esta guía lo explica claramente, incluyendo los programas que pueden reducir lo que debes si calificas.",
  sections: [
    {
      heading: "How Arizona's Property Tax System Works",
      headingEs: 'Cómo Funciona el Sistema de Impuestos de Propiedad de Arizona',
      content: "Arizona uses a two-value system that confuses many buyers:\n\n**Full Cash Value (FCV):** The assessor's estimate of your home's market value. Updated annually based on sales data in your area.\n\n**Limited Property Value (LPV):** The value actually used to calculate your tax bill. Arizona law caps annual increases in LPV at 5% per year (Prop 117, passed in 2012). This means your tax calculation is protected from sharp market spikes — the FCV can jump 20%, but your tax bill can only increase by 5% per year.\n\n**Assessment ratio:** Residential property in Arizona is assessed at 10% of LPV for primary residences. For a home with an LPV of $300,000, the assessed value for tax purposes is $30,000.\n\n**Tax rate:** The tax rate (set annually by Pima County, Tucson city, school districts, and other taxing jurisdictions) is applied to the assessed value.\n\n**Example:** A Tucson home with LPV of $300,000:\n• Assessed value: $300,000 × 10% = $30,000\n• Combined Pima County/City rate (approximately 10–12%): $30,000 × 11% = $3,300/year\n\nTypical effective tax rate for Tucson primary residences: approximately 0.8–1.1% of market value annually.",
      contentEs: "Arizona usa un sistema de dos valores que confunde a muchos compradores:\n\n**Valor Total en Efectivo (FCV):** La estimación del tasador del valor de mercado de tu casa. Actualizado anualmente basado en datos de ventas en tu área.\n\n**Valor de Propiedad Limitado (LPV):** El valor realmente usado para calcular tu factura de impuestos. La ley de Arizona limita los aumentos anuales en LPV al 5% por año (Prop 117, aprobada en 2012).\n\n**Tasa de evaluación:** La propiedad residencial en Arizona se evalúa al 10% del LPV para residencias principales.\n\n**Ejemplo:** Una casa de Tucson con LPV de $300,000:\n• Valor evaluado: $300,000 × 10% = $30,000\n• Tasa combinada del Condado de Pima/Ciudad (aproximadamente 10–12%): $30,000 × 11% = $3,300/año",
    },
    {
      heading: 'Property Tax Exemptions and Programs in Pima County',
      headingEs: 'Exenciones y Programas de Impuestos de Propiedad en el Condado de Pima',
      variant: 'stats-grid',
      content: "Several programs can reduce your property tax liability in Pima County. Here are the most important ones:",
      contentEs: "Varios programas pueden reducir tu responsabilidad de impuestos de propiedad en el Condado de Pima. Aquí están los más importantes:",
      statsData: [
        { value: 'Owner-Occupied', valueEs: 'Ocupada por Propietario', label: 'Primary residence classification reduces assessment ratio to 10% vs 25% for rental/investment property', labelEs: 'La clasificación de residencia principal reduce la tasa de evaluación al 10% vs 25% para propiedades de alquiler/inversión' },
        { value: '65+ Freeze', valueEs: 'Congelamiento 65+', label: 'Senior Property Valuation Protection: freezes assessed value for 3 years for homeowners 65+ meeting income limits', labelEs: 'Protección de Valoración de Propiedad para Personas Mayores: congela el valor tasado por 3 años para propietarios de 65+ que cumplen los límites de ingresos' },
        { value: 'Widow/Widower', valueEs: 'Viudo/Viuda', label: '$4,134 annual exemption for qualifying widow/widowers (no age requirement, income limits apply)', labelEs: 'Exención anual de $4,134 para viudos/viudas calificados (sin requisito de edad, límites de ingresos aplican)' },
        { value: 'Disabled Vet', valueEs: 'Veterano Discapacitado', label: 'Full exemption available for 100% service-connected disabled veterans (no income limit)', labelEs: 'Exención completa disponible para veteranos discapacitados 100% relacionados con el servicio (sin límite de ingresos)' },
      ],
    },
    {
      heading: 'What to Expect When You Buy a Home in Tucson',
      headingEs: 'Qué Esperar Cuando Compras una Casa en Tucson',
      content: "One important thing buyers miss: your property tax bill after purchase may not match what the previous owner paid.\n\n**The LPV reset on sale:** In many cases, when a property sells, the assessor will update the Full Cash Value to reflect the sale price. This can cause a spike in LPV — and therefore your tax bill — in the year or two following your purchase. The 5% annual cap still limits the rate of increase, but if the previous owner's LPV was significantly below market value, you may see your taxes climb for several years until LPV aligns with FCV.\n\n**Request property tax history.** When reviewing a property, ask for 3 years of tax bills — not just the current amount. If the seller has owned the property for 20+ years, their current tax bill may not reflect what you'll pay.\n\n**Non-primary-residence rates.** If you're buying investment property or a second home, your assessment ratio is 25% instead of 10% — meaning your tax bill is 2.5x higher per dollar of LPV than a primary residence owner pays.\n\n**Pima County tax bills:** Taxes are paid in two installments. First half due November 1 (delinquent after December 31). Second half due May 1 (delinquent after June 30). Most buyers set up an impound account through their lender to spread payments monthly.",
      contentEs: "Una cosa importante que los compradores pasan por alto: tu factura de impuestos de propiedad después de la compra puede no coincidir con lo que pagó el propietario anterior.\n\n**El restablecimiento del LPV en la venta:** En muchos casos, cuando una propiedad se vende, el tasador actualizará el Valor Total en Efectivo para reflejar el precio de venta. Esto puede causar un aumento en el LPV — y por lo tanto en tu factura de impuestos — en el año o dos siguientes a tu compra.\n\n**Solicita el historial de impuestos de propiedad.** Al revisar una propiedad, pide 3 años de facturas de impuestos — no solo el monto actual.\n\n**Facturas de impuestos del Condado de Pima:** Los impuestos se pagan en dos cuotas. Primera mitad vence el 1 de noviembre. Segunda mitad vence el 1 de mayo.",
    },
    {
      heading: 'How to Appeal Your Assessed Value',
      headingEs: 'Cómo Apelar Tu Valor Tasado',
      content: "If you believe the Pima County Assessor has overvalued your property, you have the right to appeal.\n\n**Step 1:** Review your Notice of Value (mailed each year in February). Compare the Full Cash Value to recent comparable sales near your home.\n\n**Step 2:** If you believe the value is too high, file a Form 82130 (Petition for Review of Valuation) with the Assessor's office by April 25 of the tax year.\n\n**Step 3:** The Assessor's office will review your petition and may adjust the value or schedule a hearing.\n\n**Step 4:** If you're not satisfied with the assessor's decision, you can appeal to the Pima County Board of Equalization.\n\n**What helps an appeal:** Recent sales of comparable homes in your neighborhood at prices below the assessed value, documentation of property condition issues not reflected in the assessment, evidence that the assessor used incorrect data (square footage, bedroom count, lot size).\n\n**Contact:** Pima County Assessor's Office\n240 N Stone Ave, Tucson, AZ 85701\n(520) 724-8630 | assessor.pima.gov",
      contentEs: "Si crees que el Tasador del Condado de Pima ha sobrevalorado tu propiedad, tienes el derecho de apelar.\n\n**Paso 1:** Revisa tu Aviso de Valor (enviado por correo cada año en febrero).\n\n**Paso 2:** Si crees que el valor es muy alto, presenta el Formulario 82130 (Petición para Revisión de Valoración) ante la oficina del Tasador para el 25 de abril del año fiscal.\n\n**Contacto:** Oficina del Tasador del Condado de Pima\n240 N Stone Ave, Tucson, AZ 85701\n(520) 724-8630 | assessor.pima.gov",
    },
    {
      heading: 'Comparing Tucson to Other Arizona Markets',
      headingEs: 'Comparando Tucson con Otros Mercados de Arizona',
      content: "Tucson's property taxes are one of its legitimate advantages over other Arizona markets:\n\n• Tucson/Pima County effective tax rate: ~0.8–1.1% of market value\n• Phoenix/Maricopa County: comparable range (~0.8–1.0%)\n• Scottsdale (luxury): effective rate can appear lower due to high values but similar statutory structure\n• California comparison: California's Prop 13 creates very low rates for long-term owners but new buyers often face higher effective rates\n• Texas comparison: Texas has no state income tax but significantly higher property tax rates (2–2.5% of market value is common)\n\nFor out-of-state buyers from Texas especially, Tucson's property tax picture is meaningfully better — and combined with Arizona's income tax structure (which doesn't tax Social Security), the overall tax environment is competitive.",
      contentEs: "Los impuestos de propiedad de Tucson son una de sus ventajas legítimas sobre otros mercados de Arizona:\n\n• Tucson/Condado de Pima tasa efectiva: ~0.8–1.1% del valor de mercado\n• Phoenix/Condado de Maricopa: rango comparable (~0.8–1.0%)\n• Comparación con Texas: Texas no tiene impuesto estatal sobre ingresos pero tasas de impuesto de propiedad significativamente más altas (2–2.5% del valor de mercado es común)\n\nPara compradores de fuera del estado de Texas especialmente, el panorama de impuestos de propiedad de Tucson es significativamente mejor.",
    },
    {
      heading: "What's Next",
      headingEs: '¿Qué Sigue?',
      content: "Understanding property taxes is part of running your real numbers before making a purchase decision. If you'd like help calculating the annual carrying costs on a specific home you're considering, Selena and Kasandra can walk you through it — including tax, insurance, HOA, and mortgage — so you know exactly what you're committing to.",
      contentEs: "Entender los impuestos de propiedad es parte de calcular tus números reales antes de tomar una decisión de compra. Si deseas ayuda para calcular los costos anuales de tenencia de una casa específica que estás considerando, Selena y Kasandra pueden guiarte — incluyendo impuestos, seguro, HOA e hipoteca.",
    },
  ],
};

export default data;
