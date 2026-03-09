/**
 * CTA QA Registry — Every testable CTA in the hub.
 * 
 * priority: lower = more critical (Top 10 are 1-10)
 * automatable: true if we can verify via route resolution without navigating away
 * notes: quick context for the tester
 */

export interface CTATestEntry {
  id: string;
  group: string;
  labelEn: string;
  labelEs: string;
  component: string;
  expectedBehavior: 'navigate' | 'openChat' | 'tel' | 'mailto' | 'external';
  expectedTarget: string;
  automatable: boolean;
  manualSteps?: string;
  priority?: number;
  notes?: string;
}

export const ctaRegistry: CTATestEntry[] = [
  // ── Top 10 Critical ──
  {
    id: 'NAV1',
    group: 'Navigation',
    labelEn: 'Book a Consultation',
    labelEs: 'Agende una Consulta',
    component: 'src/components/v2/V2Navigation.tsx',
    expectedBehavior: 'navigate',
    expectedTarget: '/book',
    automatable: true,
    priority: 1,
  },
  {
    id: 'H1',
    group: 'Home',
    labelEn: 'Chat with Selena',
    labelEs: 'Habla con Selena',
    component: 'src/pages/v2/V2Home.tsx',
    expectedBehavior: 'openChat',
    expectedTarget: 'chat_drawer',
    automatable: false,
    manualSteps: 'Click the "Chat with Selena" hero CTA. Verify chat drawer opens. No page navigation.',
    priority: 2,
  },
  {
    id: 'H2',
    group: 'Home',
    labelEn: 'Learn More (Buyers)',
    labelEs: 'Más Información (Compradores)',
    component: 'src/pages/v2/V2Home.tsx',
    expectedBehavior: 'navigate',
    expectedTarget: '/buy',
    automatable: true,
    priority: 3,
  },
  {
    id: 'H3',
    group: 'Home',
    labelEn: 'Learn More (Sellers)',
    labelEs: 'Más Información (Vendedores)',
    component: 'src/pages/v2/V2Home.tsx',
    expectedBehavior: 'navigate',
    expectedTarget: '/v2/sell',
    automatable: true,
    priority: 4,
  },
  {
    id: 'H4',
    group: 'Home',
    labelEn: 'Learn More (Cash Offers)',
    labelEs: 'Más Información (Ofertas en Efectivo)',
    component: 'src/pages/v2/V2Home.tsx',
    expectedBehavior: 'navigate',
    expectedTarget: '/v2/cash-offer-options',
    automatable: true,
    priority: 5,
  },
  {
    id: 'FT1',
    group: 'Footer',
    labelEn: 'Phone link',
    labelEs: 'Enlace de teléfono',
    component: 'src/components/v2/V2Footer.tsx',
    expectedBehavior: 'tel',
    expectedTarget: 'tel:+15203493248',
    automatable: false,
    manualSteps: 'Click footer phone number. Verify tel: intent fires.',
    priority: 6,
    notes: 'Cannot verify tel: programmatically in browser.',
  },
  {
    id: 'FT2',
    group: 'Footer',
    labelEn: 'Email link',
    labelEs: 'Enlace de correo',
    component: 'src/components/v2/V2Footer.tsx',
    expectedBehavior: 'mailto',
    expectedTarget: 'mailto:kasandra@kasandraoasis.com',
    automatable: false,
    manualSteps: 'Click footer email. Verify mailto: intent fires.',
    priority: 7,
    notes: 'Cannot verify mailto: programmatically in browser.',
  },
  {
    id: 'FT3',
    group: 'Footer',
    labelEn: 'Selena footer nudge',
    labelEs: 'Selena pie de página',
    component: 'src/components/v2/V2Footer.tsx',
    expectedBehavior: 'openChat',
    expectedTarget: 'chat_drawer',
    automatable: false,
    manualSteps: 'Click Selena nudge in footer. Verify chat drawer opens.',
    priority: 8,
  },
  {
    id: 'CD1',
    group: 'Chat Drawer',
    labelEn: 'Connect with Kasandra (Talk tab)',
    labelEs: 'Conectar con Kasandra',
    component: 'src/components/selena/ConciergeTabPanels.tsx',
    expectedBehavior: 'navigate',
    expectedTarget: '/v2/book',
    automatable: false,
    manualSteps: 'Open chat drawer → Talk tab → Click "Connect with Kasandra". Verify route = /v2/book, drawer closes, no modal.',
    priority: 9,
  },
  {
    id: 'CD2',
    group: 'Chat Drawer',
    labelEn: 'Browse Guides',
    labelEs: 'Explorar Guías',
    component: 'src/components/selena/ConciergeTabPanels.tsx',
    expectedBehavior: 'navigate',
    expectedTarget: '/v2/guides',
    automatable: false,
    manualSteps: 'Open chat drawer → Learn tab → Click "Browse all guides". Verify route = /v2/guides.',
    priority: 10,
  },

  // ── Sell Page ──
  {
    id: 'S1',
    group: 'Sell',
    labelEn: 'Get Your Cash Offer Comparison',
    labelEs: 'Obtenga Su Comparación de Oferta',
    component: 'src/pages/v2/V2Sell.tsx',
    expectedBehavior: 'navigate',
    expectedTarget: '/v2/cash-offer-options',
    automatable: true,
    priority: 11,
  },
  {
    id: 'S2',
    group: 'Sell',
    labelEn: 'Book a Private Consultation',
    labelEs: 'Agende una Consulta Privada',
    component: 'src/pages/v2/V2Sell.tsx',
    expectedBehavior: 'navigate',
    expectedTarget: '/v2/book',
    automatable: true,
    priority: 12,
  },

  // ── Buy Page ──
  {
    id: 'B1',
    group: 'Buy',
    labelEn: 'Check Your Readiness',
    labelEs: 'Verifique Su Preparación',
    component: 'src/pages/v2/V2Buy.tsx',
    expectedBehavior: 'navigate',
    expectedTarget: '/v2/buyer-readiness',
    automatable: true,
    priority: 13,
  },
  {
    id: 'B2',
    group: 'Buy',
    labelEn: 'Book a Consultation',
    labelEs: 'Agende una Consulta',
    component: 'src/pages/v2/V2Buy.tsx',
    expectedBehavior: 'navigate',
    expectedTarget: '/v2/book',
    automatable: true,
    priority: 14,
  },

  // ── Cash Offer Options ──
  {
    id: 'CO1',
    group: 'Cash Offer Options',
    labelEn: 'Talk to Kasandra',
    labelEs: 'Hablar con Kasandra',
    component: 'src/pages/v2/V2CashOfferOptions.tsx',
    expectedBehavior: 'navigate',
    expectedTarget: '/v2/book',
    automatable: true,
    priority: 15,
  },

  // ── Guides ──
  {
    id: 'G1',
    group: 'Guides',
    labelEn: 'Browse All Guides',
    labelEs: 'Ver Todas las Guías',
    component: 'src/pages/v2/V2Guides.tsx',
    expectedBehavior: 'navigate',
    expectedTarget: '/v2/guides',
    automatable: true,
    priority: 16,
  },

  // ── ActionSpec Chips (Chat Drawer) ──
  {
    id: 'CHIP1',
    group: 'Chat Drawer Chips',
    labelEn: 'Talk with Kasandra',
    labelEs: 'Hablar con Kasandra',
    component: 'src/components/selena/drawer/SelenaDrawerSuggestedRepliesChips.tsx',
    expectedBehavior: 'navigate',
    expectedTarget: '/v2/book',
    automatable: false,
    manualSteps: 'Sell flow → ASAP → Phase 3 chips appear → Click "Talk with Kasandra". Verify: route=/v2/book, NO selena-chat POST, NO user message appended.',
    priority: 17,
    notes: 'ActionSpec chip — must NOT trigger edge function or append message.',
  },
  {
    id: 'CHIP2',
    group: 'Chat Drawer Chips',
    labelEn: 'Estimate my net proceeds',
    labelEs: 'Estimar mis ganancias netas',
    component: 'src/components/selena/drawer/SelenaDrawerSuggestedRepliesChips.tsx',
    expectedBehavior: 'navigate',
    expectedTarget: '/v2/cash-offer-options',
    automatable: false,
    manualSteps: 'Sell flow → ASAP → Phase 3 chips appear → Click "Estimate my net proceeds". Verify: route=/v2/cash-offer-options, NO selena-chat POST, NO user message appended.',
    priority: 18,
    notes: 'ActionSpec chip — must NOT trigger edge function or append message.',
  },

  // ── Community ──
  {
    id: 'CM1',
    group: 'Community',
    labelEn: 'Community Partners',
    labelEs: 'Socios Comunitarios',
    component: 'src/pages/v2/V2Community.tsx',
    expectedBehavior: 'navigate',
    expectedTarget: '/v2/community',
    automatable: true,
    priority: 19,
  },

  // ── Podcast ──
  {
    id: 'P1',
    group: 'Podcast',
    labelEn: 'Listen to Podcast',
    labelEs: 'Escuchar Podcast',
    component: 'src/pages/v2/V2Podcast.tsx',
    expectedBehavior: 'navigate',
    expectedTarget: '/v2/podcast',
    automatable: true,
    priority: 20,
  },

  // ── Thank You ──
  {
    id: 'TY1',
    group: 'Thank You',
    labelEn: 'Back to Home',
    labelEs: 'Volver al Inicio',
    component: 'src/pages/v2/V2ThankYou.tsx',
    expectedBehavior: 'navigate',
    expectedTarget: '/v2',
    automatable: true,
    priority: 21,
  },

  // ── Floating Button ──
  {
    id: 'FB1',
    group: 'Global',
    labelEn: 'Selena Floating Button',
    labelEs: 'Botón Flotante de Selena',
    component: 'src/components/selena/SelenaFloatingButton.tsx',
    expectedBehavior: 'openChat',
    expectedTarget: 'chat_drawer',
    automatable: false,
    manualSteps: 'Click floating Selena button (bottom-right). Verify chat drawer opens.',
    priority: 22,
  },
];
