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
                JVLSD operates the Fresh Daily (JVLSD-FD) delivery framework as a franchisee partner of Shakhwala. Deliveries are categorized as:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-ink-600">
                <li><strong>Next-Day Pre-Order:</strong> Scheduled farm procurement to reduce kitchen waste; delivered early morning (8:00 AM – 9:00 AM).</li>
                <li><strong>Same-Day Dispatch:</strong> Emergency dispatch within a 10 km radius as per DIGIPIN (₹125 for orders below ₹500, ₹75 for orders ₹500 and above; strictly within 3 km of Navrangpura Hub).</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-ink-900">3. Wallet, 20% Discount Rules &amp; Cancellation Policy</h2>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-ink-600">
                <li>Prepaid wallet reloads require a minimum of ₹1,000 for the initial load. When your balance reaches ₹300, subsequent top-ups must be at least ₹300.</li>
                <li>A promotional balance of ₹50 is credited to your account upon successful placement of your first qualifying order.</li>
                <li><strong>20% Monthly Volume Privilege Discount:</strong> Applies to all first purchases of ₹500 and above each month. Only after qualifying with an initial ₹500+ order can the 20% discount be availed on smaller purchases (₹100+) any time in the month (limited to under 3 smaller purchases per month).</li>
                <li><strong>Order Cancellation &amp; Non-Refundable Delivery Charge:</strong> In the event of order cancellation, the discount amount is accounted for and deducted from the produce refund. Any delivery charge collected is strictly retained and non-refundable.</li>
                <li><strong>Delivery Incidences &amp; 6-Month Lien Observation:</strong> If deliveries are repeatedly undelivered due to customer non-availability without alternate next-door delivery instructions (≥3 times in a quarter or &gt;5 times in a year), the account is marked "BE CAUTIOUS" and placed under a 6-month lien observation with adjusted delivery charges (₹100 for ≤3 km, ₹150 for 3–10 km). Standard delivery charges are restored if observation concludes satisfactorily.</li>
                <li><strong>Standing Subscriptions (+2% Off):</strong> Scheduled deliveries (Daily, Alternate, Weekly, Bi-Weekly, Monthly) carry an additional 2% discount with flexible pause/resume/extend options and WhatsApp/SMS authentication.</li>
                <li>Loyalty points (1 pt = ₹1) can be redeemed against qualifying grocery deliveries subject to platform redemption ceilings.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-ink-900">4. Multi-Store Franchisee Network &amp; Royalty Model</h2>
              <p className="mt-2">
                Every franchisee store unit functions as an independent Revenue - Cost - Expense - Profit Center. Scaled across multiple pincodes, cities, and states Pan-India, net profits are distributed 60% to JVLSD-FD 1st Unit and 40% to the franchisee operator running the unit. Master Franchisee royalty is accounted at ₹1 per active subscribed member per qualifying day with placed orders.
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

