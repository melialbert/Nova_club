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
}));

export const useAppStore = create((set) => ({
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSync: null,
  setOnline: (isOnline) => set({ isOnline }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setLastSync: (lastSync) => set({ lastSync }),
}));
