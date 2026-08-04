import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SyncProvider from './components/SyncProvider';
import ThemeProvider from './components/ThemeProvider';
import OfflineIndicator from './components/OfflineIndicator';
import InstallBanner from './pwa/InstallBanner';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import LogExpense from './pages/LogExpense';
import WorthItCheckIn from './pages/WorthItCheckIn';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import SavingsGoals from './pages/SavingsGoals';
import MonthlyWrap from './pages/MonthlyWrap';
import { usePushNotifications } from './notifications/usePushNotifications';

// Inner component so hooks can access SyncProvider context (auth state)
function AppRoutes() {
  usePushNotifications();
  return (
    <>
      <OfflineIndicator />
      <InstallBanner />
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
