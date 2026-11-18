import { ShieldCheck, Lock, Eye, ArrowLeft } from 'lucide-react';
import { navigate, PATHS } from '@/lib/router';

export function PrivacyPage() {
  return (
    <div className="pt-[calc(var(--header-h)+2rem)] pb-20">
      <div className="container-page max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(PATHS.home)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>

        <div className="mt-6 rounded-3xl border border-ink-100 bg-white p-6 sm:p-10 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand-700">
                Jagatpati Vigneshwara LSD LLP
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-ink-950">
                Privacy Policy
              </h1>
            </div>
          </div>

          <p className="mt-4 text-xs text-ink-500">
            Last Updated: November 2026 · Registered Office: 4-D, 4th Floor, Vardan Tower, Lakudi Talav, Navrangpura, Ahmedabad 380009.
          </p>

          <div className="mt-8 space-y-6 text-sm text-ink-700 leading-relaxed border-t border-ink-100 pt-6">
            <section>
              <h2 className="font-display text-lg font-bold text-ink-900">1. Commitment to Customer Privacy</h2>
              <p className="mt-2">
                At Jagatpati Vigneshwara LSD LLP (JVLSD), protecting the personal information and household privacy of our customers, members, and partners is fundamental to our trust-first philosophy. We do not sell, rent, or trade your personal data to third-party ad networks.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-ink-900">2. Information We Collect</h2>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-ink-600">
                <li><strong>Customer Details:</strong> Name, 10-digit mobile number, email address, and preferred vernacular language.</li>
                <li><strong>Household &amp; Address Information:</strong> House/flat number, society name, landmark, postal PIN code, and Government of India DIGIPIN to ensure accurate doorstep delivery without third-party GPS tracking inaccuracies.</li>
                <li><strong>Household Preferences:</strong> Advance kitchen produce selections, subscription cycles, and survey submissions.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-ink-900">3. Purpose and Use of Data</h2>
              <p className="mt-2">
                Your data is collected strictly to fulfill farm-fresh deliveries, maintain household ledger transparency (wallet balances, promotional discounts, loyalty points), and enable family group consensus on daily orders.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-ink-900">4. Data Security &amp; Access Controls</h2>
              <p className="mt-2">
                All customer records are secured through industry-standard encryption and strict Firestore document access controls. Customers can only read and update their own profiles and household groups.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-ink-900">5. Contact Grievance Officer</h2>
              <p className="mt-2">
                For queries regarding your personal data or privacy rights, please write to: <a href="mailto:contact@jvlsd.in" className="text-brand-700 underline font-semibold">contact@jvlsd.in</a> or visit our registered office at Vardan Tower, Navrangpura, Ahmedabad.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

