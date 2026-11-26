import { Phone, Mail, MapPin, Sprout, Leaf, Milk } from 'lucide-react';
import { Wordmark } from './Logo';
import { navigate, PATHS } from '@/lib/router';
import { COMPANY_CONFIG } from '@/data/companyConfig';

export function Footer() {
  return (
    <footer className="bg-ink-950 text-ink-200">
      <div className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="inline-block py-1">
              <Wordmark dark />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-ink-300 max-w-xs">
              Jagatpati Vigneshwara LSD LLP — building a trusted network of fresh,
              everyday essentials delivered with care through Shakhwala.
            </p>
            <div className="mt-6 flex gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-gold-300" aria-hidden>
                <Leaf className="h-4 w-4" />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-gold-300" aria-hidden>
                <Sprout className="h-4 w-4" />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-gold-300" aria-hidden>
                <Milk className="h-4 w-4" />
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">Explore</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                { label: 'Home', path: PATHS.home },
                { label: 'About JVLSD', path: PATHS.about },
                { label: 'Shakhwala', path: PATHS.shakhwala },
                { label: 'Fresh Daily', path: PATHS.freshDaily },
                { label: 'Bites & Beyond', path: PATHS.bites },
                { label: 'Survey', path: PATHS.survey },
                { label: 'Order Now', path: PATHS.order },
                { label: 'Contact', path: PATHS.contact },
              ].map((l) => (
                <li key={l.path}>
                  <button
                    onClick={() => navigate(l.path)}
                    className="text-ink-300 hover:text-white transition-colors"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">Fresh Daily</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-300">
              <li>Fresh vegetables</li>
              <li>Seasonal fruits</li>
              <li>Farm milk</li>
              <li>Next-day pre-order</li>
              <li>Same-day delivery (within 3 km)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">Registered Office</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-gold-300 shrink-0" />
                <span className="text-ink-300 leading-relaxed text-xs">
                  <strong className="text-white font-semibold">{COMPANY_CONFIG.legalName}</strong><br />
                  {COMPANY_CONFIG.registeredOffice.fullFormatted}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gold-300 shrink-0" />
                <div className="flex flex-col text-xs text-ink-300 font-mono">
                  {COMPANY_CONFIG.phones.allFormatted.map((ph, idx) => (
                    <a key={idx} href={`tel:${ph.replace(/\D/g, '')}`} className="hover:text-white transition-colors">
                      {ph}
                    </a>
                  ))}
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gold-300 shrink-0" />
                <a href={`mailto:${COMPANY_CONFIG.emails.official}`} className="text-ink-300 hover:text-white transition-colors text-xs font-mono">
                  {COMPANY_CONFIG.emails.official}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Jagatpati Vigneshwara LSD LLP. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <button onClick={() => navigate(PATHS.privacy)} className="hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => navigate(PATHS.terms)} className="hover:text-white transition-colors">Terms of Service</button>
            <button onClick={() => navigate(PATHS.privacy)} className="hover:text-white transition-colors">Cookie Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
