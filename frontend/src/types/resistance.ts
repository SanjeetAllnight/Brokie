// Resisted Temptation types — structured for Firestore compatibility.
// When migrating: this model maps to a dedicated "temptations" collection.

export interface ResistedTemptation {
  id: string;
  itemName: string;           // What the user resisted (e.g. "Avocado Toast")
  estimatedAmount: number;    // How much they would have spent (always > 0)
  timestamp: number;          // Unix timestamp (ms)
}
