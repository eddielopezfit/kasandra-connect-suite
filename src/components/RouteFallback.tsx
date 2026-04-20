/**
 * RouteFallback — Chrome-matching skeleton shown during lazy route loads.
 * Mirrors the V2Navigation height (compliance strip + nav bar) and a hero
 * shape so navigation never looks like a layout error.
 */
const RouteFallback = () => (
  <div className="min-h-screen bg-cc-ivory">
    {/* Compliance strip placeholder (matches h-9/md:h-10) */}
    <div className="h-9 md:h-10 bg-white border-b border-cc-sand-dark/20" />

    {/* Nav bar placeholder (matches navy nav at top, py-4) */}
    <div className="bg-cc-navy h-[88px] md:h-[96px] flex items-center">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="h-5 w-48 rounded bg-white/10 animate-pulse" />
          <div className="h-3 w-32 rounded bg-white/5 animate-pulse" />
        </div>
        <div className="hidden lg:flex items-center gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 w-12 rounded bg-white/10 animate-pulse" />
          ))}
        </div>
        <div className="hidden lg:block h-9 w-40 rounded-full bg-cc-gold/30 animate-pulse" />
      </div>
    </div>

    {/* Hero placeholder — matches GlassmorphismHero min-h-[85dvh] proportion */}
    <div className="relative min-h-[70dvh] bg-gradient-to-br from-cc-navy via-cc-navy-dark to-cc-navy flex items-center justify-center px-4">
      <div className="container mx-auto max-w-3xl space-y-5">
        <div className="h-4 w-32 rounded-full bg-cc-gold/20 animate-pulse mx-auto" />
        <div className="h-12 md:h-16 w-full rounded-lg bg-white/10 animate-pulse" />
        <div className="h-8 w-3/4 rounded-lg bg-white/5 animate-pulse mx-auto" />
        <div className="space-y-2 max-w-xl mx-auto pt-2">
          <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-white/5 animate-pulse" />
        </div>
        <div className="flex justify-center pt-4">
          <div className="h-12 w-44 rounded-full bg-cc-gold/30 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

export default RouteFallback;
