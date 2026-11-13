import { useEffect, useState } from 'react';
import { CalendarClock, LogOut, Loader2, Package, AlertCircle } from 'lucide-react';
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">My account</p>
            <h1 className="section-title mt-3">Hello, {displayName}</h1>
            <p className="mt-2 text-ink-600">{user.email}</p>
          </div>
          <button
            onClick={() => { void signOut(); }}
            className="btn-outline self-start px-5 py-2.5"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        <div className="mt-10">
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
      </div>
    </section>
  );
}
