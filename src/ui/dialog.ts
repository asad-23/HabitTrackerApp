import { create } from 'zustand';

export type DialogTone = 'default' | 'warning' | 'success';

export type DialogAction = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

export type DialogConfig = {
  title: string;
  message?: string;
  tone?: DialogTone;
  actions: DialogAction[];
};

type DialogState = {
  dialog: DialogConfig | null;
  show: (dialog: DialogConfig) => void;
  dismiss: () => void;
};

/**
 * One in-app dialog at a time. Messages are drawn by `DialogHost`, so they
 * follow the app's typography and palette instead of the system alert style.
 */
export const useDialogStore = create<DialogState>((set) => ({
  dialog: null,
  show: (dialog) => set({ dialog }),
  dismiss: () => set({ dialog: null }),
}));
