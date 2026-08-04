import { useDashboardStats } from '../statistics/useStatistics';
import { useCurrency } from '../lib/currencyFormat';
import { getRoastMessage } from '../lib/roastEngine';

export default function Home() {
  const {
    currentBalance,
    todaySpend,
    weekTotal,
    monthTotal,
    walletHP,
    dangerZoneAmount,
    dangerZoneDirection,
    brokeMeterStatus,
    brokeMeterIcon,
    estimatedSurvivalDays,
    averageDailySpend,
  } = useDashboardStats();

  const { format } = useCurrency();

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-40 bg-background/80 backdrop-blur-md flex items-center justify-between px-container-padding py-base shadow-sm">
        <div className="flex flex-col">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Good Morning 👋</span>
          <span className="font-headline-md text-headline-md font-bold text-primary">Brokie</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:opacity-80 transition-opacity duration-200">
            <span className="material-symbols-outlined text-primary">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
            <img className="w-full h-full object-cover" alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPcXMG5lKpofrsQQ9Qkzyx7f5oDigxagkNQzO2Lp1Rl62wnBrIdBaHNweXo8Soqhy2CccPvaHZ_kM2TUL9W5wbn206_Oq1NC56S8bSKtjwX1z7vR_pkGd-Uykd08fxpAK1uUU0UHmFaHO4-MDtzy7ltTf79rFgUpVHMABbbB62gs8J3veyGjZ13xIpwKBzM5_0l7GFTjF0A2FDjKEStr7ov_QIfkGbUMpIOLi5z8XebUjAEEMU6m4b5g" />
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-stack-gap mt-4 w-full">
        {/* Balance + HP Card */}
        <section className="bg-surface-container-lowest rounded-xl p-card-inner shadow-[0px_8px_24px_rgba(75,59,124,0.08)] flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex justify-between items-start z-10">
            <div>
              <h2 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Current Stash</h2>
              <div className="font-display-currency text-display-currency text-on-surface mt-1">{format(currentBalance)}</div>
            </div>
            <div className="bg-primary-container text-on-primary-container font-label-caps text-label-caps px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <span className="material-symbols-outlined text-[16px] fill">local_fire_department</span>
              {averageDailySpend > 0 ? `~${format(averageDailySpend, { maximumFractionDigits: 0 })}/day` : 'Tracking…'}
            </div>
          </div>

          <div className="flex flex-col gap-2 z-10 mt-2">
            <div className="flex justify-between items-center">
              <span className="font-body-md text-body-md font-bold text-on-surface">Financial Health</span>
              <span className="font-label-caps text-label-caps text-primary">{Math.round(walletHP)}% HP</span>
            </div>
            <div className="w-full h-3 bg-secondary/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-primary-container rounded-full transition-all duration-1000 ease-out shadow-inner" style={{ width: `${walletHP}%` }}></div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          {/* Danger Zone */}
          <div className="col-span-2 bg-surface-container-lowest rounded-xl p-card-inner shadow-[0px_8px_24px_rgba(75,59,124,0.08)] flex items-center justify-between border-l-4 border-error">
            <div>
              <div className="font-label-caps text-label-caps text-error uppercase mb-1">Danger Zone</div>
              <div className="font-headline-md text-headline-md text-on-surface font-bold">
                {format(parseFloat(dangerZoneAmount))} <span className="text-body-md font-normal text-on-surface-variant">{dangerZoneDirection}</span>
              </div>
              {brokeMeterStatus === 'Danger Zone' && (
                <div className="text-xs text-error mt-1 italic">{getRoastMessage('danger_zone')}</div>
              )}
            </div>
            <div className="bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant flex items-center gap-2">
              <span className="text-lg">{brokeMeterIcon}</span>
              <span className="font-label-caps text-label-caps text-on-surface">{brokeMeterStatus}</span>
            </div>
          </div>

          {/* Spent Today */}
          <div className="bg-surface-container-lowest rounded-xl p-card-inner shadow-[0px_8px_24px_rgba(75,59,124,0.08)] flex flex-col gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <span className="material-symbols-outlined fill">payments</span>
            </div>
            <div className="font-label-caps text-label-caps text-on-surface-variant uppercase">Spent Today</div>
            <div className="font-headline-md text-headline-md text-on-surface">{format(todaySpend)}</div>
          </div>

          {/* Survival Days */}
          <div className="bg-surface-container-lowest rounded-xl p-card-inner shadow-[0px_8px_24px_rgba(75,59,124,0.08)] flex flex-col gap-2">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-2">
              <span className="material-symbols-outlined fill">verified_user</span>
            </div>
            <div className="font-label-caps text-label-caps text-on-surface-variant uppercase">Survival</div>
            <div className="font-headline-md text-headline-md text-on-surface">{estimatedSurvivalDays} Days</div>
          </div>

          {/* This Week */}
          <div className="bg-surface-container-lowest rounded-xl p-card-inner shadow-[0px_8px_24px_rgba(75,59,124,0.08)] flex flex-col gap-2">
            <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary mb-2">
              <span className="material-symbols-outlined fill">calendar_view_week</span>
            </div>
            <div className="font-label-caps text-label-caps text-on-surface-variant uppercase">This Week</div>
            <div className="font-headline-md text-headline-md text-on-surface">{format(weekTotal)}</div>
          </div>

          {/* This Month */}
          <div className="bg-surface-container-lowest rounded-xl p-card-inner shadow-[0px_8px_24px_rgba(75,59,124,0.08)] flex flex-col gap-2">
            <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error mb-2">
              <span className="material-symbols-outlined fill">calendar_month</span>
            </div>
            <div className="font-label-caps text-label-caps text-on-surface-variant uppercase">This Month</div>
            <div className="font-headline-md text-headline-md text-on-surface">{format(monthTotal)}</div>
          </div>
        </section>
      </main>
    </>
  );
}
