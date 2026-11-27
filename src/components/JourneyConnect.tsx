import { Check, Sparkles, Heart } from 'lucide-react';

interface JourneyConnectProps {
  className?: string;
  compact?: boolean;
}

export function JourneyConnect({ className = '', compact = false }: JourneyConnectProps) {
  const highlights = [
    {
      title: '100% Sustainable & Eco-Friendly Approach',
      desc: 'Zero-plastic biodegradable packaging approach protecting our natural environment.',
    },
    {
      title: 'Locally Sourced, Ethically Harvested',
      desc: 'Direct farm harvests from verified regional growers with fair grower compensation.',
    },
    {
      title: 'Zero Produce Wastage & Kitchen Finance Loss',
      desc: 'Advance planned pre-ordering prevents kitchen spoilage and eliminates household financial loss.',
    },
    {
      title: 'Heart-Driven & Thoughtfully Crafted for Every Household',
      desc: 'Dedicated to women, homemakers, elders & chefs who navigate daily kitchen hardships.',
    },
  ];

  return (
    <section className={`overflow-hidden rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 via-white to-amber-50/70 p-6 sm:p-10 shadow-lift ${className}`}>
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-soft">
            <Heart className="h-4 w-4 fill-white" />
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-900">
            JVLSD · Our Purpose &amp; Journey Connect
          </span>
        </div>

        <h3 className="mt-4 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink-950 tracking-tight leading-snug">
          Why JVLSD Fresh Daily?
        </h3>

        {/* Checkmark Highlights from reference */}
        <div className="mt-6 space-y-3.5">
          {highlights.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 text-ink-800">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-ink-950 text-white shadow-xs">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </span>
              <div>
                <p className="text-sm sm:text-base font-bold text-ink-950 leading-tight">
                  {item.title}
                </p>
                {!compact && (
                  <p className="text-xs text-ink-600 mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-7 text-sm sm:text-base text-ink-700 font-medium">
          From everyday morning essentials to peaceful family meals, our mission is simple:
        </p>

        {/* Highlighting Mission Card (soft light green pill container exactly like reference) */}
        <div className="mt-4 rounded-3xl border border-emerald-300 bg-[#e8f5e9] p-6 sm:p-8 text-forest-950 shadow-soft">
          <p className="font-display text-base sm:text-xl font-bold leading-relaxed text-[#1b5e20] italic">
            "To help you celebrate everyday life with purposeful farm essentials that carry a story of dignity, honest weights, and a sustainable, zero-plastic promise."
          </p>
        </div>

        {/* Heartfelt signoff from reference */}
        <div className="mt-8 pt-6 border-t border-emerald-100 text-ink-700 space-y-3">
          <p className="text-sm sm:text-base font-bold text-ink-900">
            Thank you for being part of our journey.
          </p>
          <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
            Together, let’s make the world a little greener, healthier, and more peaceful — one mindful kitchen choice at a time.
          </p>
        </div>
      </div>
    </section>
  );
}
