import { create } from 'zustand';
import axios from 'axios';
import { pusherClient } from '@/app/libs/pusher';

interface NotificationStore {
  count: number;
  setCount: (count: number) => void;
  incrementCount: () => void;
  decrementCount: () => void;
  fetchCount: () => Promise<void>;
}

const useNotificationStore = create<NotificationStore>((set) => ({
  count: 0,
  setCount: (count) => set({ count }),
  incrementCount: () => set((state) => ({ count: state.count + 1 })),
  decrementCount: () => set((state) => ({ count: Math.max(0, state.count - 1) })),
  fetchCount: async () => {
    try {
      const response = await axios.get("/api/notifications");
      set({ count: response.data.length });
    } catch (error) {
      console.error("Failed to fetch notifications count:", error);
      set({ count: 0 });
    }
  },
}));

export default useNotificationStore;