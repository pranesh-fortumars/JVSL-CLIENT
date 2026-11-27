import { useEffect, useState } from 'react';
import { Menu, X, ShoppingBasket, Phone, UserRound, Shield } from 'lucide-react';
import { Wordmark } from './Logo';
import { navigate, useRoute, PATHS, type Route } from '@/lib/router';
import { useAuth } from '@/lib/auth';

const NAV: { label: string; route: Route['name']; path: string }[] = [
  { label: 'Home', route: 'home', path: PATHS.home },
  { label: 'About JVLSD', route: 'about', path: PATHS.about },
  { label: 'Shakhwala', route: 'shakhwala', path: PATHS.shakhwala },
  { label: 'Fresh Daily', route: 'fresh-daily', path: PATHS.freshDaily },
  { label: 'Bites', route: 'bites', path: PATHS.bites },
  { label: 'Survey', route: 'survey', path: PATHS.survey },
  { label: 'Order Now', route: 'order', path: PATHS.order },
  { label: 'Contact', route: 'contact', path: PATHS.contact },
];

export function Navbar() {
  const route = useRoute();
  const { user, profile } = useAuth();
  const isStaffOrSuper = profile?.role === 'admin' || profile?.role === 'superadmin';

  // If user is admin/superadmin, clicking account goes directly to the Admin Dashboard
  const accountPath = user ? (isStaffOrSuper ? PATHS.admin : PATHS.account) : PATHS.login;
  const accountLabel = user ? (isStaffOrSuper ? 'Admin Dashboard' : 'My account') : 'Sign in';
  const accountActive = route.name === 'account' || route.name === 'admin' || route.name === 'login';
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [route]);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-ink-100 shadow-soft'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      {/* Top Statement Bar: Sustainability & Franchisee Clarification */}
      <div className="bg-emerald-900 text-gold-200 text-[11px] sm:text-xs py-1 px-3 border-b border-gold-400/20">
        <div className="container-page flex items-center justify-between gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
          <div className="flex items-center gap-1.5 text-emerald-100 font-medium">
            <span className="text-emerald-300 font-bold">🌱 Eco-Friendly Packaging:</span>
            <span>Zero-plastic approach with almost zero kitchen produce wastage.</span>
          </div>
          <div className="flex items-center gap-1.5 text-gold-300 font-semibold shrink-0">
            <span>JVLSD-FD: Authorized Franchisee Partner of Shakhwala.com</span>
          </div>
        </div>
      </div>

      <nav className="container-page flex items-center justify-between" style={{ height: 'var(--header-h)' }} aria-label="Primary">
        <button
          onClick={() => go(PATHS.home)}
          className="flex items-center gap-2.5 rounded-lg"
          aria-label="JVLSD home"
        >
          <Wordmark />
        </button>

        <ul className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => {
            const active = route.name === item.route;
            const isOrder = item.route === 'order';
            return (
              <li key={item.route}>
                <button
                  onClick={() => go(item.path)}
                  className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'text-brand-800'
                      : isOrder
                        ? 'text-ink-900'
                        : 'text-ink-700 hover:text-brand-700'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                  {active && !isOrder && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-600" />
                  )}
                </button>
              </li>
            );
          })}
          <li>
            <button
              onClick={() => go(accountPath)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                accountActive ? 'text-brand-800' : 'text-ink-700 hover:text-brand-700'
              }`}
              aria-current={accountActive ? 'page' : undefined}
            >
              <UserRound className="h-4 w-4" /> {accountLabel}
            </button>
          </li>
          <li>
            <button
              onClick={() => go(PATHS.order)}
              className="btn-primary ml-2 px-4 py-2"
            >
              <ShoppingBasket className="h-4 w-4" /> Order Fresh
            </button>
          </li>
        </ul>

        <div className="lg:hidden flex items-center gap-2">
          <a
            href="tel:+910000000000"
            className="btn-ghost p-2"
            aria-label="Call JVLSD"
          >
            <Phone className="h-5 w-5" />
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="btn-ghost p-2"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-ink-100 bg-white/95 backdrop-blur-xl shadow-lift animate-fade-in">
          <ul className="container-page flex flex-col py-4 gap-1">
            {NAV.map((item) => {
              const active = route.name === item.route;
              return (
                <li key={item.route}>
                  <button
                    onClick={() => go(item.path)}
                    className={`flex items-center w-full min-h-[48px] rounded-2xl px-4 py-3 text-left text-base font-semibold transition-all ${
                      active
                        ? 'bg-brand-50 text-brand-800 shadow-sm'
                        : 'text-ink-800 hover:bg-ink-50 active:scale-[0.99]'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
            <li className="pt-2">
              <button
                onClick={() => go(accountPath)}
                className="flex items-center gap-2 w-full min-h-[48px] rounded-2xl px-4 py-3 text-left text-base font-semibold text-ink-800 hover:bg-ink-50"
              >
                <UserRound className="h-5 w-5 text-brand-700" />
                {accountLabel}
              </button>
            </li>
            <li className="mt-2 pt-2 border-t border-ink-100">
              <button onClick={() => go(PATHS.order)} className="btn-primary w-full min-h-[48px] text-base">
                <ShoppingBasket className="h-5 w-5" /> Order Fresh Daily
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
