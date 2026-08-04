// useFirebaseSync — the single Firebase integration hook.
//
// Responsibilities:
// 1. Sign the user in anonymously (or reuse existing session)
// 2. Ensure Firestore documents exist with defaults for new users
// 3. Subscribe to Firestore (wallet, transactions, resistedTemptations)
//    and hydrate the matching Zustand stores
// 4. Wire store actions so writes also propagate to Firestore
//
// This hook is mounted ONCE in SyncProvider.tsx.
// No Firebase code lives anywhere else.

import { useEffect, useRef } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { setDoc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase/firebaseApp';
import { userDocRef } from '../firebase/firestoreHelpers';
import {
  ensureProfile,
  subscribeProfile,
  writeProfile,
} from '../repositories/profileRepository';
import {
  subscribeWallet,
  writeWallet,
  DEFAULT_WALLET,
  type FirestoreWalletFields,
} from '../repositories/walletRepository';
import {
  subscribeSettings,
  writeSettings,
  DEFAULT_SETTINGS,
} from '../repositories/settingsRepository';
import {
  addTransaction,
  updateTransactionRegret,
  subscribeTransactions,
} from '../repositories/transactionRepository';
import {
  addTemptation,
  subscribeTemptations,
} from '../repositories/resistanceRepository';
import {
  ensureProgression,
  subscribeProgression,
  writeProgression,
} from '../repositories/progressionRepository';
import {
  subscribeGoals,
  subscribeContributions,
  addGoal,
  updateGoal,
  deleteGoal,
  addContribution,
} from '../repositories/goalsRepository';
import { useAuthStore } from '../store/useAuthStore';
import { useWalletStore } from '../store/useWalletStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useResistanceStore } from '../store/useResistanceStore';
import { useProgressionStore } from '../store/useProgressionStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useProfileStore } from '../store/useProfileStore';
import { useGoalsStore } from '../store/useGoalsStore';
import {
  evaluateTransaction,
  evaluateRegretUpdate,
  evaluateResistance,
} from '../progression/engine';

export function useFirebaseSync() {
  const setUid       = useAuthStore((s) => s.setUid);
  const setAuthLoading = useAuthStore((s) => s.setAuthLoading);
  const setAuthError = useAuthStore((s) => s.setAuthError);

  // Track whether Firestore has returned its first snapshot for each store.
  // Prevents write-through from firing before we've received the initial data.
  const walletHydrated      = useRef(false);
  const txHydrated          = useRef(false);
  const temptationHydrated  = useRef(false);
  const progressionHydrated = useRef(false);
  const settingsHydrated    = useRef(false);
  const profileHydrated     = useRef(false);
  const goalsHydrated       = useRef(false);
  const contributionsHydrated = useRef(false);

  // Keep uid available inside callbacks without re-mounting
  const uidRef = useRef<string | null>(null);

  useEffect(() => {
    setAuthLoading(true);

    // ─── Auth ─────────────────────────────────────────────────────────────
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          // No session — sign in anonymously
          try {
            await signInAnonymously(auth);
            // onAuthStateChanged will fire again with the new user
          } catch (err) {
            console.error('[Auth] Anonymous sign-in failed:', err);
            setAuthError('Sign-in failed. Please check your connection.');
          }
          return;
        }

        const uid = user.uid;
        uidRef.current = uid;
        setUid(uid);

        // ─── First-time setup ──────────────────────────────────────────────
        try {
          await ensureProfile(uid);
          await ensureProgression(uid);

          // Write default wallet + settings only if the document is brand new.
          // ensureProfile already guards against overwrite via getDoc check.
          const userRef = userDocRef(uid);
          const snap = await getDoc(userRef);
          const data = snap.data() ?? {};

          // Only write defaults for fields that don't exist yet
          const walletDefaults: Partial<FirestoreWalletFields> = {};
          (Object.keys(DEFAULT_WALLET) as (keyof FirestoreWalletFields)[]).forEach((key) => {
            if (data[key] === undefined) {
              (walletDefaults as Record<string, unknown>)[key] = DEFAULT_WALLET[key];
            }
          });

          const settingsDefaults: Record<string, unknown> = {};
          (Object.keys(DEFAULT_SETTINGS) as (keyof typeof DEFAULT_SETTINGS)[]).forEach((key) => {
            if (data[key] === undefined) {
              settingsDefaults[key] = DEFAULT_SETTINGS[key];
            }
          });

          const mergedDefaults = { ...walletDefaults, ...settingsDefaults };
          if (Object.keys(mergedDefaults).length > 0) {
            await setDoc(userRef, mergedDefaults, { merge: true });
          }
        } catch (err) {
          console.error('[Firestore] First-time setup failed:', err);
        }

        // ─── Wallet snapshot → hydrate store ──────────────────────────────
        const unsubWallet = subscribeWallet(
          uid,
          (walletFields) => {
            walletHydrated.current = true;
            useWalletStore.getState().hydrateWallet(walletFields);
          },
          (err) => console.error('[Firestore] Wallet subscription error:', err)
        );

        // ─── Profile snapshot → hydrate store ──────────────────────────────
        const unsubProfile = subscribeProfile(
          uid,
          (profileFields) => {
            profileHydrated.current = true;
            useProfileStore.getState().hydrateProfile(profileFields);
          },
          (err) => console.error('[Firestore] Profile subscription error:', err)
        );

        // ─── Settings snapshot → hydrate store ──────────────────────────────
        const unsubSettings = subscribeSettings(
          uid,
          (settingsFields) => {
            settingsHydrated.current = true;
            useSettingsStore.getState().hydrateSettings(settingsFields);
          },
          (err) => console.error('[Firestore] Settings subscription error:', err)
        );

        // ─── Transactions snapshot → hydrate store ────────────────────────
        const unsubTransactions = subscribeTransactions(
          uid,
          (transactions) => {
            txHydrated.current = true;
            useTransactionStore.getState().hydrateTransactions(transactions);
          },
          (err) => console.error('[Firestore] Transactions subscription error:', err)
        );

        // ─── Temptations snapshot → hydrate store ─────────────────────────
        const unsubTemptations = subscribeTemptations(
          uid,
          (temptations) => {
            temptationHydrated.current = true;
            useResistanceStore.getState().hydrateTemptations(temptations);
          },
          (err) => console.error('[Firestore] Temptations subscription error:', err)
        );

        // ─── Progression snapshot → hydrate store ─────────────────────────
        const unsubProgression = subscribeProgression(
          uid,
          (progState) => {
            progressionHydrated.current = true;
            useProgressionStore.getState().hydrateProgression(progState);
          },
          (err) => console.error('[Firestore] Progression subscription error:', err)
        );

        // ─── Goals & Contributions snapshots → hydrate store ────────────────
        const unsubGoals = subscribeGoals(
          uid,
          (goals) => {
            goalsHydrated.current = true;
            useGoalsStore.getState().hydrateGoals(goals);
          },
          (err) => console.error('[Firestore] Goals subscription error:', err)
        );

        const unsubContributions = subscribeContributions(
          uid,
          (contributions) => {
            contributionsHydrated.current = true;
            useGoalsStore.getState().hydrateContributions(contributions);
          },
          (err) => console.error('[Firestore] Contributions subscription error:', err)
        );

        // ─── Write-through: logExpense ─────────────────────────────────────
        // Patch store action to also write to Firestore after local update.
        const originalLogExpense = useTransactionStore.getState().logExpense;
        useTransactionStore.setState({
          logExpense: (amount, category, note) => {
            const id = originalLogExpense(amount, category, note);
            // Write the transaction to Firestore
            const tx = useTransactionStore
              .getState()
              .transactions.find((t) => t.id === id);
            if (tx) {
              if (txHydrated.current) {
                addTransaction(uid, tx).catch(console.error);
              }
              // Progress Engine Evaluation
              evaluateTransaction(tx);
            }
            // Write updated wallet balance to Firestore
            const { currentBalance, todaySpend } = useWalletStore.getState();
            if (walletHydrated.current) {
              writeWallet(uid, {
                currentBalance: currentBalance - amount,
                todaySpend: todaySpend + amount,
              }).catch(console.error);
            }
            return id;
          },
        });

        // ─── Write-through: setRegret ──────────────────────────────────────
        const originalSetRegret = useTransactionStore.getState().setRegret;
        useTransactionStore.setState({
          setRegret: (id, status) => {
            originalSetRegret(id, status);
            if (txHydrated.current) {
              updateTransactionRegret(uid, id, status).catch(console.error);
            }
            // Progress Engine Evaluation
            evaluateRegretUpdate(id, status);
          },
        });

        // ─── Write-through: setDangerZoneThreshold ────────────────────────
        const originalSetDangerZone = useWalletStore.getState().setDangerZoneThreshold;
        useWalletStore.setState({
          setDangerZoneThreshold: (amount) => {
            originalSetDangerZone(amount);
            if (walletHydrated.current) {
              writeWallet(uid, { dangerZoneThreshold: amount }).catch(console.error);
            }
          },
        });

        // ─── Write-through: logTemptation ──────────────────────────────────
        const originalLogTemptation = useResistanceStore.getState().logTemptation;
        useResistanceStore.setState({
          logTemptation: (itemName, estimatedAmount) => {
            const id = originalLogTemptation(itemName, estimatedAmount);
            const temptation = useResistanceStore
              .getState()
              .temptations.find((t) => t.id === id);
            if (temptation) {
              if (temptationHydrated.current) {
                addTemptation(uid, temptation).catch(console.error);
              }
              // Progress Engine Evaluation
              evaluateResistance(temptation);
              
              // Goals Auto-Contribution
              const autoGoals = useGoalsStore.getState().goals.filter(g => g.autoContribute);
              if (autoGoals.length > 0) {
                // Find a goal to contribute to (e.g. the first one with autoContribute)
                const targetGoal = autoGoals[0];
                const addContrib = useGoalsStore.getState().addContribution;
                addContrib(targetGoal.id, estimatedAmount, 'resisted_temptation');
              }
            }
            return id;
          },
        });

        // ─── Write-through: progression ────────────────────────────────────
        // Subscribe to progression store changes to write to Firestore
        const unsubProgressionStore = useProgressionStore.subscribe((state) => {
          if (progressionHydrated.current) {
            writeProgression(uid, {
              xp: state.xp,
              streaks: state.streaks,
              quests: state.quests,
              achievements: state.achievements,
            }).catch(console.error);
          }
        });

        // ─── Write-through: settings ───────────────────────────────────────
        const unsubSettingsStore = useSettingsStore.subscribe((state) => {
          if (settingsHydrated.current) {
            writeSettings(uid, {
              roastIntensity: state.roastIntensity,
              notificationsEnabled: state.notificationsEnabled,
              notificationTime: state.notificationTime,
              theme: state.theme,
            }).catch(console.error);
          }
        });

        // ─── Write-through: profile ────────────────────────────────────────
        const unsubProfileStore = useProfileStore.subscribe((state) => {
          if (profileHydrated.current) {
            writeProfile(uid, {
              currency: state.currency,
            }).catch(console.error);
          }
        });

        // ─── Write-through: goals ───────────────────────────────────────────
        // We only patch the actions for goals since they are individual documents
        const { 
          addGoal: originalAddGoal, 
          updateGoal: originalUpdateGoal, 
          deleteGoal: originalDeleteGoal, 
          addContribution: originalAddContribution 
        } = useGoalsStore.getState();

        useGoalsStore.setState({
          addGoal: (name, icon, targetAmount, autoContribute) => {
            const id = originalAddGoal(name, icon, targetAmount, autoContribute);
            const goal = useGoalsStore.getState().goals.find((g) => g.id === id);
            if (goal && goalsHydrated.current) {
              addGoal(uid, goal).catch(console.error);
            }
            return id;
          },
          updateGoal: (id, updates) => {
            originalUpdateGoal(id, updates);
            const goal = useGoalsStore.getState().goals.find((g) => g.id === id);
            if (goal && goalsHydrated.current) {
              updateGoal(uid, goal).catch(console.error);
            }
          },
          deleteGoal: (id) => {
            originalDeleteGoal(id);
            if (goalsHydrated.current) {
              deleteGoal(uid, id).catch(console.error);
            }
          },
          addContribution: (goalId, amount, source) => {
            const id = originalAddContribution(goalId, amount, source);
            const contribution = useGoalsStore.getState().contributions.find((c) => c.id === id);
            if (contribution && contributionsHydrated.current) {
              addContribution(uid, contribution).catch(console.error);
            }
            // Update the goal amount in firestore
            const goal = useGoalsStore.getState().goals.find((g) => g.id === goalId);
            if (goal && goalsHydrated.current) {
              updateGoal(uid, goal).catch(console.error);
            }
            return id;
          }
        });

        // ─── Cleanup subscriptions on unmount ─────────────────────────────
        return () => {
          unsubWallet();
          unsubSettings();
          unsubTransactions();
          unsubTemptations();
          unsubProgression();
          unsubProgressionStore();
          unsubSettingsStore();
          unsubProfile();
          unsubProfileStore();
          unsubGoals();
          unsubContributions();
        };
      },
      (err) => {
        console.error('[Auth] onAuthStateChanged error:', err);
        setAuthError('Authentication error. Please refresh.');
      }
    );

    return () => {
      unsubscribeAuth();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mount once only
}
