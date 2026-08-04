import { useState, useMemo } from 'react';
import { useStatistics, useFilteredTransactions } from '../statistics/useStatistics';
import { calcCategoryBreakdown, calcDonutSegments, type DateFilter, type DonutSegment, type CategoryBreakdownItem } from '../statistics/statisticsService';
import { CATEGORIES } from '../types/transaction';
import { useCurrency } from '../lib/currencyFormat';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)    return 'Just now';
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days === 1)  return 'Yesterday';
  return `${days}d ago`;
}

// ─── Donut chart component (CSS conic-gradient) ───────────────────────────────

function DonutChart({ segments, totalFormatted }: {
  segments: { color: string; percentage: number; label: string }[];
  totalFormatted: string;
}) {
  // Build conic-gradient string
  const gradient = useMemo(() => {
    let cursor = 0;
    const stops = segments.map((s) => {
      const start = cursor;
      cursor += s.percentage;
      return `${s.color} ${start.toFixed(1)}% ${cursor.toFixed(1)}%`;
    });
    return stops.length > 0 ? `conic-gradient(${stops.join(', ')})` : 'conic-gradient(hsl(var(--color-surface-container-high)) 0% 100%)';
  }, [segments]);

  return (
    <div className="relative flex items-center justify-center">
      <div
        className="w-40 h-40 rounded-full shadow-inner"
        style={{ background: gradient }}
      />
      {/* Hole */}
      <div className="absolute w-24 h-24 rounded-full bg-surface-container-lowest shadow-[inset_0px_2px_8px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-[9px]">Total Spent</span>
        <span className="font-headline-md text-headline-md text-primary mt-1">{totalFormatted}</span>
      </div>
    </div>
  );
}

// ─── Category icon colours ────────────────────────────────────────────────────

const ICON_STYLE: Record<string, { bg: string; text: string }> = {
  food:      { bg: 'bg-primary/10',    text: 'text-primary' },
  coffee:    { bg: 'bg-secondary/10',  text: 'text-secondary' },
  transport: { bg: 'bg-tertiary/10',   text: 'text-tertiary' },
  shopping:  { bg: 'bg-amber-500/10',  text: 'text-amber-500' },
  gaming:    { bg: 'bg-violet-500/10', text: 'text-violet-500' },
  education: { bg: 'bg-emerald-500/10',text: 'text-emerald-500' },
  other:     { bg: 'bg-slate-400/10',  text: 'text-slate-400' },
};

// ─── Component ────────────────────────────────────────────────────────────────

const PERIOD_TABS: { label: string; value: DateFilter }[] = [
  { label: 'Day',   value: 'day'   },
  { label: 'Week',  value: 'week'  },
  { label: 'Month', value: 'month' },
  { label: 'Year',  value: 'year'  },
];

export default function Stats() {
  const [activePeriod, setActivePeriod] = useState<DateFilter>('month');
  const { format } = useCurrency();

  const stats = useStatistics();

  // Transactions filtered to the active period for the regret log
  const periodTransactions = useFilteredTransactions(activePeriod, 'all', 'newest');

  // Pick breakdown and donut data based on selected period
  const periodBreakdown = useMemo(() => {
    if (activePeriod === 'month') return stats.monthlyBreakdown;
    return calcCategoryBreakdown(periodTransactions);
  }, [activePeriod, stats.monthlyBreakdown, periodTransactions]);

  const periodTotal = useMemo(
    () => periodTransactions.reduce((s, t) => s + t.amount, 0),
    [periodTransactions]
  );

  // Top 2 categories for chart labels
  const top2 = periodBreakdown.slice(0, 2);

  // Regret transactions in this period
  const regretTransactions = useMemo(
    () => periodTransactions.filter((t) => t.regret !== null).slice(0, 5),
    [periodTransactions]
  );

  const donutSegments: DonutSegment[] = useMemo(
    () => calcDonutSegments(periodTransactions),
    [periodTransactions]
  );

  return (
    <>
      <header className="w-full top-0 bg-background dark:bg-background flex items-center justify-between px-container-padding py-base transition-opacity duration-200 sticky z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden">
            <img className="w-full h-full object-cover" alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1gWXTVjcYsBpUfsTZdig7ThePp6PO94y0j_AEOdIPPw0a0a6o4qMcinLFCuLCbC-BIM4fdQ0FfLPM6plczqpXA4cZGcLljPk9lwujkIwpdx9zQAsYA_JYegfy8zA7sx9I8AqkCgZ-GW1NeJ0DvqsMpI-W4pKVlQlHpAZcUJerzmGZbrNcUNj5dOQwJP_QM9s6BLY6fWY2WWOhF7Dx9J8OnMMIdSFPKAGDa_WaxXE2Nn2dL-6xQFUWtQ" />
          </div>
          <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">Brokie</span>
        </div>
        <button className="hover:opacity-80 p-2 rounded-full hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant dark:text-on-surface-variant">notifications</span>
        </button>
      </header>

      <div className="px-container-padding pt-4 pb-8 space-y-8 max-w-3xl mx-auto w-full">

        {/* Period Tabs */}
        <div className="flex p-1 bg-surface-container-high rounded-full w-full max-w-sm mx-auto shadow-sm">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActivePeriod(tab.value)}
              className={`flex-1 py-2 text-center rounded-full font-label-caps text-label-caps transition-colors ${
                activePeriod === tab.value
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Donut Chart Overview */}
        <section className="glass-card rounded-xl p-card-inner flex flex-col items-center justify-center space-y-6">
          <h2 className="font-headline-md text-headline-md text-on-surface capitalize">
            {activePeriod === 'day' ? "Today's" : activePeriod === 'week' ? "This Week's" : activePeriod === 'month' ? 'Monthly' : "This Year's"} Overview
          </h2>

          {periodTotal > 0 ? (
            <div className="relative">
              <DonutChart segments={donutSegments} totalFormatted={format(periodTotal, { maximumFractionDigits: 0 })} />

              {/* Floating category labels */}
              {top2[0] && (
                <div className="absolute -top-4 -left-6 bg-surface px-3 py-1 rounded-full shadow-sm border border-surface-variant flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: donutSegments[0]?.color ?? '#94a3b8' }}></div>
                  <span className="font-label-caps text-label-caps text-on-surface text-[10px]">
                    {top2[0].label} {top2[0].percentage.toFixed(0)}%
                  </span>
                </div>
              )}
              {top2[1] && (
                <div className="absolute top-1/2 -right-12 transform -translate-y-1/2 bg-surface px-3 py-1 rounded-full shadow-sm border border-surface-variant flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: donutSegments[1]?.color ?? '#94a3b8' }}></div>
                  <span className="font-label-caps text-label-caps text-on-surface text-[10px]">
                    {top2[1].label} {top2[1].percentage.toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] opacity-30">bar_chart</span>
              <p className="font-body-md text-body-md">No spending yet for this period</p>
            </div>
          )}

          {/* Category Legend */}
          {periodBreakdown.length > 0 && (
            <div className="w-full flex flex-col gap-2">
              {periodBreakdown.map((item: CategoryBreakdownItem) => {
                const style = ICON_STYLE[item.category] ?? ICON_STYLE.other;
                return (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full ${style.bg} flex items-center justify-center`}>
                        <span className={`material-symbols-outlined text-[14px] ${style.text}`}>
                          {CATEGORIES.find((c) => c.id === item.category)?.icon ?? 'receipt'}
                        </span>
                      </div>
                      <span className="font-body-md text-body-md text-on-surface">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">{item.percentage.toFixed(0)}%</span>
                      <span className="font-body-md text-body-md text-on-surface font-bold">{format(item.total)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Top Movers */}
        <section className="space-y-4">
          <h3 className="font-body-lg text-body-lg text-on-surface px-2">Top Movers</h3>
          {stats.topCategories.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-container-padding px-container-padding snap-x">
              {stats.topCategories.map((mover, idx) => {
                const style = ICON_STYLE[mover.category] ?? ICON_STYLE.other;
                const isUp  = idx < 2; // simple visual — top 2 are "up" movers
                return (
                  <div key={mover.category} className="snap-center shrink-0 w-48 glass-card rounded-lg p-4 flex flex-col gap-3 border border-outline-variant">
                    <div className="flex justify-between items-start">
                      <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center`}>
                        <span className={`material-symbols-outlined ${style.text}`}>
                          {CATEGORIES.find((c) => c.id === mover.category)?.icon ?? 'receipt'}
                        </span>
                      </div>
                      <div className={`px-2 py-1 rounded-full flex items-center gap-1 ${isUp ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-on-surface'}`}>
                        <span className="material-symbols-outlined text-[14px]">{isUp ? 'arrow_upward' : 'arrow_downward'}</span>
                        <span className="font-label-caps text-label-caps text-[10px]">{mover.percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-body-md text-body-md text-on-surface-variant">{mover.label}</p>
                      <p className="font-headline-md text-headline-md text-on-surface">{format(mover.total, { maximumFractionDigits: 0 })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-body-md text-body-md text-on-surface-variant px-2">No transactions yet.</p>
          )}
        </section>

        {/* Regret Log */}
        <section className="glass-card rounded-xl p-card-inner space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-body-lg text-body-lg text-on-surface">Regret Log</h3>
            <div className="flex items-center gap-2">
              {stats.regret.instantRegretCount > 0 && (
                <span className="font-label-caps text-label-caps text-error bg-error-container px-2 py-0.5 rounded-full">
                  {stats.regret.regretPercentage.toFixed(0)}% regret rate
                </span>
              )}
            </div>
          </div>

          {regretTransactions.length > 0 ? (
            <div className="space-y-3">
              {regretTransactions.map((tx) => {
                const cat = CATEGORIES.find((c) => c.id === tx.category);
                const isRegret = tx.regret === 'instant_regret';
                return (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg border border-surface-variant">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{isRegret ? '😬' : '😌'}</div>
                      <div>
                        <p className="font-body-md text-body-md text-on-surface font-medium">
                          {tx.note || cat?.label || tx.category}
                        </p>
                        <p className="font-label-caps text-label-caps text-on-surface-variant">
                          {formatRelativeTime(tx.timestamp)}
                        </p>
                      </div>
                    </div>
                    <span className={`font-body-lg text-body-lg font-bold ${isRegret ? 'text-error' : 'text-on-surface'}`}>
                      -{format(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4 text-on-surface-variant">
              <span className="text-2xl">😌</span>
              <p className="font-body-md text-body-md">No regrets logged this period.</p>
            </div>
          )}

          {/* Resistance summary */}
          {stats.resistance.temptationCount > 0 && (
            <div className="mt-4 p-3 bg-secondary/5 rounded-lg border border-secondary/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">😤</span>
                <div>
                  <p className="font-body-md text-body-md text-on-surface font-medium">Resisted {stats.resistance.temptationCount} temptations</p>
                  <p className="font-label-caps text-label-caps text-secondary">Saved {format(stats.resistance.totalResistedAmount)}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-secondary fill">shield</span>
            </div>
          )}
        </section>

        {/* Spending Summary Cards */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-card-inner flex flex-col gap-1 shadow-sm">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">This Week</span>
            <span className="font-headline-md text-headline-md text-on-surface">{format(stats.spending.weekTotal)}</span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-card-inner flex flex-col gap-1 shadow-sm">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">This Month</span>
            <span className="font-headline-md text-headline-md text-on-surface">{format(stats.spending.monthTotal)}</span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-card-inner flex flex-col gap-1 shadow-sm">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Avg Daily</span>
            <span className="font-headline-md text-headline-md text-on-surface">{format(stats.spending.averageDaily)}</span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-card-inner flex flex-col gap-1 shadow-sm">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">All Time</span>
            <span className="font-headline-md text-headline-md text-on-surface">{format(stats.spending.allTimeTotal)}</span>
          </div>
        </section>

      </div>
    </>
  );
}
