import { useSettingsStore } from '../store/useSettingsStore';

// Dictionary of messages
const DICTIONARY = {
  expense: {
    gentle: [
      "Logged! Every penny counts.",
      "Tracked. You're doing great.",
      "Noted. Keeping track is the first step.",
    ],
    sarcastic: [
      "Logged. Hope that was worth it.",
      "Another one? Your wallet is crying.",
      "Tracked. The Broke Meter is watching.",
    ],
    unhinged: [
      "Logged. Are you allergic to saving?",
      "Ouch. Your future self hates you right now.",
      "Tracked it. Prepare to eat instant noodles.",
    ],
  },
  resistance: {
    gentle: [
      "Great job resisting!",
      "Willpower level up!",
      "Your wallet thanks you.",
    ],
    sarcastic: [
      "Wow, you actually said no for once?",
      "Color me impressed. Kept it in your pants.",
      "A rare moment of self-control.",
    ],
    unhinged: [
      "Bout time you stopped hemorrhaging cash.",
      "Congratulations, you did the bare minimum of adulting.",
      "Don't get cocky, you're still broke.",
    ],
  },
  danger_zone: {
    gentle: [
      "You're in the Danger Zone. Time to be careful.",
      "Balance is low. Stick to the essentials.",
    ],
    sarcastic: [
      "Danger Zone reached. Stop swiping.",
      "You're running on fumes. Maybe stop buying coffee?",
    ],
    unhinged: [
      "WEE WOO WEE WOO! You're officially destitute.",
      "Welcome to the Danger Zone. Population: You.",
    ],
  },
};

function getRandomMsg(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRoastMessage(type: 'expense' | 'resistance' | 'danger_zone'): string {
  const intensity = useSettingsStore.getState().roastIntensity;
  return getRandomMsg(DICTIONARY[type][intensity]);
}
