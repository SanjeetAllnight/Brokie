import { useState } from 'react';
import { useGoalsStore } from '../store/useGoalsStore';
import { useCurrency } from '../lib/currencyFormat';

export default function SavingsGoals() {
  const { goals, addGoal, addContribution } = useGoalsStore();
  const { format } = useCurrency();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalIcon, setNewGoalIcon] = useState('🎯');
  const [autoContribute, setAutoContribute] = useState(false);

  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName || !newGoalTarget) return;
    
    addGoal(newGoalName, newGoalIcon, parseFloat(newGoalTarget), autoContribute);
    setIsAddingGoal(false);
    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalIcon('🎯');
    setAutoContribute(false);
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoalId || !contributeAmount) return;
    
    addContribution(contributeGoalId, parseFloat(contributeAmount), 'manual');
    setContributeGoalId(null);
    setContributeAmount('');
  };

  return (
    <>
      <header className="w-full top-0 sticky z-40 bg-background shadow-[0_4px_24px_rgba(75,59,124,0.04)] md:shadow-none">
        <div className="flex items-center justify-between px-container-padding py-base w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">Savings Goals</h1>
          </div>
          <button 
            onClick={() => setIsAddingGoal(true)}
            className="text-primary hover:opacity-80 transition-opacity duration-200 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-3xl mx-auto px-container-padding py-6 flex flex-col gap-6">
        {goals.length === 0 && !isAddingGoal ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[64px] mb-4 opacity-50">savings</span>
            <p className="font-headline-md text-headline-md mb-2">No savings goals yet</p>
            <p className="font-body-md text-sm max-w-[250px] mx-auto">Create a goal to start saving your resisted temptations.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {goals.map((goal) => {
              const progress = Math.min(100, Math.max(0, (goal.currentAmount / goal.targetAmount) * 100));
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
              
              return (
                <div key={goal.id} className="bg-surface-container-lowest rounded-xl p-card-inner shadow-[0_8px_24px_rgba(75,59,124,0.08)] flex flex-col gap-4 border border-surface-variant/50 relative overflow-hidden">
                  {goal.autoContribute && (
                    <div className="absolute top-0 right-0 bg-primary/10 text-primary font-label-caps text-[10px] px-2 py-1 rounded-bl-lg flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                      Auto
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-2xl">
                        {goal.icon}
                      </div>
                      <div>
                        <h3 className="font-headline-md text-lg text-on-surface font-bold">{goal.name}</h3>
                        <p className="font-body-md text-sm text-on-surface-variant">
                          {format(goal.currentAmount)} / {format(goal.targetAmount)}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setContributeGoalId(goal.id)}
                      className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-body-md text-primary font-bold">{progress.toFixed(1)}% complete</span>
                      <span className="font-body-md text-on-surface-variant">{format(remaining)} left</span>
                    </div>
                    <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-inner" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Goal Modal */}
      {isAddingGoal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-md text-xl text-on-surface font-bold">New Goal</h2>
              <button 
                onClick={() => setIsAddingGoal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddGoal} className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="w-16 shrink-0">
                  <label className="font-label-caps text-xs text-on-surface-variant mb-1 block">Icon</label>
                  <input
                    type="text"
                    required
                    value={newGoalIcon}
                    onChange={(e) => setNewGoalIcon(e.target.value)}
                    className="w-full bg-surface-container-low border-0 rounded-lg py-3 px-3 text-center text-xl font-body-lg text-on-surface focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex-1">
                  <label className="font-label-caps text-xs text-on-surface-variant mb-1 block">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vacation Fund"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    className="w-full bg-surface-container-low border-0 rounded-lg py-3 px-4 font-body-lg text-on-surface focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div>
                <label className="font-label-caps text-xs text-on-surface-variant mb-1 block">Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="0.00"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  className="w-full bg-surface-container-low border-0 rounded-lg py-3 px-4 font-body-lg text-on-surface focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <label className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={autoContribute}
                  onChange={(e) => setAutoContribute(e.target.checked)}
                  className="w-5 h-5 rounded border-on-surface-variant text-primary focus:ring-primary"
                />
                <div className="flex flex-col">
                  <span className="font-body-md text-sm text-on-surface font-bold">Auto-Contribute</span>
                  <span className="font-body-md text-xs text-on-surface-variant">Add resisted temptations here automatically</span>
                </div>
              </label>
              
              <button 
                type="submit"
                className="w-full py-4 mt-2 bg-primary text-on-primary rounded-xl font-label-caps text-sm uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Create Goal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {contributeGoalId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-md text-xl text-on-surface font-bold">Add Funds</h2>
              <button 
                onClick={() => setContributeGoalId(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleContribute} className="flex flex-col gap-4">
              <div>
                <label className="font-label-caps text-xs text-on-surface-variant mb-1 block">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="w-full bg-surface-container-low border-0 rounded-lg py-4 px-4 font-headline-md text-2xl text-on-surface focus:ring-2 focus:ring-primary text-center"
                  autoFocus
                />
              </div>
              
              <button 
                type="submit"
                className="w-full py-4 mt-2 bg-primary text-on-primary rounded-xl font-label-caps text-sm uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Add to Goal
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
