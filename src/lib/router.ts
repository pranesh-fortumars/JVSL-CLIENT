import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'about' }
  | { name: 'shakhwala' }
  | { name: 'fresh-daily' }
  | { name: 'survey' }
  | { name: 'order' }
  | { name: 'contact' }
  | { name: 'login' }
  | { name: 'account' }
  | { name: 'privacy' }
  | { name: 'terms' }
  | { name: 'admin-login' }
  | { name: 'admin' };

const ROUTES: Record<string, Route> = {
  '/': { name: 'home' },
  '/about': { name: 'about' },
  '/shakhwala': { name: 'shakhwala' },
  '/fresh-daily': { name: 'fresh-daily' },
  '/survey': { name: 'survey' },
  '/order': { name: 'order' },
  '/contact': { name: 'contact' },
  '/login': { name: 'login' },
  '/account': { name: 'account' },
  '/privacy': { name: 'privacy' },
  '/terms': { name: 'terms' },
  '/admin/login': { name: 'admin-login' },
  '/admin': { name: 'admin' },
};

export function parseHash(): Route {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  return ROUTES[hash] ?? { name: 'home' };
}

export function navigate(path: string) {
  window.location.hash = path;
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

export const PATHS = {
  home: '/',
  about: '/about',
  shakhwala: '/shakhwala',
  freshDaily: '/fresh-daily',
  survey: '/survey',
  order: '/order',
  contact: '/contact',
  login: '/login',
  account: '/account',
  privacy: '/privacy',
  terms: '/terms',
  adminLogin: '/admin/login',
  admin: '/admin',
} as const;
