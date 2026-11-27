import { Phone, Mail, MapPin, Sprout, Leaf, Milk, ShieldCheck, Award } from 'lucide-react';
import { Wordmark, JvlsdAuthenticitySeal } from './Logo';
import { navigate, PATHS } from '@/lib/router';
import { COMPANY_CONFIG } from '@/data/companyConfig';

export function Footer() {
  return (
    <footer className="bg-ink-950 text-ink-200">
      {/* Top Banner: Sustainability and Franchisee Clarity */}
      <div className="border-b border-white/10 bg-gradient-to-r from-emerald-950 via-forest-950 to-ink-950 py-4 px-4">
        <div className="container-page flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold text-center md:text-left">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
              🌱
            </span>
            <span>{COMPANY_CONFIG.sustainabilityStatement}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-400/10 px-3 py-1 text-[11px] font-bold text-gold-300 border border-gold-400/25 shrink-0">
            <span>🤝</span>
            <span>{COMPANY_CONFIG.franchiseeClarification}</span>
          </div>
        </div>
      </div>

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

            {/* JVLSD Authenticity Seal in Footer */}
            <div className="mt-6">
              <JvlsdAuthenticitySeal compact />
            </div>

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

            {/* Certifications & Regulatory compliance display */}
            <div className="mt-6 rounded-2xl bg-white/5 p-3.5 border border-white/10 text-xs space-y-1.5">
              <p className="font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5" /> Compliance &amp; Certifications
              </p>
              <p className="text-[11px] text-ink-300 font-mono">{COMPANY_CONFIG.certifications.cinLlp}</p>
              <p className="text-[11px] text-ink-300 font-mono">{COMPANY_CONFIG.certifications.fssaiLicense}</p>
              <p className="text-[11px] text-ink-300 font-mono">{COMPANY_CONFIG.certifications.gstin}</p>
              <p className="text-[11px] text-emerald-400 text-[10px]">{COMPANY_CONFIG.certifications.organicTrustNote}</p>
            </div>
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
          <p>© {new Date().getFullYear()} Jagatpati Vigneshwara LSD LLP (JVLSD). All rights reserved. Authorized Franchisee of Shakhwala.com</p>
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
