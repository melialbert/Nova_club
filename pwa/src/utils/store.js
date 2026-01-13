import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));

export const useMemberStore = create((set) => ({
  members: [],
  setMembers: (members) => set({ members }),
  addMember: (member) => set((state) => ({ members: [...state.members, member] })),
  updateMember: (updatedMember) => set((state) => ({
    members: state.members.map(m => m.id === updatedMember.id ? updatedMember : m)
  })),
  removeMember: (id) => set((state) => ({
    members: state.members.filter(m => m.id !== id)
  })),
  deleteMember: (id) => set((state) => ({
    members: state.members.filter(m => m.id !== id)
  })),
}));

export const usePaymentStore = create((set) => ({
  payments: [],
  setPayments: (payments) => set({ payments }),
  addPayment: (payment) => set((state) => ({ payments: [...state.payments, payment] })),
  removePayment: (id) => set((state) => ({
    payments: state.payments.filter(p => p.id !== id)
  })),
}));

export const useTransactionStore = create((set) => ({
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) => set((state) => ({
    transactions: [transaction, ...state.transactions].sort((a, b) =>
      new Date(b.transaction_date) - new Date(a.transaction_date)
    )
  })),
  updateTransaction: (updatedTransaction) => set((state) => ({
    transactions: state.transactions.map(t =>
      t.id === updatedTransaction.id ? updatedTransaction : t
    )
  })),
  removeTransaction: (id) => set((state) => ({
    transactions: state.transactions.filter(t => t.id !== id)
  })),
}));

export const useAppStore = create((set) => ({
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSync: null,
  setOnline: (isOnline) => set({ isOnline }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setLastSync: (lastSync) => set({ lastSync }),
}));
