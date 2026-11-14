import { useDialogStore, type DialogAction, type DialogTone } from './dialog';

/**
 * Messages are drawn by `DialogHost` so they use the app's own typography,
 * palette, and buttons on every platform, including the browser preview.
 */

export type { DialogAction as ConfirmAction };

export function confirmAction(title: string, message: string, actions: DialogAction[]): void {
  useDialogStore.getState().show({
    title,
    message,
    tone: actions.some((action) => action.style === 'destructive') ? 'warning' : 'default',
    actions,
  });
}

export function notify(title: string, message: string, tone: DialogTone = 'default'): void {
  useDialogStore.getState().show({
    title,
    message,
    tone,
    actions: [{ text: 'Okay' }],
  });
}
