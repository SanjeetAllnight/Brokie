import type { MonthlyWrapData } from './wrapGenerator';
import type { FirestoreSettingsFields } from '../repositories/settingsRepository';

export interface WrapStoryPage {
  id: string;
  title: string;
  body: string;
  highlight: string | null;
  emoji: string;
}

export function generateStoryPages(
  data: MonthlyWrapData,
  roast: FirestoreSettingsFields['roastIntensity'],
  currencyCode: string
): WrapStoryPage[] {
  const pages: WrapStoryPage[] = [];
  const f = (num: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol',
    }).format(num);
  };

  // Page 1: Overview
  let overviewTitle = 'Monthly Debrief';
  let overviewBody = `You spent ${f(data.totalSpent)} this month across ${data.transactionCount} transactions.`;
  if (roast === 'sarcastic') {
    overviewTitle = 'The Damage Report';
    overviewBody = `You managed to blow ${f(data.totalSpent)} in just ${data.transactionCount} swipes. Impressive.`;
  } else if (roast === 'unhinged') {
    overviewTitle = 'Financial Disaster';
    overviewBody = `${f(data.totalSpent)} gone. Poof. Reduced to atoms. Over ${data.transactionCount} separate poor decisions.`;
  }
  pages.push({
    id: 'overview',
    title: overviewTitle,
    body: overviewBody,
    highlight: f(data.totalSpent),
    emoji: '💸'
  });

  // Page 2: Biggest Category
  if (data.biggestCategory) {
    let catTitle = 'Top Spending';
    let catBody = `Your biggest expense was ${data.biggestCategory.label}, eating up ${data.biggestCategory.percentage.toFixed(0)}% of your budget.`;
    if (roast === 'sarcastic') {
      catTitle = 'The Usual Suspect';
      catBody = `${data.biggestCategory.label} took ${data.biggestCategory.percentage.toFixed(0)}% of your money. Did you really need all that?`;
    } else if (roast === 'unhinged') {
      catTitle = 'The Black Hole';
      catBody = `${data.biggestCategory.percentage.toFixed(0)}% on ${data.biggestCategory.label}. You are funding their CEO's yacht at this point.`;
    }
    pages.push({
      id: 'category',
      title: catTitle,
      body: catBody,
      highlight: data.biggestCategory.label,
      emoji: '📊'
    });
  }

  // Page 3: Biggest single expense
  if (data.biggestExpense) {
    pages.push({
      id: 'biggest',
      title: 'Ouch.',
      body: roast === 'unhinged' 
        ? `Your biggest single transaction was ${f(data.biggestExpense.amount)}. I hope it was worth it.` 
        : `Your largest single purchase was ${f(data.biggestExpense.amount)}.`,
      highlight: f(data.biggestExpense.amount),
      emoji: '💳'
    });
  }

  // Page 4: Coffee / Vices
  if (data.coffeeCount > 0) {
    let coffeeBody = `You bought coffee ${data.coffeeCount} times this month.`;
    if (roast === 'sarcastic') {
      coffeeBody = `You bought coffee ${data.coffeeCount} times. Are you immune to caffeine yet?`;
    } else if (roast === 'unhinged') {
      coffeeBody = `${data.coffeeCount} coffees. Apparently caffeine is a personality trait for you now.`;
    }
    pages.push({
      id: 'coffee',
      title: 'Caffeine Check',
      body: coffeeBody,
      highlight: `${data.coffeeCount} times`,
      emoji: '☕'
    });
  }

  // Page 5: Resistance
  if (data.totalResistedAmount > 0) {
    let resTitle = 'Silver Lining';
    let resBody = `You successfully resisted spending ${f(data.totalResistedAmount)}. Great job!`;
    if (roast === 'sarcastic') {
      resTitle = 'Bare Minimum';
      resBody = `You resisted ${f(data.totalResistedAmount)}. I guess that's something.`;
    } else if (roast === 'unhinged') {
      resTitle = 'A Rare W';
      resBody = `Miraculously, you didn't buy ${f(data.totalResistedAmount)} worth of junk. Don't get used to it.`;
    }
    pages.push({
      id: 'resistance',
      title: resTitle,
      body: resBody,
      highlight: f(data.totalResistedAmount),
      emoji: '🛡️'
    });
  }

  // Page 6: Personality
  let pTitle = 'Your Persona';
  let pBody = `Based on your spending, your financial personality is: ${data.personality}.`;
  if (roast === 'sarcastic') {
    pBody = `The algorithm has spoken. You are a certified ${data.personality}. Wear it as a badge of shame.`;
  } else if (roast === 'unhinged') {
    pBody = `Diagnosis: ${data.personality}. There is no known cure.`;
  }
  pages.push({
    id: 'personality',
    title: pTitle,
    body: pBody,
    highlight: data.personality,
    emoji: '🎭'
  });

  return pages;
}
