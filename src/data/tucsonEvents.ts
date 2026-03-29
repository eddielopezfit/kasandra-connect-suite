/**
 * Tucson Events & Living Data
 * 
 * Curated list of signature Tucson events and lifestyle highlights.
 * Static data — Kasandra or team updates seasonally.
 */

export type EventCategory = 'culture' | 'food' | 'outdoors' | 'family' | 'community';
export type Season = 'winter' | 'spring' | 'summer' | 'fall';

export interface TucsonEvent {
  id: string;
  name: { en: string; es: string };
  month: string;
  season: Season;
  category: EventCategory;
  description: { en: string; es: string };
}

export interface LifestyleHighlight {
  id: string;
  stat: { en: string; es: string };
  detail: { en: string; es: string };
  emoji: string;
}

export interface KasandraPick {
  id: string;
  title: { en: string; es: string };
  blurb: { en: string; es: string };
}

export const SEASON_LABELS: Record<Season, { en: string; es: string }> = {
  winter: { en: 'Winter', es: 'Invierno' },
  spring: { en: 'Spring', es: 'Primavera' },
  summer: { en: 'Summer', es: 'Verano' },
  fall: { en: 'Fall', es: 'Otoño' },
};

export const EVENT_CATEGORY_LABELS: Record<EventCategory, { en: string; es: string }> = {
  culture: { en: 'Culture', es: 'Cultura' },
  food: { en: 'Food', es: 'Gastronomía' },
  outdoors: { en: 'Outdoors', es: 'Actividades al Aire Libre' },
  family: { en: 'Family', es: 'Familia' },
  community: { en: 'Community', es: 'Comunidad' },
};

export const TUCSON_EVENTS: TucsonEvent[] = [
  // WINTER
  {
    id: 'gem-show',
    name: { en: 'Tucson Gem, Mineral & Fossil Showcase', es: 'Feria de Gemas, Minerales y Fósiles de Tucson' },
    month: 'January–February',
    season: 'winter',
    category: 'culture',
    description: {
      en: 'The world\'s largest gem and mineral show transforms Tucson into a global marketplace. Over 40 venues across the city for two weeks.',
      es: 'La feria de gemas y minerales más grande del mundo transforma Tucson en un mercado global. Más de 40 sedes por toda la ciudad durante dos semanas.',
    },
  },
  {
    id: 'la-fiesta-vaqueros',
    name: { en: 'La Fiesta de los Vaqueros (Tucson Rodeo)', es: 'La Fiesta de los Vaqueros (Rodeo de Tucson)' },
    month: 'February',
    season: 'winter',
    category: 'culture',
    description: {
      en: "Tucson's iconic rodeo since 1925 — parade, rodeo competitions, and western heritage celebration. Schools even get a day off.",
      es: 'El icónico rodeo de Tucson desde 1925 — desfile, competencias de rodeo y celebración de herencia occidental. Hasta las escuelas tienen día libre.',
    },
  },
  // SPRING
  {
    id: 'fourth-ave-spring',
    name: { en: '4th Avenue Street Fair', es: 'Feria de la Cuarta Avenida' },
    month: 'March',
    season: 'spring',
    category: 'community',
    description: {
      en: "One of Tucson's longest-running traditions — 400+ artisan vendors, live music, and food from around the world on 4th Avenue.",
      es: 'Una de las tradiciones más antiguas de Tucson — más de 400 vendedores artesanales, música en vivo y comida de todo el mundo en la 4ta Avenida.',
    },
  },
  {
    id: 'tucson-festival-books',
    name: { en: 'Tucson Festival of Books', es: 'Festival del Libro de Tucson' },
    month: 'March',
    season: 'spring',
    category: 'family',
    description: {
      en: 'One of the largest book festivals in the U.S., held at the University of Arizona. Free admission, author panels, and 100,000+ attendees.',
      es: 'Uno de los festivales de libros más grandes de EE.UU., en la Universidad de Arizona. Entrada gratuita, paneles de autores y más de 100,000 asistentes.',
    },
  },
  // SUMMER
  {
    id: 'monsoon-season',
    name: { en: 'Monsoon Season', es: 'Temporada de Monzones' },
    month: 'July–September',
    season: 'summer',
    category: 'outdoors',
    description: {
      en: "Tucson's dramatic summer storms bring spectacular lightning shows, desert blooms, and refreshing evening rain. A uniquely Sonoran experience.",
      es: 'Las dramáticas tormentas de verano de Tucson traen espectáculos de relámpagos, flores del desierto y lluvia refrescante. Una experiencia del Sonora única.',
    },
  },
  {
    id: 'independence-day',
    name: { en: '4th of July at "A" Mountain', es: '4 de Julio en la Montaña "A"' },
    month: 'July',
    season: 'summer',
    category: 'family',
    description: {
      en: "Fireworks over Sentinel Peak with the entire Tucson skyline as backdrop. Families gather across the city for this annual celebration.",
      es: 'Fuegos artificiales sobre Sentinel Peak con todo el horizonte de Tucson como fondo. Las familias se reúnen para esta celebración anual.',
    },
  },
  // FALL
  {
    id: 'tucson-meet-yourself',
    name: { en: 'Tucson Meet Yourself', es: 'Tucson Meet Yourself' },
    month: 'October',
    season: 'fall',
    category: 'food',
    description: {
      en: "The ultimate Tucson food festival celebrating the city's UNESCO City of Gastronomy status. Over 100 food vendors representing 30+ cultures.",
      es: 'El festival de comida definitivo celebrando el estatus de Tucson como Ciudad de la Gastronomía UNESCO. Más de 100 vendedores de 30+ culturas.',
    },
  },
  {
    id: 'dia-muertos',
    name: { en: 'Día de los Muertos / All Souls Procession', es: 'Día de los Muertos / Procesión de Todas las Almas' },
    month: 'November',
    season: 'fall',
    category: 'culture',
    description: {
      en: "Tucson's All Souls Procession is one of the largest Día de los Muertos celebrations in the U.S. — a moving community art experience honoring loved ones.",
      es: 'La Procesión de Todas las Almas de Tucson es una de las celebraciones de Día de los Muertos más grandes de EE.UU. — una experiencia comunitaria honrando a los seres queridos.',
    },
  },
  {
    id: 'fourth-ave-fall',
    name: { en: '4th Avenue Street Fair (Fall)', es: 'Feria de la Cuarta Avenida (Otoño)' },
    month: 'December',
    season: 'fall',
    category: 'community',
    description: {
      en: 'The fall edition of this beloved street fair, perfect for holiday shopping with handmade gifts and local art.',
      es: 'La edición de otoño de esta querida feria callejera, perfecta para compras navideñas con regalos hechos a mano y arte local.',
    },
  },
  {
    id: 'el-tour-tucson',
    name: { en: 'El Tour de Tucson', es: 'El Tour de Tucson' },
    month: 'November',
    season: 'fall',
    category: 'outdoors',
    description: {
      en: "One of America's largest perimeter cycling events — riders of all levels circling the city through beautiful desert landscapes.",
      es: 'Uno de los eventos de ciclismo perimetral más grandes de América — ciclistas de todos los niveles recorriendo la ciudad por hermosos paisajes del desierto.',
    },
  },
];

export const LIFESTYLE_HIGHLIGHTS: LifestyleHighlight[] = [
  {
    id: 'sunshine',
    stat: { en: '350+ Days of Sunshine', es: '350+ Días de Sol' },
    detail: { en: 'More sunny days than almost anywhere in the U.S.', es: 'Más días soleados que casi cualquier lugar en EE.UU.' },
    emoji: '☀️',
  },
  {
    id: 'gastronomy',
    stat: { en: 'UNESCO City of Gastronomy', es: 'Ciudad Gastronómica UNESCO' },
    detail: { en: 'The first U.S. city to earn this designation — 4,000+ years of food culture.', es: 'La primera ciudad de EE.UU. en recibir esta distinción — 4,000+ años de cultura gastronómica.' },
    emoji: '🌮',
  },
  {
    id: 'cost',
    stat: { en: '30% Lower Than Phoenix', es: '30% Más Bajo que Phoenix' },
    detail: { en: 'Tucson offers desert living at a fraction of Phoenix or California prices.', es: 'Tucson ofrece vida en el desierto a una fracción de los precios de Phoenix o California.' },
    emoji: '💰',
  },
  {
    id: 'outdoor',
    stat: { en: '5 Mountain Ranges', es: '5 Cadenas Montañosas' },
    detail: { en: 'Surrounded by the Santa Catalinas, Rincons, Tucson Mtns, Santa Ritas, and Tortolitas.', es: 'Rodeada por las Santa Catalinas, Rincons, Tucson Mtns, Santa Ritas y Tortolitas.' },
    emoji: '🏔️',
  },
  {
    id: 'bilingual',
    stat: { en: 'Bilingual Community', es: 'Comunidad Bilingüe' },
    detail: { en: '43% of Pima County residents speak Spanish — you\'ll always find someone who understands.', es: '43% de los residentes del condado Pima hablan español — siempre encontrarás a alguien que entiende.' },
    emoji: '🗣️',
  },
  {
    id: 'culture',
    stat: { en: 'Rich Cultural Heritage', es: 'Rica Herencia Cultural' },
    detail: { en: 'From the Tohono O\'odham Nation to Mexican-American traditions, Tucson\'s identity is uniquely multicultural.', es: 'Desde la Nación Tohono O\'odham hasta tradiciones mexicoamericanas, la identidad de Tucson es multicultural.' },
    emoji: '🎨',
  },
];

export const KASANDRA_PICKS: KasandraPick[] = [
  {
    id: 'pick-sunsets',
    title: { en: 'The Sunsets Here Are Real', es: 'Los Atardeceres Aquí Son Reales' },
    blurb: {
      en: "I've lived here over 20 years and the sunsets still stop me in my tracks. Gates Pass at golden hour is my favorite spot — and it's free.",
      es: 'He vivido aquí más de 20 años y los atardeceres todavía me detienen. Gates Pass a la hora dorada es mi lugar favorito — y es gratis.',
    },
  },
  {
    id: 'pick-food',
    title: { en: 'The Food Scene Is Underrated', es: 'La Escena Gastronómica Está Subestimada' },
    blurb: {
      en: "From Sonoran hot dogs on South 12th to fine dining downtown, Tucson's food culture runs deep. UNESCO didn't give us that designation for nothing.",
      es: 'Desde hot dogs Sonorenses en la calle 12 Sur hasta alta cocina en el centro, la cultura gastronómica de Tucson es profunda. UNESCO no nos dio esa distinción por nada.',
    },
  },
  {
    id: 'pick-community',
    title: { en: 'Small-Town Heart, Big-City Access', es: 'Corazón de Pueblo Pequeño, Acceso de Gran Ciudad' },
    blurb: {
      en: "Tucson still feels like a place where your neighbors know your name. But you also have a major university, an Air Force base, world-class healthcare, and Phoenix is just 90 minutes north.",
      es: 'Tucson todavía se siente como un lugar donde tus vecinos saben tu nombre. Pero también tienes una universidad importante, una base de la Fuerza Aérea, atención médica de clase mundial y Phoenix a solo 90 minutos al norte.',
    },
  },
  {
    id: 'pick-biking',
    title: { en: 'Bike-Friendly Paradise', es: 'Paraíso para Ciclistas' },
    blurb: {
      en: "The Loop — 131 miles of paved, car-free paths circling the city. I bike it with my dog and it never gets old. Tucson was named a Bicycle-Friendly Community for a reason.",
      es: 'The Loop — 131 millas de senderos pavimentados sin autos rodeando la ciudad. Lo recorro en bici con mi perro y nunca me canso. Tucson fue nombrada Comunidad Amigable con las Bicicletas por una razón.',
    },
  },
];
