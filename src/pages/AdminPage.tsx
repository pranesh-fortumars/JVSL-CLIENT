import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBasket,
  ClipboardList,
  MessageSquare,
  LogOut,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  CalendarClock,
  Truck,
  Sun,
  Users,
  Search,
  X,
  Check,
  ChevronRight,
  TrendingUp,
  Inbox,
  Leaf,
  Apple,
  Milk,
} from 'lucide-react';
import {
  fetchOrders,
  fetchSurveys,
  fetchEnquiries,
  fetchAllProfiles,
  updateUserRole,
  createManagedUser,
  deleteUserCompletely,
  updateOrderStatus as syncUpdateOrderStatus,
  updateSurveyStatus as syncUpdateSurveyStatus,
  updateEnquiryStatus as syncUpdateEnquiryStatus,
  type OrderRow,
  type SurveyRow,
  type EnquiryRow,
  type Profile,
} from '@/lib/firestoreService';
import { navigate, PATHS } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { Wordmark } from '@/components/Logo';
import { ShieldCheck, UserPlus, Key, Trash2 } from 'lucide-react';

type Tab = 'overview' | 'orders' | 'surveys' | 'enquiries' | 'superadmin';

export function AdminPage() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <Loader2 className="h-6 w-6 animate-spin text-brand-300" aria-label="Loading" />
      </div>
    );
  }

  const emailLower = (user?.email || '').toLowerCase().trim();
  const isDirectStaff =
    emailLower.includes('jvlsd') ||
    emailLower === 'jvlsd@gmail.com' ||
    emailLower.includes('admin') ||
    emailLower.includes('owner');

  const hasAdminAccess =
    profile?.role === 'admin' ||
    profile?.role === 'superadmin' ||
    isDirectStaff;

  if (!user || !hasAdminAccess) {
    return <AdminLoginPage />;
  }

  const isSuper = profile?.role === 'superadmin' || emailLower.includes('owner') || emailLower.includes('superadmin');
  return <Dashboard onSignOut={() => { void signOut(); }} isSuperAdmin={isSuper} />;
}

function Dashboard({ onSignOut, isSuperAdmin }: { onSignOut: () => void; isSuperAdmin: boolean }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [surveys, setSurveys] = useState<SurveyRow[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [o, s, e] = await Promise.all([
        fetchOrders(),
        fetchSurveys(),
        fetchEnquiries(),
      ]);
      setOrders(o);
      setSurveys(s);
      setEnquiries(e);
    } catch (err) {
      console.error(err);
      setLoadError('Could not load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const stats = useMemo(() => {
    const newOrders = orders.filter((o) => o.status === 'new').length;
    const newSurveys = surveys.filter((s) => s.status === 'new').length;
    const newEnquiries = enquiries.filter((e) => e.status === 'new').length;
    const delivered = orders.filter((o) => o.status === 'delivered').length;
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayDeliveries = orders.filter(
      (o) => o.expected_delivery === todayStr && o.status !== 'cancelled'
    ).length;
    return {
      totalOrders: orders.length,
      newOrders,
      totalSurveys: surveys.length,
      newSurveys,
      totalEnquiries: enquiries.length,
      newEnquiries,
      delivered,
      todayDeliveries,
      pending: newOrders + newSurveys + newEnquiries,
    };
  }, [orders, surveys, enquiries]);

  const updateOrderStatus = async (id: string, status: OrderRow['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await syncUpdateOrderStatus(id, status);
    } catch (error) {
      console.error(error);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: o.status } : o)));
    }
  };
  const updateSurveyStatus = async (id: string, status: SurveyRow['status']) => {
    setSurveys((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    try {
      await syncUpdateSurveyStatus(id, status);
    } catch (error) {
      console.error(error);
      setSurveys((prev) => prev.map((s) => (s.id === id ? { ...s, status: s.status } : s)));
    }
  };
  const updateEnquiryStatus = async (id: string, status: EnquiryRow['status']) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    try {
      await syncUpdateEnquiryStatus(id, status);
    } catch (error) {
      console.error(error);
      setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status: e.status } : e)));
    }
  };

  const TABS: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBasket, badge: stats.newOrders },
    { id: 'surveys', label: 'Surveys', icon: ClipboardList, badge: stats.newSurveys },
    { id: 'enquiries', label: 'Enquiries', icon: MessageSquare, badge: stats.newEnquiries },
    ...(isSuperAdmin
      ? [{ id: 'superadmin' as Tab, label: 'Access & Role Manager (Owner)', icon: ShieldCheck }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(PATHS.home)} className="flex items-center gap-2.5" aria-label="Back to website">
              <Wordmark />
            </button>
            <span className="hidden h-6 w-px bg-ink-200 sm:block" />
            <span className="hidden font-display text-sm font-bold uppercase tracking-wider text-ink-500 sm:block">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAll}
              className="btn-ghost text-sm"
              title="Refresh data"
            >
              <TrendingUp className="h-4 w-4" /> Refresh
            </button>
            <button onClick={onSignOut} className="btn-outline px-4 py-2 text-sm">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {/* Tabs */}
        <div className="mb-8 flex gap-1 overflow-x-auto rounded-2xl border border-ink-100 bg-white p-1.5 shadow-soft">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  active ? 'bg-brand-700 text-white shadow-soft' : 'text-ink-600 hover:bg-ink-50'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
                {t.badge ? (
                  <span
                    className={`ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-accent-100 text-accent-700'
                    }`}
                  >
                    {t.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {loadError && (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 p-5 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">{loadError}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-ink-500">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
            <span className="ml-3">Loading dashboard…</span>
          </div>
        ) : (
          <>
            {tab === 'overview' && (
              <Overview stats={stats} orders={orders} surveys={surveys} enquiries={enquiries} onJump={setTab} />
            )}
            {tab === 'orders' && (
              <OrdersPanel orders={orders} onUpdate={updateOrderStatus} />
            )}
            {tab === 'surveys' && (
              <SurveysPanel surveys={surveys} onUpdate={updateSurveyStatus} />
            )}
            {tab === 'enquiries' && (
              <EnquiriesPanel enquiries={enquiries} onUpdate={updateEnquiryStatus} />
            )}
            {tab === 'superadmin' && isSuperAdmin && (
              <SuperAdminAccessPanel />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Overview ---------- */

function Overview({
  stats,
  orders,
  surveys,
  enquiries,
  onJump,
}: {
  stats: {
    totalOrders: number; newOrders: number;
    totalSurveys: number; newSurveys: number;
    totalEnquiries: number; newEnquiries: number;
    delivered: number; todayDeliveries: number; pending: number;
  };
  orders: OrderRow[];
  surveys: SurveyRow[];
  enquiries: EnquiryRow[];
  onJump: (t: Tab) => void;
}) {
  const recentOrders = orders.slice(0, 5);
  const cards = [
    { label: 'Total orders', value: stats.totalOrders, sub: `${stats.newOrders} new`, icon: ShoppingBasket, tab: 'orders' as Tab, tone: 'brand' },
    { label: 'Survey responses', value: stats.totalSurveys, sub: `${stats.newSurveys} new`, icon: ClipboardList, tab: 'surveys' as Tab, tone: 'gold' },
    { label: 'Enquiries', value: stats.totalEnquiries, sub: `${stats.newEnquiries} new`, icon: MessageSquare, tab: 'enquiries' as Tab, tone: 'accent' },
    { label: 'Deliveries today', value: stats.todayDeliveries, sub: `${stats.delivered} delivered all-time`, icon: Truck, tab: 'orders' as Tab, tone: 'brand' },
  ];

  return (
    <div className="space-y-8">
      {/* Pending banner */}
      {stats.pending > 0 && (
        <div className="flex items-center gap-4 rounded-2xl border border-accent-200 bg-accent-50 p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500 text-white">
            <Inbox className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="font-display text-base font-bold text-accent-800">
              {stats.pending} item{stats.pending === 1 ? '' : 's'} need attention
            </p>
            <p className="text-sm text-accent-700">
              {stats.newOrders} new order{stats.newOrders === 1 ? '' : 's'},{' '}
              {stats.newSurveys} new survey{stats.newSurveys === 1 ? '' : 'ies'},{' '}
              {stats.newEnquiries} new enquir{stats.newEnquiries === 1 ? 'y' : 'ies'}.
            </p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => onJump(c.tab)}
            className="group card p-6 text-left transition-all hover:shadow-lift"
          >
            <div className="flex items-center justify-between">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  c.tone === 'brand' ? 'bg-brand-50 text-brand-700'
                  : c.tone === 'gold' ? 'bg-gold-50 text-gold-700'
                  : 'bg-accent-50 text-accent-700'
                }`}
              >
                <c.icon className="h-5 w-5" />
              </span>
              <ChevronRight className="h-5 w-5 text-ink-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-600" />
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-ink-950">{c.value}</p>
            <p className="mt-1 text-sm font-semibold text-ink-700">{c.label}</p>
            <p className="mt-0.5 text-xs text-ink-500">{c.sub}</p>
          </button>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink-950">Recent orders</h2>
          <button onClick={() => onJump('orders')} className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            View all
          </button>
        </div>
        {recentOrders.length === 0 ? (
          <EmptyState icon={ShoppingBasket} message="No orders yet." />
        ) : (
          <ul className="mt-4 divide-y divide-ink-100">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink-900">{o.customer_name}</p>
                  <p className="text-xs text-ink-500">
                    {o.items.length} item{o.items.length === 1 ? '' : 's'} ·{' '}
                    {o.mode === 'next_day' ? 'Next-day pre-order' : 'Same-day'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden text-xs text-ink-500 sm:block">
                    {fmtDate(o.expected_delivery)}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------- Orders panel ---------- */

function OrdersPanel({ orders, onUpdate }: { orders: OrderRow[]; onUpdate: (id: string, s: OrderRow['status']) => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | OrderRow['status']>('all');
  const [selected, setSelected] = useState<OrderRow | null>(null);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter !== 'all' && o.status !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          o.customer_name.toLowerCase().includes(q) ||
          o.mobile.includes(q) ||
          o.address.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, query, filter]);

  return (
    <PanelShell
      title="Orders"
      count={orders.length}
      query={query}
      setQuery={setQuery}
      filter={filter}
      setFilter={setFilter}
      filterOptions={[
        { value: 'all', label: 'All' },
        { value: 'new', label: 'New' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
      ]}
      icon={ShoppingBasket}
      empty="No orders match your filters."
      filteredCount={filtered.length}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Mode</th>
              <th className="hidden px-4 py-3 sm:table-cell">Items</th>
              <th className="hidden px-4 py-3 md:table-cell">Delivery</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-ink-50/60">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink-900">{o.customer_name}</p>
                  <p className="text-xs text-ink-500">{o.mobile}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    o.mode === 'next_day' ? 'bg-brand-50 text-brand-700' : 'bg-gold-100 text-gold-800'
                  }`}>
                    {o.mode === 'next_day' ? <CalendarClock className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
                    {o.mode === 'next_day' ? 'Next-day' : 'Same-day'}
                  </span>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell text-ink-700">
                  {o.items.length} item{o.items.length === 1 ? '' : 's'}
                </td>
                <td className="hidden px-4 py-3 md:table-cell text-ink-600">
                  {fmtDate(o.expected_delivery)}
                </td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setSelected(o)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <DetailDrawer title="Order details" onClose={() => setSelected(null)}>
          <OrderDetail order={selected} onUpdate={(s) => { onUpdate(selected.id, s); setSelected({ ...selected, status: s }); }} />
        </DetailDrawer>
      )}
    </PanelShell>
  );
}

function OrderDetail({ order, onUpdate }: { order: OrderRow; onUpdate: (s: OrderRow['status']) => void }) {
  const statuses: OrderRow['status'][] = ['new', 'confirmed', 'delivered', 'cancelled'];
  return (
    <div className="space-y-6">
      <InfoRow icon={Users} label="Customer" value={order.customer_name} />
      <InfoRow icon={Phone} label="Mobile" value={order.mobile} href={`tel:${order.mobile}`} />
      <InfoRow icon={MapPin} label="Address" value={order.address} />
      <div className="grid grid-cols-2 gap-4">
        <InfoTile icon={order.mode === 'next_day' ? CalendarClock : Truck} label="Mode" value={order.mode === 'next_day' ? 'Next-day pre-order' : 'Same-day order'} />
        <InfoTile icon={Sun} label="Expected delivery" value={fmtDate(order.expected_delivery)} />
      </div>
      {order.notes && <InfoRow icon={MessageSquare} label="Notes" value={order.notes} />}

      <div>
        <h4 className="label">Items</h4>
        <ul className="divide-y divide-ink-100 rounded-xl border border-ink-100">
          {order.items.map((it) => (
            <li key={it.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="font-semibold text-ink-900">{it.name}</span>
              <span className="text-ink-600">{it.quantity} {it.unit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="label">Update status</h4>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => onUpdate(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                order.status === s
                  ? 'bg-brand-700 text-white'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Surveys panel ---------- */

function SurveysPanel({ surveys, onUpdate }: { surveys: SurveyRow[]; onUpdate: (id: string, s: SurveyRow['status']) => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | SurveyRow['status']>('all');
  const [selected, setSelected] = useState<SurveyRow | null>(null);

  const filtered = useMemo(() => {
    return surveys.filter((s) => {
      if (filter !== 'all' && s.status !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          s.customer_name.toLowerCase().includes(q) ||
          s.mobile.includes(q) ||
          s.address.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [surveys, query, filter]);

  return (
    <PanelShell
      title="Survey responses"
      count={surveys.length}
      query={query}
      setQuery={setQuery}
      filter={filter}
      setFilter={setFilter}
      filterOptions={[
        { value: 'all', label: 'All' },
        { value: 'new', label: 'New' },
        { value: 'reviewed', label: 'Reviewed' },
      ]}
      icon={ClipboardList}
      empty="No survey responses match your filters."
      filteredCount={filtered.length}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
              <th className="px-4 py-3">Customer</th>
              <th className="hidden px-4 py-3 sm:table-cell">Family</th>
              <th className="hidden px-4 py-3 md:table-cell">Products</th>
              <th className="hidden px-4 py-3 md:table-cell">Delivery pref</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-ink-50/60">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink-900">{s.customer_name}</p>
                  <p className="text-xs text-ink-500">{s.mobile}</p>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell text-ink-700">{s.family_members}</td>
                <td className="hidden px-4 py-3 md:table-cell text-ink-600">{s.selections.length}</td>
                <td className="hidden px-4 py-3 md:table-cell text-ink-600">{s.delivery_preference}</td>
                <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setSelected(s)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <DetailDrawer title="Survey response" onClose={() => setSelected(null)}>
          <SurveyDetail survey={selected} onUpdate={(s) => { onUpdate(selected.id, s); setSelected({ ...selected, status: s }); }} />
        </DetailDrawer>
      )}
    </PanelShell>
  );
}

function SurveyDetail({ survey, onUpdate }: { survey: SurveyRow; onUpdate: (s: SurveyRow['status']) => void }) {
  const byCategory = useMemo(() => {
    const groups: Record<string, typeof survey.selections> = { vegetable: [], fruit: [], milk: [] };
    survey.selections.forEach((it) => {
      if (groups[it.category]) groups[it.category].push(it);
    });
    return groups;
  }, [survey]);

  const catIcon = (c: string) => (c === 'vegetable' ? Leaf : c === 'fruit' ? Apple : Milk);

  return (
    <div className="space-y-6">
      <InfoRow icon={Users} label="Customer" value={survey.customer_name} />
      <InfoRow icon={Phone} label="Mobile" value={survey.mobile} href={`tel:${survey.mobile}`} />
      <InfoRow icon={MapPin} label="Address" value={survey.address} />
      <div className="grid grid-cols-2 gap-4">
        <InfoTile icon={Users} label="Family members" value={String(survey.family_members)} />
        <InfoTile icon={CalendarClock} label="Delivery preference" value={survey.delivery_preference} />
      </div>
      {survey.notes && <InfoRow icon={MessageSquare} label="Notes" value={survey.notes} />}

      <div>
        <h4 className="label">Product preferences</h4>
        <div className="space-y-4">
          {(['vegetable', 'fruit', 'milk'] as const).map((cat) => {
            const items = byCategory[cat];
            if (!items || items.length === 0) return null;
            const Icon = catIcon(cat);
            return (
              <div key={cat} className="rounded-xl border border-ink-100">
                <p className="flex items-center gap-2 border-b border-ink-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink-500">
                  <Icon className="h-3.5 w-3.5 text-brand-600" /> {cat}s
                </p>
                <ul className="divide-y divide-ink-50">
                  {items.map((it) => (
                    <li key={it.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span className="font-semibold text-ink-900">{it.name}</span>
                      <span className="text-ink-600">
                        {it.quantity} {it.unit} · <span className="capitalize">{it.frequency}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="label">Update status</h4>
        <div className="flex flex-wrap gap-2">
          {(['new', 'reviewed'] as SurveyRow['status'][]).map((s) => (
            <button
              key={s}
              onClick={() => onUpdate(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                survey.status === s
                  ? 'bg-brand-700 text-white'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Enquiries panel ---------- */

function EnquiriesPanel({ enquiries, onUpdate }: { enquiries: EnquiryRow[]; onUpdate: (id: string, s: EnquiryRow['status']) => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | EnquiryRow['status']>('all');
  const [selected, setSelected] = useState<EnquiryRow | null>(null);

  const filtered = useMemo(() => {
    return enquiries.filter((e) => {
      if (filter !== 'all' && e.status !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          e.phone.includes(q) ||
          e.subject.toLowerCase().includes(q) ||
          (e.email ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [enquiries, query, filter]);

  return (
    <PanelShell
      title="Contact enquiries"
      count={enquiries.length}
      query={query}
      setQuery={setQuery}
      filter={filter}
      setFilter={setFilter}
      filterOptions={[
        { value: 'all', label: 'All' },
        { value: 'new', label: 'New' },
        { value: 'resolved', label: 'Resolved' },
      ]}
      icon={MessageSquare}
      empty="No enquiries match your filters."
      filteredCount={filtered.length}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
              <th className="px-4 py-3">Name</th>
              <th className="hidden px-4 py-3 sm:table-cell">Subject</th>
              <th className="hidden px-4 py-3 md:table-cell">Contact</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {filtered.map((e) => (
              <tr key={e.id} className="hover:bg-ink-50/60">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink-900">{e.name}</p>
                  <p className="text-xs text-ink-500 sm:hidden">{e.subject}</p>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell text-ink-700">{e.subject}</td>
                <td className="hidden px-4 py-3 md:table-cell text-ink-600">
                  <p>{e.phone}</p>
                  {e.email && <p className="text-xs text-ink-400">{e.email}</p>}
                </td>
                <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setSelected(e)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <DetailDrawer title="Enquiry details" onClose={() => setSelected(null)}>
          <EnquiryDetail enquiry={selected} onUpdate={(s) => { onUpdate(selected.id, s); setSelected({ ...selected, status: s }); }} />
        </DetailDrawer>
      )}
    </PanelShell>
  );
}

function EnquiryDetail({ enquiry, onUpdate }: { enquiry: EnquiryRow; onUpdate: (s: EnquiryRow['status']) => void }) {
  return (
    <div className="space-y-6">
      <InfoRow icon={Users} label="Name" value={enquiry.name} />
      <InfoRow icon={Phone} label="Phone" value={enquiry.phone} href={`tel:${enquiry.phone}`} />
      {enquiry.email && <InfoRow icon={Mail} label="Email" value={enquiry.email} href={`mailto:${enquiry.email}`} />}
      <InfoRow icon={MessageSquare} label="Subject" value={enquiry.subject} />
      <div>
        <h4 className="label">Message</h4>
        <p className="rounded-xl border border-ink-100 bg-ink-50/50 p-4 text-sm leading-relaxed text-ink-800">
          {enquiry.message}
        </p>
      </div>

      <div>
        <h4 className="label">Update status</h4>
        <div className="flex flex-wrap gap-2">
          {(['new', 'resolved'] as EnquiryRow['status'][]).map((s) => (
            <button
              key={s}
              onClick={() => onUpdate(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                enquiry.status === s
                  ? 'bg-brand-700 text-white'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Shared bits ---------- */

function PanelShell({
  title,
  count,
  query,
  setQuery,
  filter,
  setFilter,
  filterOptions,
  icon: Icon,
  empty,
  filteredCount,
  children,
}: {
  title: string;
  count: number;
  query: string;
  setQuery: (v: string) => void;
  filter: 'all' | string;
  setFilter: React.Dispatch<React.SetStateAction<any>>;
  filterOptions: { value: string; label: string }[];
  icon: React.ElementType;
  empty: string;
  filteredCount: number;
  children: React.ReactNode;
}) {
  const isEmpty = filteredCount === 0;
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-ink-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-ink-950">{title}</h2>
            <p className="text-xs text-ink-500">{count} total</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              placeholder="Search name, phone…"
              className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 sm:w-56"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search"
            />
          </div>
          <select
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter by status"
          >
            {filterOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {isEmpty ? (
        <EmptyState icon={Icon} message={empty} />
      ) : (
        children
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: 'bg-accent-100 text-accent-700',
    confirmed: 'bg-brand-100 text-brand-700',
    delivered: 'bg-brand-600 text-white',
    cancelled: 'bg-red-100 text-red-700',
    reviewed: 'bg-ink-200 text-ink-700',
    resolved: 'bg-brand-100 text-brand-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${map[status] ?? 'bg-ink-100 text-ink-600'}`}>
      {status === 'delivered' && <Check className="h-3 w-3" />}
      {status}
    </span>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
        <Icon className="h-7 w-7" />
      </span>
      <p className="mt-4 text-sm text-ink-500">{message}</p>
    </div>
  );
}

function DetailDrawer({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative h-full w-full max-w-md overflow-y-auto bg-white shadow-lift animate-fade-up">
        <div className="sticky top-0 flex items-center justify-between border-b border-ink-100 bg-white/95 px-5 py-4 backdrop-blur">
          <h3 className="font-display text-base font-bold text-ink-950">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-ink-500 hover:bg-ink-100"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, href }: { icon: React.ElementType; label: string; value: string; href?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</p>
        {href ? (
          <a href={href} className="block font-semibold text-ink-900 hover:text-brand-700 break-words">{value}</a>
        ) : (
          <p className="font-semibold text-ink-900 break-words">{value}</p>
        )}
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink-50 p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-500">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className="mt-1 font-display font-bold text-ink-900">{value}</p>
    </div>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

/* ---------- Super Admin Access & Role Manager ---------- */

function SuperAdminAccessPanel() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form to create / provision new admin or user
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'customer' | 'superadmin'>('admin');
  const [creating, setCreating] = useState(false);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const p = await fetchAllProfiles();
      setProfiles(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const handleDeleteUser = async (userId: string, email?: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${email || userId}" and purge all their orders and history from the database? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteUserCompletely(userId, email);
      setProfiles((prev) => prev.filter((pr) => pr.id !== userId));
      setMsg({ text: `User "${email || userId}" and all their order history completely erased from database.`, type: 'success' });
    } catch (err) {
      console.error(err);
      setMsg({ text: 'Failed to delete user.', type: 'error' });
    }
  };

  const handleRoleChange = async (userId: string, targetRole: Profile['role']) => {
    try {
      await updateUserRole(userId, targetRole);
      setProfiles((prev) => prev.map((pr) => (pr.id === userId ? { ...pr, role: targetRole } : pr)));
      setMsg({ text: `Role updated to ${targetRole} successfully.`, type: 'success' });
    } catch (e) {
      setMsg({ text: 'Could not update role.', type: 'error' });
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) {
      setMsg({ text: 'Please provide full name and email.', type: 'error' });
      return;
    }
    setCreating(true);
    setMsg(null);
    try {
      await createManagedUser({
        email: newEmail.trim().toLowerCase(),
        full_name: newName.trim(),
        role: newRole,
      });
      setMsg({ text: `Account for ${newEmail} provisioned as ${newRole}. They can now sign in using the login/admin page.`, type: 'success' });
      setNewEmail('');
      setNewName('');
      loadProfiles();
    } catch (err) {
      console.error(err);
      setMsg({ text: 'Failed to provision account.', type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Super Admin Notice */}
      <div className="rounded-3xl border border-gold-400/40 bg-gradient-to-r from-ink-950 via-[#0a2016] to-ink-950 p-6 text-white shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/20 text-gold-300">
            <Key className="h-6 w-6" />
          </div>
          <div>
            <span className="rounded-full bg-gold-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-gold-300">
              Master Super Admin Privileges
            </span>
            <h2 className="mt-1 font-display text-xl font-bold">Confidential User &amp; Role Manager</h2>
            <p className="mt-0.5 text-xs text-emerald-100/80">
              Only visible to Master Super Admin. Create staff accounts, grant Admin access, or manage customer roles.
            </p>
          </div>
        </div>
      </div>

      {msg && (
        <div
          className={`flex items-center gap-2 rounded-2xl p-4 text-sm font-semibold ${
            msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Provision new account form */}
      <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
        <h3 className="flex items-center gap-2 font-display text-base font-bold text-ink-900">
          <UserPlus className="h-4 w-4 text-brand-600" /> Provision New Role Account
        </h3>
        <p className="mt-1 text-xs text-ink-500">
          Create an Admin, Super Admin, or Customer identity to hand over to team members or managers.
        </p>

        <form onSubmit={handleCreateAccount} className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              required
              className="input-field"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="E.g. Rajesh Shah"
            />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              required
              className="input-field"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="staff@jvlsd.in"
            />
          </div>
          <div>
            <label className="label">Assign Role</label>
            <div className="flex gap-2">
              <select
                className="input-field"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
              >
                <option value="admin">Admin (Staff / Operations)</option>
                <option value="superadmin">Super Admin (Full Platform Owner)</option>
                <option value="customer">Customer</option>
              </select>
              <button
                type="submit"
                disabled={creating}
                className="btn-primary shrink-0 px-4 text-xs"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Provision'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Existing accounts table */}
      <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-ink-900">System Accounts &amp; Permissions</h3>
            <p className="mt-0.5 text-xs text-ink-500">All registered users and assigned access levels.</p>
          </div>
          <button
            type="button"
            onClick={loadProfiles}
            className="text-xs font-semibold text-brand-700 hover:underline"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink-100 text-ink-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Current Role</th>
                  <th className="py-3 px-3">Change Role</th>
                  <th className="py-3 px-3 text-right">Delete &amp; Purge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-ink-50/60">
                    <td className="py-3 px-3 font-semibold text-ink-900">{p.full_name || '—'}</td>
                    <td className="py-3 px-3 font-mono text-ink-600">{p.email}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          p.role === 'superadmin'
                            ? 'bg-gold-100 text-gold-900 border border-gold-300'
                            : p.role === 'admin'
                            ? 'bg-brand-100 text-brand-900'
                            : 'bg-ink-100 text-ink-700'
                        }`}
                      >
                        {p.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-xs font-medium text-ink-700"
                        value={p.role}
                        onChange={(e) => handleRoleChange(p.id, e.target.value as Profile['role'])}
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(p.id, p.email)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                        title="Permanently erase account and order history"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Erase
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
