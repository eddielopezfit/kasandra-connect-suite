/**
 * Neighborhood Registry — Single Source of Truth
 * 
 * 15 Tucson-area neighborhoods with editorial content for SEO + conversion.
 * Each entry drives index cards, detail pages, and Selena context.
 */

export type RegionGroup = 'central' | 'north' | 'east' | 'south' | 'metro';

export interface NeighborhoodEntry {
  slug: string;
  name: string;
  nameEs: string;
  regionGroup: RegionGroup;
  primaryZip: string;
  /** Override for Perplexity query when ZIP is shared (e.g., Corona de Tucson vs Vail) */
  neighborhoodQueryName?: string;
  heroTagline: { en: string; es: string };
  sellerProfile: { en: string; es: string };
  buyerProfile: { en: string; es: string };
  relatedNeighborhoods: [string, string, string];
  relatedGuides: string[];
  metaDescription: { en: string; es: string };

  /* ── Area Decision Engine fields (optional — graceful degradation) ── */
  positioningLine?: { en: string; es: string };
  storyBreak?: { headline: { en: string; es: string }; body: { en: string; es: string } };
  lifestyleFit?: {
    strongMatch: { en: string[]; es: string[] };
    considerCarefully: { en: string[]; es: string[] };
  };
  areaIntelligence?: {
    priceRange: { en: string; es: string };
    demandLevel: 'low' | 'moderate' | 'high';
    marketSpeed: 'slow' | 'average' | 'fast';
    propertyTypes: { en: string[]; es: string[] };
  };
  lifestyleHighlights?: {
    dining: { en: string; es: string };
    outdoor: { en: string; es: string };
    dailyRhythm: { en: string; es: string };
  };
  schoolSummary?: { en: string; es: string };
  heroImageUrl?: string;
  lifestyleImageUrl?: string;
}

export const NEIGHBORHOOD_REGISTRY: NeighborhoodEntry[] = [
  {
    slug: 'tucson',
    name: 'Tucson',
    nameEs: 'Tucson',
    regionGroup: 'central',
    primaryZip: '85701',
    heroTagline: {
      en: "The heart of Southern Arizona — urban grit, desert beauty, and a culture that's distinctly its own.",
      es: "El corazón del sur de Arizona — carácter urbano, belleza del desierto y una cultura única."
    },
    positioningLine: {
      en: 'Walkable culture, desert soul, and homes with character.',
      es: 'Cultura caminable, alma del desierto y casas con carácter.',
    },
    storyBreak: {
      headline: { en: 'Where the City Meets the Desert', es: 'Donde la Ciudad Se Encuentra con el Desierto' },
      body: { en: 'Central Tucson isn\'t trying to be anywhere else. Arts, food, and neighborhoods with stories — this is real Arizona living.', es: 'El centro de Tucson no intenta ser otro lugar. Arte, comida y vecindarios con historias — esto es vivir en Arizona de verdad.' },
    },
    lifestyleFit: {
      strongMatch: {
        en: ['Walkable neighborhoods with local shops', 'Homes with character and history', 'Arts & culture scene', 'University proximity', 'Diverse dining options'],
        es: ['Vecindarios caminables con tiendas locales', 'Casas con carácter e historia', 'Escena artística y cultural', 'Proximidad a la universidad', 'Opciones gastronómicas diversas'],
      },
      considerCarefully: {
        en: ['Newer construction and HOA communities', 'Large lot sizes and open space', 'Top-rated school districts', 'Resort-style amenities'],
        es: ['Construcción nueva y comunidades con HOA', 'Lotes grandes y espacios abiertos', 'Distritos escolares de primera', 'Amenidades estilo resort'],
      },
    },
    areaIntelligence: {
      priceRange: { en: '$180K – $450K', es: '$180K – $450K' },
      demandLevel: 'moderate' as const,
      marketSpeed: 'average' as const,
      propertyTypes: { en: ['Historic bungalows', 'Mid-century homes', 'Condos', 'Duplexes'], es: ['Bungalows históricos', 'Casas de mediados de siglo', 'Condominios', 'Dúplex'] },
    },
    lifestyleHighlights: {
      dining: { en: 'UNESCO City of Gastronomy — from Sonoran hot dogs to James Beard-nominated kitchens. Fourth Avenue and downtown offer walkable restaurant rows.', es: 'Ciudad UNESCO de Gastronomía — desde hot dogs sonorenses hasta cocinas nominadas al James Beard. Fourth Avenue y downtown ofrecen restaurantes caminables.' },
      outdoor: { en: 'Tucson Mountain Park, Sentinel Peak ("A" Mountain), and the Loop trail system for biking and running. Desert sunsets year-round.', es: 'Tucson Mountain Park, Sentinel Peak (Montaña "A"), y el sistema de senderos Loop para ciclismo y carrera. Atardeceres del desierto todo el año.' },
      dailyRhythm: { en: 'A city that starts early and slows down in the afternoon heat. Weekends revolve around farmers markets, gallery walks, and patio dining.', es: 'Una ciudad que comienza temprano y se relaja con el calor de la tarde. Los fines de semana giran alrededor de mercados, galerías y cenas al aire libre.' },
    },
    sellerProfile: {
      en: "Central Tucson sellers range from young professionals upgrading to historic homeowners downsizing. Properties here move faster than the metro average when priced correctly — buyers are drawn to walkability, arts districts, and University proximity. If your home has character (original tile, exposed brick, mature landscaping), lean into it. Cookie-cutter staging backfires in this market.",
      es: "Los vendedores del centro de Tucson van desde jóvenes profesionales que buscan mejorar hasta propietarios de casas históricas que reducen espacio. Las propiedades aquí se venden más rápido que el promedio del área cuando están bien valoradas — los compradores buscan accesibilidad peatonal, distritos artísticos y proximidad a la Universidad."
    },
    buyerProfile: {
      en: "If you want walkable neighborhoods, local coffee shops over chains, and homes with stories — central Tucson is your market. Expect older construction (1940s–1970s), smaller lots, and the occasional foundation or roof question. First-time buyers thrive here with the right inspection strategy. Investors should look at duplexes near the U of A.",
      es: "Si buscas vecindarios caminables, cafeterías locales en vez de cadenas, y casas con historia — el centro de Tucson es tu mercado. Espera construcción antigua (1940s–1970s), lotes pequeños, y posibles preguntas sobre cimientos o techos."
    },
    relatedNeighborhoods: ['south-tucson', 'catalina-foothills', 'oro-valley'],
    relatedGuides: ['relocating-to-tucson', 'first-time-buyer-guide', 'tucson-neighborhoods'],
    metaDescription: {
      en: "Selling or buying in central Tucson? Get insider market insights, neighborhood profiles, and expert guidance from Kasandra Prieto.",
      es: "¿Vendiendo o comprando en el centro de Tucson? Obtén información privilegiada del mercado y orientación experta de Kasandra Prieto."
    }
  },
  {
    slug: 'oro-valley',
    name: 'Oro Valley',
    nameEs: 'Oro Valley',
    regionGroup: 'north',
    primaryZip: '85737',
    heroTagline: {
      en: "Where master-planned meets mountain views — Tucson's most polished suburb.",
      es: "Donde la planificación maestra se encuentra con vistas a las montañas — el suburbio más pulido de Tucson."
    },
    positioningLine: {
      en: 'Polished suburban living with Catalina Mountain views.',
      es: 'Vida suburbana pulida con vistas a las montañas Catalina.',
    },
    storyBreak: {
      headline: { en: 'Where Ambition Meets Tranquility', es: 'Donde la Ambición Se Encuentra con la Tranquilidad' },
      body: { en: 'Oro Valley rewards those who value both performance and peace. Executive neighborhoods, top schools, and sunsets over the Catalinas — earned, not inherited.', es: 'Oro Valley recompensa a quienes valoran tanto el rendimiento como la paz. Vecindarios ejecutivos, las mejores escuelas y atardeceres sobre las Catalinas.' },
    },
    lifestyleFit: {
      strongMatch: {
        en: ['Top-rated schools and family amenities', 'Mountain views and resort-style living', 'Move-in-ready, newer construction', 'Low crime and well-maintained streets', 'Golf and outdoor recreation access'],
        es: ['Escuelas de primera y amenidades familiares', 'Vistas a las montañas y vida estilo resort', 'Construcción nueva, lista para mudarse', 'Baja criminalidad y calles bien mantenidas', 'Acceso a golf y recreación al aire libre'],
      },
      considerCarefully: {
        en: ['Urban walkability and nightlife', 'Affordable entry-level pricing', 'Eclectic or historic character', 'Minimal HOA restrictions'],
        es: ['Accesibilidad peatonal y vida nocturna', 'Precios accesibles de entrada', 'Carácter ecléctico o histórico', 'Mínimas restricciones de HOA'],
      },
    },
    areaIntelligence: {
      priceRange: { en: '$380K – $850K+', es: '$380K – $850K+' },
      demandLevel: 'high' as const,
      marketSpeed: 'average' as const,
      propertyTypes: { en: ['Single-family homes', 'Luxury estates', 'Townhomes', 'Active-adult communities'], es: ['Casas unifamiliares', 'Propiedades de lujo', 'Townhomes', 'Comunidades de adultos activos'] },
    },
    lifestyleHighlights: {
      dining: { en: 'Upscale dining along Oracle Road and La Cañada, farm-to-table restaurants, and a growing craft brewery scene. Sunday brunch culture is real here.', es: 'Restaurantes de alta cocina en Oracle Road y La Cañada, restaurantes de granja a mesa, y una creciente escena de cervecerías artesanales.' },
      outdoor: { en: 'Catalina State Park for hiking, Pusch Ridge for scrambling, and miles of connected bike paths. Steam Pump Ranch hosts community events year-round.', es: 'Catalina State Park para senderismo, Pusch Ridge para escalada, y kilómetros de ciclovías conectadas. Steam Pump Ranch organiza eventos comunitarios todo el año.' },
      dailyRhythm: { en: 'Morning trail runs, school drop-offs, and a pace that feels suburban but never boring. Evenings bring patio dining and mountain sunsets.', es: 'Carreras matutinas en senderos, llevar a los niños a la escuela, y un ritmo que se siente suburbano pero nunca aburrido.' },
    },
    sellerProfile: {
      en: "Oro Valley commands premium pricing and attracts relocating executives, medical professionals, and families prioritizing schools. Homes here compete on condition — buyers expect move-in ready. If you're selling, invest in curb appeal and staging. The median sits 40% above Tucson proper, but days on market stretch longer because buyers are selective. Price it right or watch it sit.",
      es: "Oro Valley tiene precios premium y atrae ejecutivos reubicados, profesionales médicos y familias que priorizan las escuelas. Las casas aquí compiten por condición — los compradores esperan listas para mudarse. Si vendes, invierte en apariencia exterior y staging."
    },
    buyerProfile: {
      en: "Oro Valley buyers are typically upgrading from starter homes or relocating from higher-cost metros. You'll find excellent schools, low crime, and resort-style amenities — but you'll pay for it. HOA fees can surprise first-timers. If you're coming from Phoenix or California, the value proposition is strong. Run the numbers on property taxes before falling in love.",
      es: "Los compradores de Oro Valley típicamente están mejorando desde casas iniciales o reubicándose desde áreas más caras. Encontrarás excelentes escuelas, baja criminalidad y amenidades de resort — pero pagarás por ello."
    },
    relatedNeighborhoods: ['catalina-foothills', 'marana', 'catalina'],
    relatedGuides: ['move-up-buyer', 'relocating-to-tucson', 'tucson-suburb-comparison'],
    metaDescription: {
      en: "Oro Valley real estate insights — selling strategies, buyer guidance, and market intelligence from a local expert.",
      es: "Información sobre bienes raíces en Oro Valley — estrategias de venta, orientación para compradores e inteligencia de mercado."
    }
  },
  {
    slug: 'marana',
    name: 'Marana',
    nameEs: 'Marana',
    regionGroup: 'north',
    primaryZip: '85742',
    heroTagline: {
      en: "New construction, young families, and the fastest-growing corner of the metro.",
      es: "Construcción nueva, familias jóvenes y el rincón de más rápido crecimiento del área metropolitana."
    },
    positioningLine: {
      en: 'New homes, young energy, and the space to grow.',
      es: 'Casas nuevas, energía joven y espacio para crecer.',
    },
    storyBreak: {
      headline: { en: 'Built for What\'s Next', es: 'Construido para lo Que Viene' },
      body: { en: 'Marana isn\'t looking back. New communities, growing infrastructure, and families writing their first chapters — this is where momentum lives.', es: 'Marana no mira atrás. Nuevas comunidades, infraestructura en crecimiento y familias escribiendo sus primeros capítulos — aquí vive el impulso.' },
    },
    lifestyleFit: {
      strongMatch: {
        en: ['Brand-new construction and builder incentives', 'Larger lots and open desert views', 'Family-oriented communities with parks', 'Remote work lifestyle with space', 'Value for the square footage'],
        es: ['Construcción nueva e incentivos de constructores', 'Lotes más grandes y vistas al desierto', 'Comunidades orientadas a la familia con parques', 'Estilo de vida de trabajo remoto con espacio', 'Valor por pie cuadrado'],
      },
      considerCarefully: {
        en: ['Walkable urban lifestyle', 'Historic charm or unique architecture', 'Short commute to central Tucson', 'Established restaurant and nightlife scene'],
        es: ['Estilo de vida urbano caminable', 'Encanto histórico o arquitectura única', 'Viaje corto al centro de Tucson', 'Escena establecida de restaurantes y vida nocturna'],
      },
    },
    areaIntelligence: {
      priceRange: { en: '$280K – $520K', es: '$280K – $520K' },
      demandLevel: 'high' as const,
      marketSpeed: 'fast' as const,
      propertyTypes: { en: ['New-build single-family', 'Master-planned communities', 'Spec homes', 'Custom lots'], es: ['Casas nuevas unifamiliares', 'Comunidades planificadas', 'Casas especulativas', 'Lotes personalizados'] },
    },
    lifestyleHighlights: {
      dining: { en: 'Growing retail along Cortaro and Twin Peaks. Local favorites mix with national chains. The craft beer scene is emerging, and food trucks gather on weekends.', es: 'Retail en crecimiento en Cortaro y Twin Peaks. Favoritos locales mezclados con cadenas nacionales. La escena de cerveza artesanal está emergiendo.' },
      outdoor: { en: 'Tortolita Mountain trails, Rillito River Park connection, and wide open desert spaces. Community pools and splash pads keep families cool in summer.', es: 'Senderos de Tortolita Mountain, conexión con Rillito River Park, y amplios espacios desérticos. Piscinas comunitarias mantienen a las familias frescas en verano.' },
      dailyRhythm: { en: 'Family-paced mornings, community park afternoons, and quiet evenings. Weekends mean sports leagues, farmers markets, and backyard barbecues.', es: 'Mañanas con ritmo familiar, tardes en parques comunitarios, y noches tranquilas. Los fines de semana significan ligas deportivas y barbacoas.' },
    },
    sellerProfile: {
      en: "Marana sellers benefit from sustained demand — young families and remote workers are flooding in for new builds and larger lots. Your competition is the builder down the street offering incentives. If you're selling resale, emphasize what new construction can't offer: mature landscaping, finished backyards, and no construction traffic. Price competitively against new inventory.",
      es: "Los vendedores de Marana se benefician de una demanda sostenida — familias jóvenes y trabajadores remotos llegan en masa por construcciones nuevas y lotes más grandes. Tu competencia es el constructor que ofrece incentivos."
    },
    buyerProfile: {
      en: "Marana is where you get the most house for your money in northwest Tucson. New construction dominates — negotiate closing costs, not price. Commute times to central Tucson run 25-40 minutes depending on I-10 traffic. Schools are solid and improving. If you work from home or commute to Oro Valley/Marana employers, this is your sweet spot.",
      es: "Marana es donde obtienes más casa por tu dinero en el noroeste de Tucson. Domina la construcción nueva — negocia costos de cierre, no el precio. Los tiempos de viaje al centro de Tucson son de 25-40 minutos."
    },
    relatedNeighborhoods: ['oro-valley', 'picture-rocks', 'red-rock'],
    relatedGuides: ['first-time-buyer-guide', 'arizona-first-time-buyer-programs', 'tucson-suburb-comparison'],
    metaDescription: {
      en: "Marana AZ real estate — new construction insights, resale strategies, and buyer guidance from Kasandra Prieto.",
      es: "Bienes raíces en Marana AZ — información sobre construcción nueva, estrategias de reventa y orientación para compradores."
    }
  },
  {
    slug: 'catalina',
    name: 'Catalina',
    nameEs: 'Catalina',
    regionGroup: 'north',
    primaryZip: '85739',
    heroTagline: {
      en: "Land, privacy, and Oracle Road sunsets — where Tucson professionals go when they're ready to spread out.",
      es: "Terreno, privacidad y atardeceres de Oracle Road — donde los profesionales de Tucson van cuando están listos para expandirse."
    },
    sellerProfile: {
      en: "Catalina sellers are typically motivated by life transitions — retirement relocation, estate sales, or downsizing after kids leave. Buyers here specifically want acreage, so don't try to compete on finishes. Highlight well capacity, septic condition, and outbuilding potential. Properties with 2+ acres and mountain views command significant premiums. Marketing to the right buyer matters more than staging.",
      es: "Los vendedores de Catalina típicamente están motivados por transiciones de vida — reubicación por jubilación, ventas de herencia, o reducir espacio después de que los hijos se van. Los compradores aquí específicamente quieren terreno."
    },
    buyerProfile: {
      en: "Catalina attracts buyers who've decided they're done with HOAs, neighbors ten feet away, and postage-stamp lots. Expect well water, septic systems, and unpaved roads on some properties — that's the trade for privacy and space. Verify water rights and well production before committing. If you want horses, RVs, or workshop space, this is your market.",
      es: "Catalina atrae a compradores que decidieron que terminaron con HOAs, vecinos a tres metros, y lotes pequeños. Espera agua de pozo, sistemas sépticos y caminos sin pavimentar en algunas propiedades."
    },
    relatedNeighborhoods: ['oro-valley', 'red-rock', 'corona-de-tucson'],
    relatedGuides: ['senior-downsizing', 'inherited-probate-property', 'understanding-home-valuation'],
    metaDescription: {
      en: "Catalina AZ real estate — acreage properties, rural living insights, and expert guidance from Kasandra Prieto.",
      es: "Bienes raíces en Catalina AZ — propiedades con terreno, información sobre vida rural y orientación experta."
    }
  },
  {
    slug: 'catalina-foothills',
    name: 'Catalina Foothills',
    nameEs: 'Catalina Foothills',
    regionGroup: 'north',
    primaryZip: '85718',
    heroTagline: {
      en: "Executive homes, canyon hiking, and Tucson's most established luxury corridor.",
      es: "Casas ejecutivas, senderismo en cañones y el corredor de lujo más establecido de Tucson."
    },
    sellerProfile: {
      en: "Foothills sellers are often long-term owners sitting on substantial equity. This market rewards patience and presentation — luxury buyers take their time and expect perfection. Professional photography, twilight shoots, and lifestyle marketing outperform standard MLS listings dramatically. Estate sales and downsizers should work with an agent who knows the high-end buyer pool.",
      es: "Los vendedores de Foothills son frecuentemente propietarios a largo plazo con capital sustancial. Este mercado recompensa la paciencia y la presentación — los compradores de lujo toman su tiempo y esperan perfección."
    },
    buyerProfile: {
      en: "The Foothills represent Tucson's premier address — Sabino Canyon access, top-rated Catalina Foothills School District, and homes that make a statement. Entry points start around $600K for older inventory; custom homes and view lots climb into the millions. Cash and conventional buyers dominate. If you're relocating executive-level, this is likely your first stop.",
      es: "Foothills representa la dirección premier de Tucson — acceso a Sabino Canyon, el distrito escolar Catalina Foothills de primera categoría, y casas que hacen una declaración."
    },
    relatedNeighborhoods: ['oro-valley', 'tucson', 'vail'],
    relatedGuides: ['move-up-buyer', 'selling-for-top-dollar', 'capital-gains-home-sale-arizona'],
    metaDescription: {
      en: "Catalina Foothills luxury real estate — executive home insights, market strategy, and expert guidance from Kasandra Prieto.",
      es: "Bienes raíces de lujo en Catalina Foothills — información sobre casas ejecutivas y estrategia de mercado."
    }
  },
  {
    slug: 'vail',
    name: 'Vail',
    nameEs: 'Vail',
    regionGroup: 'east',
    primaryZip: '85641',
    neighborhoodQueryName: 'Vail',
    heroTagline: {
      en: "Saguaro country with top-rated schools — space and community southeast of town.",
      es: "País de saguaros con escuelas de primera — espacio y comunidad al sureste de la ciudad."
    },
    sellerProfile: {
      en: "Vail sellers benefit from the school district's reputation — families specifically target this area. Homes near Empire High and Cienega High command premiums. Your buyer pool is young families upgrading and military families from Davis-Monthan. Emphasize school zones, community amenities, and commute access to the base. Well-maintained homes with pools sell fast in summer.",
      es: "Los vendedores de Vail se benefician de la reputación del distrito escolar — las familias específicamente buscan esta área. Las casas cerca de Empire High y Cienega High tienen precios premium."
    },
    buyerProfile: {
      en: "Vail delivers the rare combination of excellent schools, newer construction, and relative affordability. Commute to central Tucson runs 30-45 minutes. The area feels more rural than suburban — expect wildlife, dark skies, and breathing room. Military families from Davis-Monthan make up a significant buyer segment. Check flood zone maps on properties near washes.",
      es: "Vail ofrece la rara combinación de excelentes escuelas, construcción más nueva y asequibilidad relativa. El viaje al centro de Tucson es de 30-45 minutos."
    },
    relatedNeighborhoods: ['corona-de-tucson', 'sahuarita', 'tucson'],
    relatedGuides: ['first-time-buyer-guide', 'military-pcs-guide', 'arizona-first-time-buyer-programs'],
    metaDescription: {
      en: "Vail AZ real estate — top schools, family communities, and buyer/seller guidance from Kasandra Prieto.",
      es: "Bienes raíces en Vail AZ — mejores escuelas, comunidades familiares y orientación de Kasandra Prieto."
    }
  },
  {
    slug: 'sahuarita',
    name: 'Sahuarita',
    nameEs: 'Sahuarita',
    regionGroup: 'south',
    primaryZip: '85629',
    heroTagline: {
      en: "Planned growth, young professionals, and the commute that's worth it.",
      es: "Crecimiento planificado, jóvenes profesionales y un viaje que vale la pena."
    },
    sellerProfile: {
      en: "Sahuarita is a seller's market for well-maintained homes — demand outpaces supply consistently. Your competition is Raytheon-area new construction, so resale homes need to show value. Highlight upgrades, established landscaping, and community amenities. The buyer pool skews young professional and military — they move fast when they find the right fit. Price at market, not above.",
      es: "Sahuarita es un mercado de vendedores para casas bien mantenidas — la demanda supera consistentemente la oferta. Tu competencia es la construcción nueva del área de Raytheon."
    },
    buyerProfile: {
      en: "Sahuarita attracts Raytheon employees, young families priced out of Oro Valley, and first-time buyers seeking value. The 25-minute commute to central Tucson is real but manageable. Master-planned communities dominate — expect HOAs. The town has invested heavily in parks, trails, and community amenities. Entry-level homes go fast; get pre-approved before touring.",
      es: "Sahuarita atrae empleados de Raytheon, familias jóvenes que no pueden pagar Oro Valley, y compradores primerizos que buscan valor. El viaje de 25 minutos al centro de Tucson es real pero manejable."
    },
    relatedNeighborhoods: ['green-valley', 'vail', 'tucson'],
    relatedGuides: ['first-time-buyer-guide', 'arizona-first-time-buyer-programs', 'tucson-suburb-comparison'],
    metaDescription: {
      en: "Sahuarita AZ real estate — growing community insights, buyer strategies, and expert guidance from Kasandra Prieto.",
      es: "Bienes raíces en Sahuarita AZ — información de comunidad en crecimiento y estrategias para compradores."
    }
  },
  {
    slug: 'south-tucson',
    name: 'South Tucson',
    nameEs: 'South Tucson',
    regionGroup: 'central',
    primaryZip: '85713',
    heroTagline: {
      en: "A city within a city — rooted culture, affordability, and real-estate opportunity.",
      es: "Una ciudad dentro de una ciudad — cultura arraigada, asequibilidad y oportunidad inmobiliaria."
    },
    sellerProfile: {
      en: "South Tucson sellers often work with inherited properties or long-held family homes. The buyer pool includes first-time buyers seeking affordability and investors targeting rental income near the U of A and downtown. Properties in good condition are rare — if yours is updated, price accordingly. Cash buyers and investors move quickly here; be prepared for fast offers.",
      es: "Los vendedores de South Tucson frecuentemente trabajan con propiedades heredadas o casas familiares de larga data. Los compradores incluyen primerizos buscando asequibilidad e inversores."
    },
    buyerProfile: {
      en: "South Tucson offers the most affordable entry point in central Tucson — but do your due diligence. Older construction means inspection is critical. The area is undergoing gradual revitalization; early buyers are capturing equity. Investors should analyze rental comps carefully. Owner-occupants should factor in renovation budgets. Not for the faint of heart, but opportunity exists.",
      es: "South Tucson ofrece el punto de entrada más asequible en el centro de Tucson — pero haz tu debida diligencia. La construcción antigua significa que la inspección es crítica."
    },
    relatedNeighborhoods: ['tucson', 'sahuarita', 'vail'],
    relatedGuides: ['first-time-buyer-guide', 'inherited-probate-property', 'understanding-home-valuation'],
    metaDescription: {
      en: "South Tucson real estate — affordability insights, investment potential, and guidance from Kasandra Prieto.",
      es: "Bienes raíces en South Tucson — información de asequibilidad, potencial de inversión y orientación de Kasandra Prieto."
    }
  },
  {
    slug: 'green-valley',
    name: 'Green Valley',
    nameEs: 'Green Valley',
    regionGroup: 'south',
    primaryZip: '85614',
    heroTagline: {
      en: "Active retirement, golf, and year-round sunshine — Arizona's premier 55+ destination.",
      es: "Jubilación activa, golf y sol todo el año — el destino premier 55+ de Arizona."
    },
    sellerProfile: {
      en: "Green Valley sellers are predominantly retirees making life-transition moves — relocating to be near family, moving to assisted living, or estate representatives handling inherited property. Buyers here are deliberate and often paying cash. Homes in 55+ communities require age verification for at least one occupant. Market to the snowbird and active-adult buyer pools through retirement publications and golf community networks, not just MLS.",
      es: "Los vendedores de Green Valley son predominantemente jubilados haciendo mudanzas de transición de vida — reubicándose para estar cerca de familia, mudándose a vivienda asistida, o representantes de herencias. Los compradores aquí son deliberados y frecuentemente pagan en efectivo."
    },
    buyerProfile: {
      en: "Green Valley is built for the 55+ active-adult lifestyle — golf courses, recreation centers, social clubs, and snowbird-friendly seasonal communities. Before committing, verify HOA age restrictions (most require at least one resident 55+), understand the difference between deeded vs. leased land communities, and confirm what amenities are included vs. fee-based. If you're under 55, your options are limited to non-age-restricted areas on the periphery.",
      es: "Green Valley está construido para el estilo de vida activo de mayores de 55 años — campos de golf, centros recreativos, clubes sociales y comunidades estacionales. Antes de comprometerte, verifica las restricciones de edad del HOA (la mayoría requiere al menos un residente de 55+)."
    },
    relatedNeighborhoods: ['sahuarita', 'rio-rico', 'tucson'],
    relatedGuides: ['senior-downsizing', 'inherited-probate-property', 'capital-gains-home-sale-arizona'],
    metaDescription: {
      en: "Green Valley AZ 55+ real estate — retirement community insights, seller guidance for life transitions, and expert help from Kasandra Prieto.",
      es: "Bienes raíces 55+ en Green Valley AZ — información de comunidades de jubilación y orientación para transiciones de vida."
    }
  },
  {
    slug: 'corona-de-tucson',
    name: 'Corona de Tucson',
    nameEs: 'Corona de Tucson',
    regionGroup: 'east',
    primaryZip: '85641',
    neighborhoodQueryName: 'Corona de Tucson',
    heroTagline: {
      en: "Horse property, custom homes, and elbow room at the edge of the Rincons.",
      es: "Propiedad para caballos, casas personalizadas y espacio al borde de los Rincons."
    },
    sellerProfile: {
      en: "Corona de Tucson sellers typically own custom or semi-custom homes on acreage — your buyer is specifically looking for what you have. Don't over-improve; the market values land and potential over finishes. Highlight well production, septic capacity, horse facilities, and outbuilding square footage. Properties here take longer to sell but command strong prices from the right buyer.",
      es: "Los vendedores de Corona de Tucson típicamente poseen casas personalizadas o semi-personalizadas en terrenos — tu comprador busca específicamente lo que tienes. No mejores de más; el mercado valora el terreno y el potencial sobre los acabados."
    },
    buyerProfile: {
      en: "Corona de Tucson is for buyers who want the rural lifestyle without going fully remote. Expect 1-5 acre parcels, well and septic systems, and a 20-35 minute commute to central Tucson. Horse owners, hobby farmers, and privacy-seekers thrive here. Verify water rights, CC&Rs (some areas have none), and road maintenance responsibilities before closing.",
      es: "Corona de Tucson es para compradores que quieren el estilo de vida rural sin ir completamente remoto. Espera parcelas de 1-5 acres, sistemas de pozo y séptico, y 20-35 minutos de viaje al centro de Tucson."
    },
    relatedNeighborhoods: ['vail', 'catalina', 'sahuarita'],
    relatedGuides: ['understanding-home-valuation', 'sell-or-rent-tucson', 'pricing-strategy'],
    metaDescription: {
      en: "Corona de Tucson real estate — horse property, acreage homes, and expert guidance from Kasandra Prieto.",
      es: "Bienes raíces en Corona de Tucson — propiedad para caballos, casas con terreno y orientación experta."
    }
  },
  {
    slug: 'sierra-vista',
    name: 'Sierra Vista',
    nameEs: 'Sierra Vista',
    regionGroup: 'metro',
    primaryZip: '85635',
    heroTagline: {
      en: "Fort Huachuca, mountain views, and Southern Arizona's most affordable family market.",
      es: "Fort Huachuca, vistas a las montañas y el mercado familiar más asequible del sur de Arizona."
    },
    sellerProfile: {
      en: "Sierra Vista sellers navigate a military-influenced market — PCS cycles drive seasonal demand. Summer and early fall see the most buyer activity. Your buyer pool is predominantly military families, DoD contractors, and retirees who fell in love with the area during their service. Price competitively; buyers here are value-focused. Homes near the base and good schools move fastest.",
      es: "Los vendedores de Sierra Vista navegan un mercado influenciado por lo militar — los ciclos PCS impulsan la demanda estacional. El verano y principios de otoño ven más actividad de compradores."
    },
    buyerProfile: {
      en: "Sierra Vista offers the most home for your dollar in the Tucson metro — but you're 70+ miles from central Tucson. If you work at Fort Huachuca, this is a no-brainer. The Huachuca Mountains provide stunning backdrops and outdoor access. Schools are solid. The town has everything you need day-to-day but lacks the dining and cultural options of Tucson proper.",
      es: "Sierra Vista ofrece más casa por tu dólar en el área de Tucson — pero estás a más de 70 millas del centro de Tucson. Si trabajas en Fort Huachuca, es una decisión fácil."
    },
    relatedNeighborhoods: ['vail', 'sahuarita', 'green-valley'],
    relatedGuides: ['military-pcs-guide', 'first-time-buyer-guide', 'relocating-to-tucson'],
    metaDescription: {
      en: "Sierra Vista AZ real estate — military-friendly market insights, affordable family homes, and expert guidance from Kasandra Prieto.",
      es: "Bienes raíces en Sierra Vista AZ — mercado amigable para militares, casas familiares asequibles y orientación experta."
    }
  },
  {
    slug: 'rio-rico',
    name: 'Rio Rico',
    nameEs: 'Rio Rico',
    regionGroup: 'metro',
    primaryZip: '85648',
    heroTagline: {
      en: "Border proximity, binational lifestyle, and golf-course living at half the price.",
      es: "Proximidad a la frontera, estilo de vida binacional y vida de campo de golf a mitad de precio."
    },
    sellerProfile: {
      en: "Rio Rico sellers work with a niche buyer pool — binational families, border-economy workers, and retirees seeking value. The golf course communities attract snowbirds. Marketing should emphasize lifestyle value: Nogales shopping access, lower cost of living, and community amenities. Properties here don't move as fast as Tucson metro — price realistically and be patient.",
      es: "Los vendedores de Rio Rico trabajan con un grupo de compradores de nicho — familias binacionales, trabajadores de la economía fronteriza y jubilados buscando valor."
    },
    buyerProfile: {
      en: "Rio Rico appeals to buyers who want Southern Arizona living without Tucson prices. The trade-off is a 45-60 minute commute to Tucson proper. If your work is border-related, remote, or you're retired, the value is exceptional. Golf communities offer resort-style amenities. Verify HOA financials in older communities — some are underfunded.",
      es: "Rio Rico atrae a compradores que quieren vivir en el sur de Arizona sin los precios de Tucson. El compromiso es un viaje de 45-60 minutos a Tucson."
    },
    relatedNeighborhoods: ['nogales', 'green-valley', 'sahuarita'],
    relatedGuides: ['senior-downsizing', 'relocating-to-tucson', 'understanding-home-valuation'],
    metaDescription: {
      en: "Rio Rico AZ real estate — border community insights, golf-course homes, and guidance from Kasandra Prieto.",
      es: "Bienes raíces en Rio Rico AZ — información de comunidad fronteriza, casas de campo de golf y orientación."
    }
  },
  {
    slug: 'nogales',
    name: 'Nogales',
    nameEs: 'Nogales',
    regionGroup: 'metro',
    primaryZip: '85621',
    heroTagline: {
      en: "Gateway to Mexico — binational commerce, culture, and real estate opportunity.",
      es: "Puerta a México — comercio binacional, cultura y oportunidad inmobiliaria."
    },
    sellerProfile: {
      en: "Nogales sellers work in a unique binational market. Buyers include cross-border families, customs/trade professionals, and investors seeing opportunity in the border economy. Properties range from historic downtown buildings to hillside homes with international views. Marketing should reach both US and Sonoran buyer pools. Cash transactions are common; be prepared for non-traditional financing scenarios.",
      es: "Los vendedores de Nogales trabajan en un mercado binacional único. Los compradores incluyen familias transfronterizas, profesionales de aduanas/comercio e inversores."
    },
    buyerProfile: {
      en: "Nogales is for buyers whose lives straddle the border — work, family, or cultural ties to Sonora. Real estate values are the lowest in the Southern Arizona corridor, offering significant entry-point opportunity. The town has rich history and character but limited amenities compared to Tucson. Verify property boundaries carefully; some parcels have complex histories.",
      es: "Nogales es para compradores cuyas vidas cruzan la frontera — trabajo, familia o lazos culturales con Sonora. Los valores inmobiliarios son los más bajos del corredor del sur de Arizona."
    },
    relatedNeighborhoods: ['rio-rico', 'green-valley', 'sahuarita'],
    relatedGuides: ['buying-home-noncitizen-arizona', 'first-time-buyer-guide', 'understanding-home-valuation'],
    metaDescription: {
      en: "Nogales AZ real estate — border community expertise, binational market insights, and guidance from Kasandra Prieto.",
      es: "Bienes raíces en Nogales AZ — experiencia en comunidad fronteriza e información del mercado binacional."
    }
  },
  {
    slug: 'red-rock',
    name: 'Red Rock',
    nameEs: 'Red Rock',
    regionGroup: 'north',
    primaryZip: '85145',
    heroTagline: {
      en: "Off-grid potential, desert serenity, and the last frontier northwest of Tucson.",
      es: "Potencial fuera de la red, serenidad del desierto y la última frontera al noroeste de Tucson."
    },
    sellerProfile: {
      en: "Red Rock sellers own what most of the market doesn't have — raw land, minimal restrictions, and true rural character. Your buyer is specifically seeking off-grid potential, homesteading opportunity, or maximum privacy. Standard marketing doesn't reach this audience; work with an agent who knows the land buyer pool. Highlight water access, solar potential, and road conditions honestly.",
      es: "Los vendedores de Red Rock poseen lo que la mayoría del mercado no tiene — terreno crudo, restricciones mínimas y verdadero carácter rural. Tu comprador busca específicamente potencial fuera de la red."
    },
    buyerProfile: {
      en: "Red Rock attracts buyers who want out — out of HOAs, out of neighbors, out of conventional subdivision living. Expect unimproved land, well-dependent water, and unpaved roads. This is not a commuter suburb; central Tucson is 45+ minutes away. If you're building off-grid, homesteading, or want maximum acreage for minimum dollars, Red Rock delivers.",
      es: "Red Rock atrae a compradores que quieren salir — de HOAs, de vecinos, de la vida convencional de subdivisión. Espera terreno sin mejorar, agua dependiente de pozo y caminos sin pavimentar."
    },
    relatedNeighborhoods: ['marana', 'picture-rocks', 'catalina'],
    relatedGuides: ['understanding-home-valuation', 'cash-offer-guide', 'sell-or-rent-tucson'],
    metaDescription: {
      en: "Red Rock AZ real estate — rural land, off-grid properties, and expert guidance from Kasandra Prieto.",
      es: "Bienes raíces en Red Rock AZ — terreno rural, propiedades fuera de la red y orientación experta."
    }
  },
  {
    slug: 'picture-rocks',
    name: 'Picture Rocks',
    nameEs: 'Picture Rocks',
    regionGroup: 'north',
    primaryZip: '85743',
    heroTagline: {
      en: "Saguaro National Park next door — rural Tucson living at an attainable price.",
      es: "Parque Nacional Saguaro al lado — vida rural de Tucson a un precio alcanzable."
    },
    sellerProfile: {
      en: "Picture Rocks sellers offer what suburban Tucson can't — immediate National Park access, dark skies, and rural character at prices 30-40% below comparable acreage elsewhere. Your buyer is outdoor-focused, values privacy over convenience, and often works remotely or has flexible commute requirements. Highlight the lifestyle, not just the property.",
      es: "Los vendedores de Picture Rocks ofrecen lo que el Tucson suburbano no puede — acceso inmediato al Parque Nacional, cielos oscuros y carácter rural a precios 30-40% menores."
    },
    buyerProfile: {
      en: "Picture Rocks is the accessible version of rural Tucson living — closer to town than Red Rock or Catalina, but still delivers acreage, wildlife, and quiet. Saguaro National Park West is your backyard. Commute to central Tucson runs 25-35 minutes. Some properties are on well/septic; verify before assuming city services. Entry-level acreage is more attainable here than anywhere else this close to town.",
      es: "Picture Rocks es la versión accesible de la vida rural de Tucson — más cerca del pueblo que Red Rock o Catalina, pero aún ofrece terreno, vida silvestre y tranquilidad."
    },
    relatedNeighborhoods: ['marana', 'red-rock', 'tucson'],
    relatedGuides: ['first-time-buyer-guide', 'understanding-home-valuation', 'relocating-to-tucson'],
    metaDescription: {
      en: "Picture Rocks AZ real estate — Saguaro National Park access, affordable acreage, and expert guidance from Kasandra Prieto.",
      es: "Bienes raíces en Picture Rocks AZ — acceso al Parque Nacional Saguaro, terreno asequible y orientación experta."
    }
  }
];

export function getNeighborhoodBySlug(slug: string): NeighborhoodEntry | undefined {
  return NEIGHBORHOOD_REGISTRY.find(n => n.slug === slug);
}

export function getNeighborhoodsByRegion(region: RegionGroup): NeighborhoodEntry[] {
  return NEIGHBORHOOD_REGISTRY.filter(n => n.regionGroup === region);
}

export function getAllNeighborhoodSlugs(): string[] {
  return NEIGHBORHOOD_REGISTRY.map(n => n.slug);
}

export function getNeighborhoodByZip(zip: string): NeighborhoodEntry | undefined {
  return NEIGHBORHOOD_REGISTRY.find(n => n.primaryZip === zip);
}
