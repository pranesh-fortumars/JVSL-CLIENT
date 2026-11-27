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
              <h2 className="font-display text-lg font-bold text-ink-900">2. Service Scope, Delivery Charges &amp; Zones</h2>
              <p className="mt-2">
                JVLSD operates the Fresh Daily (JVLSD-FD) delivery framework as an authorized franchisee partner of Shakhwala.com. Delivery fees and zones from the hub are defined as follows:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-ink-600">
                <li><strong>Within 3 km Radius:</strong> ₹0 (Free morning delivery).</li>
                <li><strong>3 km to 10 km Radius:</strong> Standard delivery charge of ₹30.</li>
                <li><strong>Beyond 10 km Radius:</strong> Strictly available only for Bites &amp; beyond dry snack produce. Delivery fee is ₹75 fulfilled directly by our service for a minimum order value of ₹500. Fresh vegetables, fruits, and milk are restricted to within 10 km to guarantee zero-spoilage freshness.</li>
                <li><strong>Same-Day Emergency Dispatch:</strong> Emergency dispatch within local reach (₹125 for orders below ₹500, ₹75 for orders ₹500 and above).</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-ink-900">3. Non-Availability, Undelivered Returns &amp; Cancellation Policy</h2>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-ink-600">
                <li><strong>Doorstep Non-Availability &amp; Return:</strong> In case of customer non-availability, no response to telephone calls, and no instructions left regarding where to deliver (such as next door or security desk), the order is returned to the hub and an immediate status update is dispatched via WhatsApp.</li>
                <li><strong>Strict Non-Cancellable Policy for Cut Vegetables &amp; Fruits:</strong> Orders to be delivered in cut format <u>cannot be cancelled nor amount refunded once placed &amp; paid</u>. This applies strictly to:
                  <ul className="list-circle pl-5 mt-1 space-y-0.5 text-xs text-ink-700">
                    <li><strong>Cut Vegetables:</strong> Tomato, Potato, Onion, Brinjal, Cucumber, Mushroom, Zucchini, Leafy Greens (Palak, Methi, Arbi Leaves), and Avocado.</li>
                    <li><strong>Cut Fruits:</strong> Papaya, Watermelon, Muskmelon, Pomegranate, Apple, Custard Apple, Pineapple, Strawberry, and Banana.</li>
                  </ul>
                  <p className="mt-1 text-[11px] text-ink-500 italic">Reason: Pre-cut fresh produce undergoes rapid oxidation and cell respiration; once prepared to individual specification, it cannot be safely re-routed or preserved.</p>
                </li>
                <li><strong>Zero-Plastic Composite Packaging Mandate:</strong> All produce is packaged in biodegradable, compostable breathable bags and composite containers. Conventional plastic packaging is completely avoided to prevent bacteria buildup, oxidation color change, trapped moisture, bad odour, and altered taste.</li>
                <li><strong>Repeated Incidences &amp; Service Cancellation:</strong> If non-availability without instructions occurs 3 times in any quarter (even continuously) OR 5 times in a year:
                  <ul className="list-circle pl-5 mt-1 space-y-0.5">
                    <li>Next-day pre-order and standing subscription services are subject to cancellation, even after customer confirmation of non-repetition after one year.</li>
                    <li>If the customer wishes to continue service after initial trouble, mandatory penalty delivery charges apply: <strong>₹30 for all deliveries within 3 km</strong> (irrespective of order value) and <strong>₹100 for deliveries between 3 km to 10 km</strong>.</li>
                  </ul>
                </li>
                <li><strong>Order Cancellation &amp; Non-Refundable Delivery Charge:</strong> In the event of standard order cancellation, promotional discount credits are accounted for and deducted from produce refunds. Any delivery charge collected is strictly retained and non-refundable.</li>
                <li><strong>20% Monthly Volume Privilege Discount:</strong> Applies to the first purchase of ₹500 and above each month. Subsequent smaller orders (₹100+) unlock the 20% discount (up to 3 orders monthly).</li>
                <li><strong>Standing Subscriptions (+2% Off):</strong> Scheduled daily/weekly recurring deliveries carry an additional 2% privilege discount with automated OTP delivery verification.</li>
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

