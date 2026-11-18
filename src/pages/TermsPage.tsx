import { Scale, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { navigate, PATHS } from '@/lib/router';

export function TermsPage() {
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
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-50 text-gold-700">
              <Scale className="h-6 w-6" />
            </span>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-gold-800">
                Jagatpati Vigneshwara LSD LLP
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-ink-950">
                Terms of Service
              </h1>
            </div>
          </div>

          <p className="mt-4 text-xs text-ink-500">
            Effective Date: November 2026 · Governing Jurisdiction: Ahmedabad, Gujarat, India.
          </p>

          <div className="mt-8 space-y-6 text-sm text-ink-700 leading-relaxed border-t border-ink-100 pt-6">
            <section>
              <h2 className="font-display text-lg font-bold text-ink-900">1. Acceptance of Terms</h2>
              <p className="mt-2">
                By registering an account, placing pre-orders, subscribing, or participating in the family hub with Jagatpati Vigneshwara LSD LLP ("JVLSD", "Company"), you agree to abide by these Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-ink-900">2. Service Scope &amp; Fulfillment</h2>
              <p className="mt-2">
                JVLSD operates the Fresh Daily (JVLSD-FD) delivery framework as a franchisee of Shakhwala. Deliveries are categorized as:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-ink-600">
                <li><strong>Next-Day Pre-Order:</strong> Scheduled farm procurement to reduce kitchen waste; delivered early morning.</li>
                <li><strong>Same-Day Dispatch:</strong> Restricted strictly within a 3-kilometer radius of the Navrangpura operational hub.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-ink-900">3. Wallet, Subscriptions &amp; Discounts</h2>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-ink-600">
                <li>Prepaid wallet reloads require a minimum of ₹200.</li>
                <li>Monthly subscription counters (₹1,000 plan) grant promotional discounts up to ₹50 per order within a ₹300/15-day limit.</li>
                <li>Loyalty points (1 pt = ₹1) require a minimum qualifying balance of 75 points, redeemable up to 5 points per bill while maintaining a 20-point minimum retention floor.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-ink-900">4. Master Franchisee Royalty Rule</h2>
              <p className="mt-2">
                The Master Franchisee royalty is calculated at exactly ₹1 per active subscribed member per qualifying day with placed orders. Multiple orders on the same calendar day generate only ₹1 in total.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-ink-900">5. Family Group Roles &amp; Doorstep Delivery Locks</h2>
              <p className="mt-2">
                Primary household creators are authorized to assign roles. Domestic staff / maid accounts have their delivery destination strictly locked to the verified household address.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

