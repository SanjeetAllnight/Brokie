import { useWalletStore } from '../store/useWalletStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useProfileStore } from '../store/useProfileStore';
import { CURRENCIES } from '../lib/currencyFormat';
import DeveloperSettings from '../components/DeveloperSettings';
import { usePushNotifications } from '../notifications/usePushNotifications';
import { isNotificationSupported } from '../notifications/notificationService';

export default function Settings() {
  const dangerZoneThreshold = useWalletStore((state) => state.dangerZoneThreshold);
  const setDangerZoneThreshold = useWalletStore((state) => state.setDangerZoneThreshold);

  const {
    roastIntensity, setRoastIntensity,
    notificationsEnabled, setNotificationsEnabled,
    notificationTime, setNotificationTime,
    theme, setTheme
  } = useSettingsStore();

  const { currency, setCurrency } = useProfileStore();
  const { permissionStatus, requestPermission } = usePushNotifications();
  const notificationsSupported = isNotificationSupported();
  const permissionDenied = permissionStatus === 'denied';

  const handleNotificationsToggle = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    if (enabled && permissionStatus !== 'granted') {
      await requestPermission();
    }
  };
  return (
    <>
      <header className="w-full top-0 sticky z-40 bg-background shadow-[0_4px_24px_rgba(75,59,124,0.04)] md:shadow-none">
        <div className="flex items-center justify-between px-container-padding py-base w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
              <img alt="User Profile Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAu_3EzqxPUnNNuk6yoiDdXzbpIBiMHFvxLzjxL-JQvGk4_aqUSEG-epDrMK0qHESfMqzZT2Dca-hTfcbL8HaRWec4bJTh8s1I7ktn17jWZjWoLUfpDP97aa0C0SSCcN4akSLRQE6RSe73dZQykVKIaupqnXDfie3JcpD8JC2ov4SPj3ahU1Yt7t8ygMKqIbA6IG_SBOn9JbWL2r_OPFNHW7c5wNRn7qprunTjXeGWTAlHGirBeWm6-Og" />
            </div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">Brokie</h1>
          </div>
          <button className="text-primary hover:opacity-80 transition-opacity duration-200 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low md:bg-transparent">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>
      
      <div className="w-full max-w-3xl mx-auto px-container-padding py-6 flex flex-col gap-stack-gap">
        <div className="mb-4">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Settings</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Tweak your survival parameters.</p>
        </div>
        
        <section className="bg-surface-container-lowest rounded-DEFAULT p-card-inner shadow-[0px_8px_24px_rgba(75,59,124,0.08)] border border-surface-variant/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div>
              <h3 className="font-headline-md text-[20px] leading-[28px] font-bold text-on-surface">Roast Intensity</h3>
              <p className="font-body-md text-sm text-on-surface-variant">How mean should Brokie be?</p>
            </div>
          </div>
          
          <div className="segmented-control flex bg-surface-container-low p-1 rounded-full w-full">
            {(['gentle', 'sarcastic', 'unhinged'] as const).map((intensity) => (
              <div key={intensity} className="flex-1 relative">
                <input
                  checked={roastIntensity === intensity}
                  onChange={() => setRoastIntensity(intensity)}
                  className="sr-only"
                  id={`roast-${intensity}`}
                  name="roast"
                  type="radio"
                />
                <label
                  className={`cursor-pointer w-full text-center py-2 px-4 rounded-full font-body-md text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    roastIntensity === intensity
                      ? 'bg-surface shadow-sm text-on-surface'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                  htmlFor={`roast-${intensity}`}
                >
                  <span className="capitalize">
                    {intensity === 'gentle' ? '😇' : intensity === 'sarcastic' ? '😏' : '🔥'} {intensity}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </section>
        
        <section className="bg-surface-container-lowest rounded-DEFAULT p-card-inner shadow-[0px_8px_24px_rgba(75,59,124,0.08)] border border-surface-variant/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-error-container/20 to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <h3 className="font-headline-md text-[20px] leading-[28px] font-bold text-on-surface">Danger Zone</h3>
                <p className="font-body-md text-sm text-on-surface-variant">Alert me when balance drops below</p>
              </div>
            </div>
            <div className="relative flex items-center mt-2">
              <span className="absolute left-4 font-headline-md text-[20px] text-on-surface-variant font-bold">$</span>
              <input 
                className="w-full bg-surface-container-low border-0 rounded-lg py-4 pl-10 pr-4 font-body-lg text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-colors shadow-inner" 
                placeholder="0.00" 
                type="number" 
                value={dangerZoneThreshold}
                onChange={(e) => setDangerZoneThreshold(Number(e.target.value))}
              />
            </div>
          </div>
        </section>
        
        <section className="bg-surface-container-lowest rounded-DEFAULT overflow-hidden shadow-[0px_8px_24px_rgba(75,59,124,0.08)] border border-surface-variant/50">
          <div className="p-card-inner border-b border-surface-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                  <span className="material-symbols-outlined">notifications_active</span>
                </div>
                <div>
                  <h3 className="font-body-lg text-on-surface">Daily Reality Check</h3>
                  <p className="font-body-md text-sm text-on-surface-variant">Push notifications</p>
                </div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                <input
                  checked={notificationsEnabled}
                  onChange={(e) => handleNotificationsToggle(e.target.checked)}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-surface-variant transition-transform duration-200 z-10"
                  id="toggle-notifications"
                  name="toggle"
                  type="checkbox"
                  disabled={!notificationsSupported}
                />
                <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ${notificationsEnabled ? 'bg-primary' : 'bg-surface-variant'}`} htmlFor="toggle-notifications"></label>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pl-[52px]">
              <span className="material-symbols-outlined text-on-surface-variant text-sm">schedule</span>
              <input
                className="bg-surface-container-low border-0 rounded-md py-1 px-3 font-body-md text-sm text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-colors"
                type="time"
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
                disabled={!notificationsEnabled || permissionDenied}
              />
            </div>
            {/* Permission denied warning */}
            {permissionDenied && notificationsEnabled && (
              <div className="mt-2 px-3 py-2 bg-error-container/30 text-error rounded-lg font-body-md text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">block</span>
                Notifications are blocked. Enable them in your browser settings.
              </div>
            )}
          </div>
          
          <div className="p-card-inner border-b border-surface-variant/30 flex items-center justify-between hover:bg-surface-container-low transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-inverse-surface flex items-center justify-center text-inverse-on-surface">
                <span className="material-symbols-outlined">dark_mode</span>
              </div>
              <h3 className="font-body-lg text-on-surface">Theme</h3>
            </div>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value as any)}
              className="bg-surface-container px-3 py-1.5 rounded-lg border border-surface-variant text-on-surface font-body-md"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          
          <div className="p-card-inner border-b border-surface-variant/30 flex items-center justify-between hover:bg-surface-container-low transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined">currency_exchange</span>
              </div>
              <h3 className="font-body-lg text-on-surface">Default Currency</h3>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-surface-container px-3 py-1.5 rounded-lg border border-surface-variant text-on-surface font-body-md"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                ))}
              </select>
            </div>
          </div>
          
          <a className="p-card-inner border-b border-surface-variant/30 flex items-center justify-between hover:bg-surface-container-low transition-colors group" href="#">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined">download</span>
              </div>
              <h3 className="font-body-lg text-on-surface">Export Data</h3>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
          </a>
          
          <a className="p-card-inner flex items-center justify-between hover:bg-surface-container-low transition-colors group" href="#">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined">info</span>
              </div>
              <div>
                <h3 className="font-body-lg text-on-surface">About</h3>
                <p className="font-body-md text-xs text-on-surface-variant">v1.4.2</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
          </a>
        </section>
        
        <DeveloperSettings />
      </div>
    </>
  );
}
