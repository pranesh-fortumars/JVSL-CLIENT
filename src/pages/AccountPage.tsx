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
  RotateCw,
  HeartHandshake,
  DollarSign,
  PlusCircle,
  CheckCircle,
  XCircle,
  MessageCircle,
  HelpCircle,
  Calendar,
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
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'family' | 'finance'>('overview');

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
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
                          {STATUS_LABEL[order.status]}
                        </span>
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

        {/* Tab 4: Family Income & Expense Dialogue Planner */}
        {activeTab === 'finance' && <FamilyFinanceDialogue userEmail={user.email || ''} />}
      </div>
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

function FamilyFinanceDialogue({ userEmail }: { userEmail: string }) {
  const [monthlyIncome, setMonthlyIncome] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jvlsd_family_income');
      return saved ? Number(saved) : 75000;
    } catch {
      return 75000;
    }
  });

  const [expenses, setExpenses] = useState<ExpenseHead[]>(() => {
    try {
      const saved = localStorage.getItem('jvlsd_family_expenses');
      return saved ? JSON.parse(saved) : INITIAL_EXPENSE_HEADS;
    } catch {
      return INITIAL_EXPENSE_HEADS;
    }
  });

  // New expense form state
  const [newCategory, setNewCategory] = useState('Fresh Groceries & Milk (JVLSD-FD)');
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('');
  const [newMember, setNewMember] = useState('Spouse');
  const [newNote, setNewNote] = useState('');

  const saveIncome = (val: number) => {
    setMonthlyIncome(val);
    try {
      localStorage.setItem('jvlsd_family_income', String(val));
    } catch {}
  };

  const saveExpenses = (list: ExpenseHead[]) => {
    setExpenses(list);
    try {
      localStorage.setItem('jvlsd_family_expenses', JSON.stringify(list));
    } catch {}
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim() || !newAmount || Number(newAmount) <= 0 || !newDate) return;

    const newHead: ExpenseHead = {
      id: `exp-${Date.now()}`,
      category: newCategory,
      description: newDesc.trim(),
      proposedAmount: Number(newAmount),
      anticipatedDate: newDate,
      requestedBy: newMember,
      status: 'under_discussion',
      familyNote: newNote.trim() || 'Open for family consensus & review.',
    };

    saveExpenses([newHead, ...expenses]);
    setNewDesc('');
    setNewAmount('');
    setNewDate('');
    setNewNote('');
  };

  const handleUpdateStatus = (id: string, newStatus: ExpenseHead['status']) => {
    const updated = expenses.map((exp) => (exp.id === id ? { ...exp, status: newStatus } : exp));
    saveExpenses(updated);
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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-300 border border-gold-400/30">
              <HeartHandshake className="h-4 w-4" /> Family Financial Harmony &amp; Dialogue
            </span>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold leading-tight">
              Sort Household Income &amp; Anticipated Expenses Together
            </h2>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-emerald-100/85 leading-relaxed">
              Bringing the whole family together to discuss anticipated expenses, express thoughts, share agreements or gentle requests for denial—building an atmosphere of mutual understanding, care, and respect.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-md text-center min-w-[12rem]">
            <p className="text-[11px] uppercase tracking-wider text-gold-300 font-semibold">Net Family Surplus</p>
            <p className={`mt-1 font-display text-2xl font-black ${netSurplus >= 0 ? 'text-white' : 'text-rose-300'}`}>
              ₹{netSurplus.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-emerald-200 mt-0.5">After all agreed expenses</p>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-ink-100">
          <div>
            <h3 className="font-display text-base font-bold text-ink-950">Family Consensus Board</h3>
            <p className="mt-0.5 text-xs text-ink-500">
              Review, request denial or postpone, or agree collectively to balance the monthly budget.
            </p>
          </div>
          <span className="text-xs font-semibold text-brand-700">
            {expenses.length} Scheduled Expense Head{expenses.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="mt-4 divide-y divide-ink-100">
          {expenses.map((head) => (
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
      </div>
    </div>
  );
}
