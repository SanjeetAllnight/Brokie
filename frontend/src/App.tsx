import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import SyncProvider from './components/SyncProvider';
import ThemeProvider from './components/ThemeProvider';
import OfflineIndicator from './components/OfflineIndicator';
import InstallBanner from './pwa/InstallBanner';
import MainLayout from './layouts/MainLayout';
import { usePushNotifications } from './notifications/usePushNotifications';

// Lazy loaded routes
const Home = lazy(() => import('./pages/Home'));
const LogExpense = lazy(() => import('./pages/LogExpense'));
const WorthItCheckIn = lazy(() => import('./pages/WorthItCheckIn'));
const Stats = lazy(() => import('./pages/Stats'));
const Settings = lazy(() => import('./pages/Settings'));
const SavingsGoals = lazy(() => import('./pages/SavingsGoals'));
const MonthlyWrap = lazy(() => import('./pages/MonthlyWrap'));

// Suspense fallback
function PageLoader() {
  return (
    <div className="w-full h-screen bg-background flex flex-col items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

// Inner component so hooks can access SyncProvider context (auth state)
function AppRoutes() {
  usePushNotifications();
  return (
    <>
      <OfflineIndicator />
      <InstallBanner />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/goals" element={<SavingsGoals />} />
            <Route path="/log-expense" element={<LogExpense />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          {/* WorthItCheckIn and MonthlyWrap do not use the MainLayout because they are full screen */}
          <Route path="/worth-it" element={<WorthItCheckIn />} />
          <Route path="/wrap" element={<MonthlyWrap />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SyncProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </SyncProvider>
    </ThemeProvider>
  );
}
