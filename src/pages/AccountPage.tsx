import { useEffect, useState } from 'react';
import {
  CalendarClock,
  LogOut,
  Loader2,
  Package,
  AlertCircle,
  Wallet,
  Award,
  Sparkles,
  PieChart,
  Users,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { navigate, PATHS } from '@/lib/router';
import { fetchOrders, type OrderRow } from '@/lib/firestoreService';

const STATUS_LABEL: Record<OrderRow['status'], string> = {
  new: 'Received',
  confirmed: 'Confirmed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function AccountPage() {
  const { user, profile, loading, signOut } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'family'>('overview');

  useEffect(() => {
    if (!user) return;
    let active = true;
    setOrdersLoading(true);
    setOrdersError(false);
    fetchOrders(user.uid)
      .then((data) => {
        if (!active) return;
        setOrders(data);
        setOrdersLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setOrdersError(true);
          setOrdersLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center pt-[var(--header-h)]">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-label="Loading" />
      </section>
    );
  }

  if (!user) {
    return (
      <section className="pt-[calc(var(--header-h)+3rem)] pb-24">
        <div className="container-page mx-auto max-w-md text-center">
          <h1 className="section-title">Sign in to see your account</h1>
          <p className="mt-3 text-ink-600">Your orders and details appear here once you are signed in.</p>
          <button onClick={() => navigate(PATHS.login)} className="btn-primary mt-8 px-6 py-3">
            Go to sign in
          </button>
        </div>
      </section>
    );
  }

  const displayName = profile?.full_name || user.email || 'there';

  return (
    <section className="bg-brand-50/50 pb-24 pt-[calc(var(--header-h)+3rem)]">
      <div className="container-page">
        {/* Header with User Info & Sign Out */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Customer Hub &amp; Family Dashboard</p>
            <h1 className="section-title mt-3 uppercase tracking-wide">Hello, {displayName}</h1>
            <p className="mt-2 text-ink-600 font-mono text-sm">{user.email}</p>
          </div>
          <button
            onClick={() => { void signOut(); }}
            className="btn-outline self-start px-5 py-2.5"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex gap-2 border-b border-ink-200 pb-2">
          {[
            { id: 'overview', label: 'Financial & Spend Graphs', icon: PieChart },
            { id: 'orders', label: 'Order History', icon: Package },
            { id: 'family', label: 'Family Hub & Permissions', icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-800 text-white shadow-soft'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
              }`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Financial & Visual Spend Dashboard */}
        {activeTab === 'overview' && (
          <div className="mt-8 space-y-6">
            {/* Wallet & LSD Discount Counters */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Prepaid Wallet</span>
                  <Wallet className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="mt-3 font-display text-3xl font-extrabold text-ink-950">₹1,000</p>
                <p className="mt-1 text-xs text-ink-500">Min. reload ₹200 · Instant default refunds</p>
              </div>

              <div className="rounded-3xl border border-gold-300 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-800">LSD Promo Discount</span>
                  <Sparkles className="h-5 w-5 text-gold-600" />
                </div>
                <p className="mt-3 font-display text-3xl font-extrabold text-ink-950">₹300</p>
                <p className="mt-1 text-xs text-ink-500">Reusable ₹50/order · 15-day validity</p>
              </div>

              <div className="rounded-3xl border border-brand-200 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-800">Loyalty Balance</span>
                  <Award className="h-5 w-5 text-brand-600" />
                </div>
                <p className="mt-3 font-display text-3xl font-extrabold text-ink-950">85 pts</p>
                <p className="mt-1 text-xs text-ink-500">1 pt = ₹1 · Redeemable (Min 20 floor)</p>
              </div>
            </div>

            {/* Rollover Safeguard Alert */}
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <p className="font-bold">Year-End Rollover Safeguard Alert</p>
                <p className="mt-0.5">
                  Up to 100 loyalty points automatically rollover to next year. Utilize remaining promotional balances before the transfer deadline to safeguard your savings.
                </p>
              </div>
            </div>

            {/* Graphical Spend & Category Allocation Breakdown */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
                <h3 className="flex items-center gap-2 font-display text-base font-bold text-ink-900">
                  <TrendingUp className="h-4 w-4 text-brand-600" /> Produce Category Spend Ratio
                </h3>
                <p className="mt-1 text-xs text-ink-500">Visual allocation of your household kitchen orders.</p>

                {/* Visual Bar / Ratio Indicator */}
                <div className="mt-6">
                  <div className="flex h-5 w-full overflow-hidden rounded-full bg-ink-100">
                    <div style={{ width: '55%' }} className="bg-emerald-600" title="Fresh Vegetables 55%" />
                    <div style={{ width: '25%' }} className="bg-amber-500" title="Seasonal Fruits 25%" />
                    <div style={{ width: '20%' }} className="bg-sky-500" title="Pure Farm Milk 20%" />
                  </div>
                  <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Vegetables (55%)
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-amber-800">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Fruits (25%)
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-sky-800">
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Milk (20%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
                <h3 className="flex items-center gap-2 font-display text-base font-bold text-ink-900">
                  <ShieldCheck className="h-4 w-4 text-brand-600" /> Monthly Kitchen Waste Prevention
                </h3>
                <p className="mt-1 text-xs text-ink-500">Calculated based on your next-day pre-order consistency.</p>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="font-display text-4xl font-black text-brand-700">92%</span>
                  <span className="text-xs font-semibold text-emerald-700">Procurement Accuracy</span>
                </div>
                <p className="mt-2 text-xs text-ink-600 leading-relaxed">
                  By pre-ordering for morning dispatch, you helped reduce retail spoilage by ~4.8 kg this month.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === 'orders' && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-ink-900">Your orders</h2>

            {ordersLoading && (
              <div className="mt-6 flex items-center gap-2 text-ink-600">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading your orders…
              </div>
            )}

            {!ordersLoading && ordersError && (
              <p className="mt-6 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                <AlertCircle className="h-4 w-4" /> We could not load your orders. Please refresh and try again.
              </p>
            )}

            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div className="card mt-6 flex flex-col items-center p-10 text-center">
                <Package className="h-10 w-10 text-brand-400" />
                <p className="mt-4 font-semibold text-ink-900">No orders yet</p>
                <p className="mt-1 text-sm text-ink-600">Orders you place while signed in will show up here.</p>
                <button onClick={() => navigate(PATHS.order)} className="btn-primary mt-6 px-5 py-2.5">
                  Order Fresh Daily
                </button>
              </div>
            )}

            {!ordersLoading && !ordersError && orders.length > 0 && (
              <ul className="mt-6 space-y-4">
                {orders.map((order) => (
                  <li key={order.id} className="card p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-ink-900">
                        {order.mode === 'same_day' ? 'Same-day order' : 'Next-day pre-order'}
                      </p>
                      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
                        {STATUS_LABEL[order.status]}
                      </span>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-600">
                      <CalendarClock className="h-4 w-4" />
                      Delivery {formatDate(order.expected_delivery)} · {order.items.length} item{order.items.length === 1 ? '' : 's'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Tab 3: Family Group & Shared Address Permissions */}
        {activeTab === 'family' && (
          <div className="mt-8 rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-ink-950">Connected Family Hub</h3>
                <p className="mt-1 text-xs sm:text-sm text-ink-600">
                  Allow family members or domestic help/maid to order directly to your verified address.
                </p>
              </div>
              <button
                type="button"
                className="btn-primary px-4 py-2 text-xs"
              >
                + Add Member
              </button>
            </div>

            <div className="mt-6 divide-y divide-ink-100">
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-sm font-bold text-ink-900">Primary Account Holder (You)</p>
                  <p className="text-xs text-ink-500">Full Access · Master Billing &amp; Subscriptions</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                  Owner
                </span>
              </div>
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-sm font-bold text-ink-900">Maid / Domestic Staff Ordering Role</p>
                  <p className="text-xs text-ink-500">Permission: Locked strictly to Primary Registered Doorstep Address</p>
                </div>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-800">
                  Restricted Order
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
