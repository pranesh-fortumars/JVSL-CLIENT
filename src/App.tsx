import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useRoute } from '@/lib/router';
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';
import { ShakhwalaPage } from '@/pages/ShakhwalaPage';
import { FreshDailyPage } from '@/pages/FreshDailyPage';
import { OrderPage } from '@/pages/OrderPage';
import { ContactPage } from '@/pages/ContactPage';
import { AdminPage } from '@/pages/AdminPage';
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { LoginPage } from '@/pages/LoginPage';
import { AccountPage } from '@/pages/AccountPage';
import { AuthProvider } from '@/lib/auth';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

function AppRoutes() {
  const route = useRoute();

  if (route.name === 'admin') {
    return <AdminPage />;
  }

  if (route.name === 'admin-login') {
    return <AdminLoginPage />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        {route.name === 'home' && <HomePage />}
        {route.name === 'about' && <AboutPage />}
        {route.name === 'shakhwala' && <ShakhwalaPage />}
        {route.name === 'fresh-daily' && <FreshDailyPage />}
        {route.name === 'survey' && <FreshDailyPage />}
        {route.name === 'order' && <OrderPage />}
        {route.name === 'contact' && <ContactPage />}
        {route.name === 'login' && <LoginPage />}
        {route.name === 'account' && <AccountPage />}
      </main>
      <Footer />
    </div>
  );
}

export default App;
