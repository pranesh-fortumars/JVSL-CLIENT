import { useEffect, useState, useMemo } from 'react';
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
  RotateCw,
  HeartHandshake,
  DollarSign,
  PlusCircle,
  CheckCircle,
  XCircle,
  MessageCircle,
  HelpCircle,
  Calendar,
  RotateCcw,
  Star,
  X,
  Home,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { navigate, PATHS } from '@/lib/router';
import {
  fetchOrders,
  submitOrderFeedback,
  createFamilyGroup,
  joinFamilyGroupByCode,
  fetchFamilyGroup,
  fetchFamilyExpenseProposals,
  saveFamilyExpenseProposal,
  updateFamilyExpenseStatus,
  type OrderRow,
  type OrderFeedback,
  type FamilyGroup,
  type UserAddress,
  type FamilyExpenseProposal,
} from '@/lib/firestoreService';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'family' | 'finance'>('overview');

  // Customer order history datewise / monthwise / yearwise filter
  const [historyScope, setHistoryScope] = useState<'all' | 'specific_date' | 'month' | 'year'>('all');
  const [filterDate, setFilterDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [filterMonth, setFilterMonth] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [filterYear, setFilterYear] = useState<string>(() => String(new Date().getFullYear()));

  // Delivery & Produce feedback state
  const [feedbackOrder, setFeedbackOrder] = useState<OrderRow | null>(null);
  const [fbProduceFreshness, setFbProduceFreshness] = useState<number>(5);
  const [fbServiceRating, setFbServiceRating] = useState<number>(5);
  const [fbDeliveryPunctuality, setFbDeliveryPunctuality] = useState<number>(5);
  const [fbPackaging, setFbPackaging] = useState<number>(5);
  const [fbComment, setFbComment] = useState<string>('');
  const [fbSubmitting, setFbSubmitting] = useState<boolean>(false);
  const [fbSubmittedOrders, setFbSubmittedOrders] = useState<Set<string>>(() => new Set());

  // Family Group State (P4 System)
  const [familyGroup, setFamilyGroup] = useState<FamilyGroup | null>(null);
  const [familyLoading, setFamilyLoading] = useState<boolean>(false);
  const [inviteInput, setInviteInput] = useState<string>('');
  const [joinRole, setJoinRole] = useState<'family_member' | 'domestic_help'>('family_member');
  const [createHouseholdName, setCreateHouseholdName] = useState<string>('');
  const [createAddress, setCreateAddress] = useState<string>('');
  const [groupActionNotice, setGroupActionNotice] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);

  useEffect(() => {
    if (!profile?.family_group_id) return;
    setFamilyLoading(true);
    fetchFamilyGroup(profile.family_group_id)
      .then((grp) => setFamilyGroup(grp))
      .finally(() => setFamilyLoading(false));
  }, [profile?.family_group_id]);

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
            <div className="flex items-center gap-3">
              <p className="eyebrow">Customer Hub &amp; Family Dashboard</p>
              {(profile?.role === 'admin' || profile?.role === 'superadmin') && (
                <button
                  type="button"
                  onClick={() => navigate(PATHS.admin)}
                  className="rounded-full bg-gold-500/20 px-3 py-0.5 text-xs font-bold text-gold-800 border border-gold-300 hover:bg-gold-500/30 transition-colors"
                >
                  Go to Admin Dashboard →
                </button>
              )}
            </div>
            <h1 className="section-title mt-3 uppercase tracking-wide">Hello, {displayName}</h1>
            <p className="mt-2 text-ink-600 font-mono text-sm">{user.email}</p>
          </div>
          <div className="flex gap-2 self-start">
            {(profile?.role === 'admin' || profile?.role === 'superadmin') && (
              <button
                onClick={() => navigate(PATHS.admin)}
                className="btn-primary px-4 py-2 text-xs"
              >
                Admin Panel
              </button>
            )}
            <button
              onClick={() => { void signOut(); }}
              className="btn-outline px-5 py-2.5"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex gap-2 border-b border-ink-200 pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Financial & Spend Graphs', icon: PieChart },
            { id: 'orders', label: 'Order History', icon: Package },
            { id: 'family', label: 'Family Hub & Permissions', icon: Users },
            { id: 'finance', label: 'Family Income & Expense Dialogue', icon: HeartHandshake },
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink-900">Your Fresh Daily Orders</h2>
                <p className="text-xs text-ink-500">Filter past grocery &amp; milk morning delivery baskets by date, month, or year.</p>
              </div>

              {/* Date / Month / Year Filters for Orders */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg bg-ink-100 p-0.5 text-xs">
                  {(
                    [
                      { id: 'all', label: 'All Orders' },
                      { id: 'specific_date', label: 'Date' },
                      { id: 'month', label: 'Month' },
                      { id: 'year', label: 'Year' },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setHistoryScope(m.id)}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                        historyScope === m.id
                          ? 'bg-white text-brand-800 shadow-soft'
                          : 'text-ink-600 hover:text-ink-900'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {historyScope === 'specific_date' && (
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-xs font-medium text-ink-800"
                  />
                )}

                {historyScope === 'month' && (
                  <input
                    type="month"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-xs font-medium text-ink-800"
                  />
                )}

                {historyScope === 'year' && (
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-xs font-medium text-ink-800"
                  >
                    {[2027, 2026, 2025, 2024].map((yr) => (
                      <option key={yr} value={String(yr)}>{yr}</option>
                    ))}
                  </select>
                )}

                {historyScope !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setHistoryScope('all')}
                    className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2 py-1 text-xs font-medium text-ink-600 hover:bg-ink-100"
                  >
                    <RotateCcw className="h-3 w-3" /> Reset
                  </button>
                )}
              </div>
            </div>

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

            {!ordersLoading && !ordersError && orders.length > 0 && (() => {
              const displayOrders = orders.filter((o) => {
                const target = o.expected_delivery || o.created_at?.slice(0, 10) || '';
                if (historyScope === 'specific_date' && filterDate) {
                  return target.startsWith(filterDate);
                }
                if (historyScope === 'month' && filterMonth) {
                  return target.startsWith(filterMonth);
                }
                if (historyScope === 'year' && filterYear) {
                  return target.startsWith(filterYear);
                }
                return true;
              });

              if (displayOrders.length === 0) {
                return (
                  <div className="card mt-6 p-8 text-center text-ink-500">
                    <p className="text-sm">No orders found for the selected time period.</p>
                    <button
                      type="button"
                      onClick={() => setHistoryScope('all')}
                      className="mt-3 text-xs font-bold text-brand-700 underline"
                    >
                      Show all orders
                    </button>
                  </div>
                );
              }

              return (
                <ul className="mt-6 space-y-4">
                  {displayOrders.map((order) => (
                    <li key={order.id} className="card p-5 sm:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-ink-900">
                          {order.mode === 'same_day' ? 'Same-day order' : 'Next-day pre-order'}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
                            {STATUS_LABEL[order.status]}
                          </span>
                          {order.status === 'delivered' && (
                            <button
                              type="button"
                              onClick={() => {
                                setFeedbackOrder(order);
                                setFbProduceFreshness(order.feedback?.item_quality_rating || 5);
                                setFbServiceRating(order.feedback?.service_rating || 5);
                                setFbDeliveryPunctuality(order.feedback?.delivery_punctuality_rating || 5);
                                setFbPackaging(order.feedback?.packaging_rating || 5);
                                setFbComment(order.feedback?.comment || '');
                              }}
                              className={`inline-flex items-center gap-1 rounded-xl px-3 py-1 text-xs font-bold transition-colors shadow-soft ${
                                order.feedback || fbSubmittedOrders.has(order.id)
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-brand-600 text-white hover:bg-brand-700'
                              }`}
                            >
                              <Star className="h-3.5 w-3.5" />
                              {order.feedback || fbSubmittedOrders.has(order.id) ? 'Feedback Given ★' : 'Rate Delivery & Quality'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const repeatCart: Record<string, number> = {};
                              order.items.forEach((it) => {
                                repeatCart[it.id] = it.quantity;
                              });
                              localStorage.setItem('jvlsd_reorder_cart', JSON.stringify(repeatCart));
                              navigate(PATHS.order);
                            }}
                            className="inline-flex items-center gap-1 rounded-xl bg-gold-500/15 border border-gold-400/40 px-3 py-1 text-xs font-bold text-gold-900 hover:bg-gold-500/25 transition-colors shadow-soft"
                            title="Load this basket into your Order page with one click"
                          >
                            <RotateCw className="h-3.5 w-3.5 text-gold-700" /> Re-order This Basket
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-600">
                        <CalendarClock className="h-4 w-4" />
                        Delivery {formatDate(order.expected_delivery)} · {order.items.length} item{order.items.length === 1 ? '' : 's'}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-ink-100 text-xs text-ink-600">
                        {order.items.map((it, idx) => (
                          <span key={idx} className="rounded-lg bg-ink-50 px-2 py-0.5">
                            {it.name} ({it.quantity} {it.unit})
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </div>
        )}

        {/* Tab 3: Family Group & Shared Address Permissions (P4 Implementation) */}
        {activeTab === 'family' && (
          <div className="mt-8 space-y-6">
            <div className="rounded-3xl border border-ink-100 bg-white p-6 sm:p-8 shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <Users className="h-4 w-4" />
                    </span>
                    <h3 className="font-display text-lg font-bold text-ink-950">
                      {familyGroup ? familyGroup.household_name : 'Household & Family Group System'}
                    </h3>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-ink-600">
                    Connect multiple household members and domestic help with verified address-locked ordering rules.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!familyGroup ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setCreateHouseholdName(profile?.full_name ? `${profile.full_name}'s Household` : 'Dave Family Household');
                          setCreateAddress(profile?.addresses?.[0] ? `${profile.addresses[0].house_flat}, ${profile.addresses[0].building_society}, ${profile.addresses[0].area_road}, ${profile.addresses[0].city}` : 'A-301, Goyal Intercity, Drive-In Road, Ahmedabad');
                          setShowCreateModal(true);
                        }}
                        className="btn-primary px-4 py-2 text-xs"
                      >
                        + Create Family Group
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowJoinModal(true)}
                        className="btn-outline px-4 py-2 text-xs"
                      >
                        Join by Code
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 rounded-2xl bg-brand-50 px-3.5 py-1.5 border border-brand-200">
                      <span className="text-xs font-bold text-brand-900">Invite Code:</span>
                      <span className="font-mono text-sm font-black text-brand-700 tracking-wider">
                        {familyGroup.invite_code}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {groupActionNotice && (
                <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200">
                  {groupActionNotice}
                </div>
              )}

              {familyGroup ? (
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4 text-xs">
                    <p className="font-bold text-ink-900 uppercase tracking-wider text-[11px] text-ink-500">Verified Household Address</p>
                    <p className="mt-1 text-ink-800 font-medium">{familyGroup.household_address}</p>
                    <p className="mt-1 text-[11px] text-brand-800 font-semibold">
                      All domestic staff and restricted members are strictly geo-locked to this address for morning deliveries.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">
                      Authorized Household Members ({familyGroup.members.length})
                    </h4>
                    <div className="divide-y divide-ink-100 rounded-2xl border border-ink-100 overflow-hidden bg-white">
                      {familyGroup.members.map((m) => (
                        <div key={m.uid} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-ink-900">{m.full_name}</p>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                m.role === 'owner'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : m.role === 'domestic_help'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-brand-50 text-brand-800'
                              }`}>
                                {m.role === 'owner' ? 'Group Owner' : m.role === 'domestic_help' ? 'Domestic Staff / Maid' : 'Family Member'}
                              </span>
                            </div>
                            <p className="text-xs text-ink-500 mt-0.5">
                              Mobile: {m.mobile} · Joined {new Date(m.joined_at).toLocaleDateString('en-IN')}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold ${
                              m.can_order ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700'
                            }`}>
                              {m.can_order ? '✓ Ordering Authorized' : '✕ No Order Access'}
                            </span>
                            {m.address_locked && (
                              <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold bg-brand-50 text-brand-800 border border-brand-200">
                                🔒 Doorstep Locked
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 rounded-2xl border border-dashed border-ink-200 p-8 text-center">
                  <Home className="mx-auto h-10 w-10 text-brand-400" />
                  <h4 className="mt-3 font-display text-base font-bold text-ink-900">No Family Group Connected Yet</h4>
                  <p className="mx-auto mt-1 max-w-md text-xs sm:text-sm text-ink-600">
                    Create a household group to share fresh kitchen baskets with family, generate unique invite codes, or allow your maid/domestic staff to order strictly to your doorstep.
                  </p>
                  <div className="mt-5 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCreateHouseholdName(profile?.full_name ? `${profile.full_name}'s Household` : 'Dave Family Household');
                        setCreateAddress(profile?.addresses?.[0] ? `${profile.addresses[0].house_flat}, ${profile.addresses[0].building_society}, ${profile.addresses[0].area_road}, ${profile.addresses[0].city}` : 'A-301, Goyal Intercity, Drive-In Road, Ahmedabad');
                        setShowCreateModal(true);
                      }}
                      className="btn-primary px-5 py-2.5 text-xs sm:text-sm"
                    >
                      + Create Household Group
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowJoinModal(true)}
                      className="btn-outline px-5 py-2.5 text-xs sm:text-sm"
                    >
                      Enter Household Invite Code
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal: Create Family Group */}
            {showCreateModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-sm">
                <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-ink-100">
                  <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                    <h4 className="font-display text-base font-bold text-ink-950">Register New Family Household</h4>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="h-7 w-7 rounded-lg bg-ink-100 text-ink-600 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!createHouseholdName.trim() || !createAddress.trim()) return;
                      const grp = await createFamilyGroup(
                        { uid: user.uid, name: profile?.full_name || 'Household Owner', mobile: profile?.mobile || '9825112233' },
                        createHouseholdName.trim(),
                        createAddress.trim()
                      );
                      setFamilyGroup(grp);
                      setShowCreateModal(false);
                      setGroupActionNotice(`Household created successfully! Share invite code "${grp.invite_code}" with your family.`);
                    }}
                    className="mt-4 space-y-4"
                  >
                    <div>
                      <label className="label">Household / Family Group Name</label>
                      <input
                        type="text"
                        className="input-field"
                        value={createHouseholdName}
                        onChange={(e) => setCreateHouseholdName(e.target.value)}
                        placeholder="e.g. Harshit Dave Household"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Verified Doorstep Delivery Address</label>
                      <textarea
                        className="input-field"
                        rows={3}
                        value={createAddress}
                        onChange={(e) => setCreateAddress(e.target.value)}
                        placeholder="Complete society, road and city address..."
                        required
                      />
                      <p className="mt-1 text-[11px] text-ink-500">All member orders under domestic staff role will lock to this address.</p>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="btn-ghost text-xs px-3 py-2"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary text-xs px-4 py-2">
                        Create Group &amp; Generate Code
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal: Join Family Group by Code */}
            {showJoinModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-sm">
                <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-ink-100">
                  <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                    <h4 className="font-display text-base font-bold text-ink-950">Join Household Group</h4>
                    <button
                      type="button"
                      onClick={() => setShowJoinModal(false)}
                      className="h-7 w-7 rounded-lg bg-ink-100 text-ink-600 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!inviteInput.trim()) return;
                      const joined = await joinFamilyGroupByCode(
                        { uid: user.uid, name: profile?.full_name || 'Member', mobile: profile?.mobile || '9825112233' },
                        inviteInput.trim(),
                        joinRole
                      );
                      if (joined) {
                        setFamilyGroup(joined);
                        setShowJoinModal(false);
                        setGroupActionNotice(`Successfully joined "${joined.household_name}"!`);
                      } else {
                        alert('Invalid or expired family invite code. Please verify with the group owner.');
                      }
                    }}
                    className="mt-4 space-y-4"
                  >
                    <div>
                      <label className="label">Household Invite Code</label>
                      <input
                        type="text"
                        className="input-field font-mono font-bold tracking-wider uppercase"
                        value={inviteInput}
                        onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
                        placeholder="e.g. FAM-AB12C"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Your Role in this Household</label>
                      <select
                        className="input-field"
                        value={joinRole}
                        onChange={(e) => setJoinRole(e.target.value as any)}
                      >
                        <option value="family_member">Family Member (Full Kitchen Ordering Access)</option>
                        <option value="domestic_help">Domestic Staff / Maid (Locked strictly to Household Doorstep)</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowJoinModal(false)}
                        className="btn-ghost text-xs px-3 py-2"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary text-xs px-4 py-2">
                        Verify &amp; Join Group
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Family Income & Expense Dialogue Planner */}
        {activeTab === 'finance' && (
          <FamilyFinanceDialogue
            userEmail={user.email || ''}
            userUid={user.uid}
            familyGroupId={familyGroup?.id || profile?.family_group_id || 'default_family'}
          />
        )}
      </div>

      {/* Customer Delivery & Quality Feedback Modal */}
      {feedbackOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-ink-100 sm:p-7">
            <div className="flex items-center justify-between border-b border-ink-100 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-ink-950">
                  Rate Order &amp; Delivery Experience
                </h3>
                <p className="text-xs text-ink-500">
                  Order #{feedbackOrder.id.slice(0, 8)} · Delivered {formatDate(feedbackOrder.expected_delivery)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackOrder(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink-100 text-ink-600 hover:bg-ink-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setFbSubmitting(true);
                const feedbackData: OrderFeedback = {
                  order_id: feedbackOrder.id,
                  customer_name: feedbackOrder.customer_name || profile?.full_name || 'Customer',
                  mobile: feedbackOrder.mobile,
                  item_quality_rating: fbProduceFreshness,
                  service_rating: fbServiceRating,
                  delivery_punctuality_rating: fbDeliveryPunctuality,
                  packaging_rating: fbPackaging,
                  comment: fbComment.trim() || undefined,
                  created_at: new Date().toISOString(),
                };

                await submitOrderFeedback(feedbackData);
                setFbSubmittedOrders((prev) => new Set([...prev, feedbackOrder.id]));
                setOrders((prev) =>
                  prev.map((o) =>
                    o.id === feedbackOrder.id ? { ...o, feedback: feedbackData } : o
                  )
                );
                setFbSubmitting(false);
                setFeedbackOrder(null);
              }}
              className="mt-5 space-y-4"
            >
              <div className="space-y-3">
                {/* 1. Item Quality */}
                <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3">
                  <div>
                    <p className="text-xs font-bold text-ink-900">Produce Freshness &amp; Quality</p>
                    <p className="text-[11px] text-ink-500">Farm vegetables, fruits &amp; purity of milk</p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFbProduceFreshness(star)}
                        className={`text-lg transition-transform hover:scale-110 ${
                          star <= fbProduceFreshness ? 'text-amber-500' : 'text-ink-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Service Quality */}
                <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3">
                  <div>
                    <p className="text-xs font-bold text-ink-900">Overall Service &amp; Support</p>
                    <p className="text-[11px] text-ink-500">Ordering clarity, updates &amp; assistance</p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFbServiceRating(star)}
                        className={`text-lg transition-transform hover:scale-110 ${
                          star <= fbServiceRating ? 'text-amber-500' : 'text-ink-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Delivery Punctuality */}
                <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3">
                  <div>
                    <p className="text-xs font-bold text-ink-900">Delivery Punctuality</p>
                    <p className="text-[11px] text-ink-500">Morning dispatch timing adherence</p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFbDeliveryPunctuality(star)}
                        className={`text-lg transition-transform hover:scale-110 ${
                          star <= fbDeliveryPunctuality ? 'text-amber-500' : 'text-ink-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Packaging */}
                <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3">
                  <div>
                    <p className="text-xs font-bold text-ink-900">Packaging Hygiene &amp; Cleanliness</p>
                    <p className="text-[11px] text-ink-500">Safe handling &amp; sealed presentation</p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFbPackaging(star)}
                        className={`text-lg transition-transform hover:scale-110 ${
                          star <= fbPackaging ? 'text-amber-500' : 'text-ink-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-700">Detailed Feedback or Requests</label>
                <textarea
                  value={fbComment}
                  onChange={(e) => setFbComment(e.target.value)}
                  rows={2}
                  placeholder="Tell us what you loved or how we can improve quality or morning delivery..."
                  className="mt-1.5 w-full rounded-xl border border-ink-200 p-2.5 text-xs text-ink-900 focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackOrder(null)}
                  className="btn-ghost text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fbSubmitting}
                  className="btn-primary text-xs px-5 py-2 inline-flex items-center gap-1.5"
                >
                  {fbSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting…
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" /> Save Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------- Family Finance Dialogue & Mutual Consensus Component ---------- */

type ExpenseHead = {
  id: string;
  category: string;
  description: string;
  proposedAmount: number;
  anticipatedDate: string;
  requestedBy: string;
  status: 'agreed' | 'denied' | 'under_discussion';
  familyNote: string;
};

const INITIAL_EXPENSE_HEADS: ExpenseHead[] = [
  {
    id: 'exp-1',
    category: 'Fresh Groceries & Milk (JVLSD-FD)',
    description: 'Monthly Fresh Veg, Fruits & Desi Farm Milk morning deliveries',
    proposedAmount: 6500,
    anticipatedDate: '2026-11-20',
    requestedBy: 'Spouse',
    status: 'agreed',
    familyNote: 'Essential for healthy morning meals and zero food wastage.',
  },
  {
    id: 'exp-2',
    category: 'Children Education & Books',
    description: 'School term fees, stationeries & science laboratory kits',
    proposedAmount: 14000,
    anticipatedDate: '2026-11-25',
    requestedBy: 'Children',
    status: 'agreed',
    familyNote: 'Priority education expense agreed by everyone.',
  },
  {
    id: 'exp-3',
    category: 'Healthcare & Elder Medicine',
    description: 'Monthly Ayurvedic supplements & prescription refills',
    proposedAmount: 4200,
    anticipatedDate: '2026-11-22',
    requestedBy: 'Elders',
    status: 'agreed',
    familyNote: 'Crucial for parental health and well-being.',
  },
  {
    id: 'exp-4',
    category: 'Home Utilities & Repairs',
    description: 'Water purifier servicing & solar water heater maintenance',
    proposedAmount: 3800,
    anticipatedDate: '2026-11-28',
    requestedBy: 'Primary Account Holder',
    status: 'under_discussion',
    familyNote: 'Reviewing if servicing can be scheduled next week.',
  },
];

function FamilyFinanceDialogue({
  userEmail,
  userUid,
  familyGroupId,
}: {
  userEmail: string;
  userUid?: string;
  familyGroupId: string;
}) {
  const [monthlyIncome, setMonthlyIncome] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`jvlsd_family_income_${familyGroupId}`);
      return saved ? Number(saved) : 75000;
    } catch {
      return 75000;
    }
  });

  const [expenses, setExpenses] = useState<ExpenseHead[]>(() => {
    try {
      const saved = localStorage.getItem(`jvlsd_family_expenses_${familyGroupId}`);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSE_HEADS;
    } catch {
      return INITIAL_EXPENSE_HEADS;
    }
  });

  // Load from backend Firestore family_finances collection
  useEffect(() => {
    if (familyGroupId) {
      fetchFamilyExpenseProposals(familyGroupId).then((proposals) => {
        if (proposals.length > 0) {
          const mapped: ExpenseHead[] = proposals.map((p) => ({
            id: p.id,
            category: p.category,
            description: p.description,
            proposedAmount: p.amount,
            anticipatedDate: p.expected_date,
            requestedBy: p.proposed_by_name,
            status: p.status,
            familyNote: (p.votes && Object.keys(p.votes).length > 0)
              ? `Member consensus votes recorded: ${Object.values(p.votes).join(', ')}`
              : 'Open for family consensus & review.',
          }));
          setExpenses(mapped);
        }
      });
    }
  }, [familyGroupId]);

  // New expense form state
  const [newCategory, setNewCategory] = useState('Fresh Groceries & Milk (JVLSD-FD)');
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('');
  const [newMember, setNewMember] = useState('Spouse');
  const [newNote, setNewNote] = useState('');

  // Family Consensus Filter by Category, Member, Status, and Anticipated Month
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [anticipatedMonthFilter, setAnticipatedMonthFilter] = useState<string>('all');

  const saveIncome = (val: number) => {
    setMonthlyIncome(val);
    try {
      localStorage.setItem(`jvlsd_family_income_${familyGroupId}`, String(val));
    } catch {}
  };

  const saveExpenses = (list: ExpenseHead[]) => {
    setExpenses(list);
    try {
      localStorage.setItem(`jvlsd_family_expenses_${familyGroupId}`, JSON.stringify(list));
    } catch {}
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim() || !newAmount || Number(newAmount) <= 0 || !newDate) return;

    const newId = `exp-${Date.now()}`;
    const newHead: ExpenseHead = {
      id: newId,
      category: newCategory,
      description: newDesc.trim(),
      proposedAmount: Number(newAmount),
      anticipatedDate: newDate,
      requestedBy: newMember,
      status: 'under_discussion',
      familyNote: newNote.trim() || 'Open for family consensus & review.',
    };

    saveExpenses([newHead, ...expenses]);

    // Persist to shared backend Firestore
    const backendProposal: FamilyExpenseProposal = {
      id: newId,
      family_group_id: familyGroupId,
      proposed_by_uid: userUid || 'member',
      proposed_by_name: newMember,
      category: newCategory,
      description: newDesc.trim(),
      amount: Number(newAmount),
      expected_date: newDate,
      status: 'under_discussion',
      votes: userUid ? { [userUid]: 'under_discussion' } : {},
      created_at: new Date().toISOString(),
    };
    await saveFamilyExpenseProposal(backendProposal);

    setNewDesc('');
    setNewAmount('');
    setNewDate('');
    setNewNote('');
  };

  const handleUpdateStatus = async (id: string, newStatus: ExpenseHead['status']) => {
    const updated = expenses.map((exp) => (exp.id === id ? { ...exp, status: newStatus } : exp));
    saveExpenses(updated);
    // Persist status & vote to Firestore backend
    await updateFamilyExpenseStatus(id, familyGroupId, newStatus, userUid);
  };

  const totalProposed = expenses.reduce((sum, item) => sum + item.proposedAmount, 0);
  const totalAgreed = expenses.filter((e) => e.status === 'agreed').reduce((sum, item) => sum + item.proposedAmount, 0);
  const netSurplus = monthlyIncome - totalAgreed;

  return (
    <div className="mt-8 space-y-8 animate-fade-up">
      {/* Philosophy Banner */}
      <div className="rounded-3xl border border-gold-300/40 bg-gradient-to-br from-emerald-950 via-[#0e3321] to-ink-950 p-6 sm:p-8 text-white shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-400/25 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold-300 border border-gold-400/50 shadow-sm">
              <HeartHandshake className="h-4 w-4 text-gold-300" /> Family Financial Harmony &amp; Dialogue
            </span>
            <h2 className="mt-3.5 font-display text-2xl sm:text-3xl font-black leading-tight text-white drop-shadow-sm">
              Sort Household Income &amp; Anticipated Expenses Together
            </h2>
            <p className="mt-2.5 max-w-2xl text-xs sm:text-sm font-medium text-emerald-50 leading-relaxed">
              Bringing the whole family together to discuss anticipated expenses, express thoughts, share agreements or gentle requests for denial—building an atmosphere of mutual understanding, care, and respect.
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 p-4 border border-white/20 backdrop-blur-md text-center min-w-[12rem] shadow-soft">
            <p className="text-[11px] uppercase tracking-wider text-gold-300 font-extrabold">Net Family Surplus</p>
            <p className={`mt-1 font-display text-2xl sm:text-3xl font-black ${netSurplus >= 0 ? 'text-white' : 'text-rose-300'}`}>
              ₹{netSurplus.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-emerald-100 font-semibold mt-0.5">After all agreed expenses</p>
          </div>
        </div>
      </div>

      {/* Household Income & Budget Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Monthly Household Income</span>
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-lg font-bold text-ink-400">₹</span>
            <input
              type="number"
              value={monthlyIncome}
              onChange={(e) => saveIncome(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-black font-display text-ink-950 border-b border-dashed border-emerald-400 focus:outline-none focus:border-emerald-600 bg-transparent"
              title="Click to edit family monthly income"
            />
          </div>
          <p className="mt-1 text-xs text-ink-500">Combined monthly earnings of family members</p>
        </div>

        <div className="rounded-3xl border border-brand-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-800">Agreed Expenses</span>
            <CheckCircle className="h-5 w-5 text-brand-600" />
          </div>
          <p className="mt-3 font-display text-2xl font-extrabold text-ink-950">
            ₹{totalAgreed.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-xs text-ink-500">Unanimously confirmed by family consensus</p>
        </div>

        <div className="rounded-3xl border border-gold-300 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-800">Under Discussion</span>
            <HelpCircle className="h-5 w-5 text-gold-600" />
          </div>
          <p className="mt-3 font-display text-2xl font-extrabold text-ink-950">
            ₹{(totalProposed - totalAgreed).toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-xs text-ink-500">Pending dialogue or consensus requests</p>
        </div>
      </div>

      {/* Propose a New Family Expense Head */}
      <div className="rounded-3xl border border-ink-100 bg-white p-6 sm:p-8 shadow-soft">
        <h3 className="flex items-center gap-2 font-display text-base font-bold text-ink-950">
          <PlusCircle className="h-5 w-5 text-brand-600" /> Propose an Anticipated Family Expense Head
        </h3>
        <p className="mt-1 text-xs text-ink-500">
          Key in what you anticipate needing along with the expected due date so the family can review together.
        </p>

        <form onSubmit={handleAddExpense} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label">Expense Head / Category</label>
            <select
              className="input-field text-xs font-semibold"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            >
              <option>Fresh Groceries &amp; Milk (JVLSD-FD)</option>
              <option>Children Education &amp; Books</option>
              <option>Healthcare &amp; Elder Medicine</option>
              <option>Home Utilities &amp; Repairs</option>
              <option>Clothing &amp; Seasonal Essentials</option>
              <option>Festivals, Social &amp; Travel</option>
              <option>Emergency &amp; Savings Reserve</option>
            </select>
          </div>

          <div>
            <label className="label">Description / Purpose</label>
            <input
              type="text"
              required
              className="input-field uppercase tracking-wide"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="E.G. NEW WINTER QUILTS / SCHOOL BOOKS"
            />
          </div>

          <div>
            <label className="label">Proposed Amount (₹)</label>
            <input
              type="number"
              min={1}
              required
              className="input-field font-mono font-bold"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="₹ 5,000"
            />
          </div>

          <div>
            <label className="label">Anticipated Expense Date</label>
            <input
              type="date"
              required
              className="input-field font-mono"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Proposed By Family Member</label>
            <select
              className="input-field text-xs font-semibold"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
            >
              <option>Primary Account Holder</option>
              <option>Spouse</option>
              <option>Children</option>
              <option>Elders (Parents)</option>
            </select>
          </div>

          <div>
            <label className="label">Family Discussion Note</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input-field text-xs"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Reason or flexibility in timing"
              />
              <button type="submit" className="btn-primary shrink-0 px-4 text-xs">
                Submit for Dialogue
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Anticipated Expense Heads Table & Mutual Agreement Matrix */}
      <div className="rounded-3xl border border-ink-100 bg-white p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ink-100">
          <div>
            <h3 className="font-display text-base font-bold text-ink-950">Family Consensus Board</h3>
            <p className="mt-0.5 text-xs text-ink-500">
              Review, request denial or postpone, or agree collectively to balance the monthly budget.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Anticipated Month / Date Filter */}
            <div className="flex items-center gap-1 rounded-xl border border-ink-200 bg-white px-2.5 py-1">
              <Calendar className="h-3.5 w-3.5 text-gold-600" />
              <input
                type="month"
                value={anticipatedMonthFilter === 'all' ? '' : anticipatedMonthFilter}
                onChange={(e) => setAnticipatedMonthFilter(e.target.value || 'all')}
                className="text-xs font-semibold text-ink-700 bg-transparent focus:outline-none"
                title="Filter expenses anticipated in a specific month"
              />
              {anticipatedMonthFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setAnticipatedMonthFilter('all')}
                  className="text-[10px] text-ink-400 hover:text-ink-900"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="agreed">Agreed / Scheduled</option>
              <option value="under_discussion">Under Discussion</option>
              <option value="denied">Postponed / Denied</option>
            </select>

            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="rounded-xl border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="all">All Family Members</option>
              <option value="Primary Account Holder">Primary Account Holder</option>
              <option value="Spouse">Spouse</option>
              <option value="Children">Children</option>
              <option value="Elders">Elders (Parents)</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="all">All Heads / Categories</option>
              <option value="Fresh Groceries">Groceries &amp; Milk</option>
              <option value="Children Education">Education &amp; Books</option>
              <option value="Healthcare">Healthcare &amp; Medicine</option>
              <option value="Utilities">Utilities &amp; Repairs</option>
              <option value="Clothing">Clothing</option>
              <option value="Emergency">Savings / Emergency</option>
            </select>
          </div>
        </div>

        {(() => {
          const filteredExpenses = expenses.filter((h) => {
            if (statusFilter !== 'all' && h.status !== statusFilter) return false;
            if (memberFilter !== 'all' && !h.requestedBy.toLowerCase().includes(memberFilter.toLowerCase())) return false;
            if (categoryFilter !== 'all' && !h.category.toLowerCase().includes(categoryFilter.toLowerCase())) return false;
            if (anticipatedMonthFilter !== 'all' && !h.anticipatedDate.startsWith(anticipatedMonthFilter)) return false;
            return true;
          });

          if (filteredExpenses.length === 0) {
            return (
              <div className="py-12 text-center text-ink-500">
                <p className="text-sm font-semibold">No expense heads match your filter criteria.</p>
                <button
                  type="button"
                  onClick={() => { setStatusFilter('all'); setMemberFilter('all'); setCategoryFilter('all'); setAnticipatedMonthFilter('all'); }}
                  className="mt-2 text-xs font-bold text-brand-700 underline"
                >
                  Reset all dialogue filters
                </button>
              </div>
            );
          }

          return (
            <div className="mt-4 divide-y divide-ink-100">
              {filteredExpenses.map((head) => (
                <div key={head.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-ink-50/50 rounded-2xl px-2 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                        {head.category}
                      </span>
                      <span className="text-xs text-ink-500 font-medium">
                        Requested by <strong className="text-ink-900">{head.requestedBy}</strong>
                      </span>
                      <span className="text-xs text-ink-500 flex items-center gap-1 font-mono">
                        <Calendar className="h-3 w-3 text-gold-600" /> Due: {head.anticipatedDate}
                      </span>
                    </div>
                    <p className="mt-1.5 font-bold text-ink-950 text-sm">{head.description}</p>
                    <p className="mt-0.5 text-xs text-ink-600 italic">"{head.familyNote}"</p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="font-display font-extrabold text-ink-950 text-lg">
                        ₹{head.proposedAmount.toLocaleString('en-IN')}
                      </p>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          head.status === 'agreed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : head.status === 'denied'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {head.status === 'agreed' ? 'Agreed / Scheduled' : head.status === 'denied' ? 'Postponed / Denied' : 'Under Discussion'}
                      </span>
                    </div>

                    {/* Consensus Action Buttons: Agree / Deny / Re-open */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(head.id, 'agreed')}
                        className={`p-2 rounded-xl transition-all ${
                          head.status === 'agreed'
                            ? 'bg-emerald-600 text-white shadow-soft'
                            : 'text-ink-400 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                        title="Family Agrees: Proceed with this expense"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(head.id, 'denied')}
                        className={`p-2 rounded-xl transition-all ${
                          head.status === 'denied'
                            ? 'bg-rose-600 text-white shadow-soft'
                            : 'text-ink-400 hover:bg-rose-50 hover:text-rose-700'
                        }`}
                        title="Request Denial / Postpone to next month"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(head.id, 'under_discussion')}
                        className={`p-2 rounded-xl transition-all ${
                          head.status === 'under_discussion'
                            ? 'bg-amber-500 text-white shadow-soft'
                            : 'text-ink-400 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                        title="Keep open for further family talk"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
