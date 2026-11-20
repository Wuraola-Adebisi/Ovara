import type { Dispatch, SetStateAction } from 'react';
import { useToast } from '../components/Toast';

/** Removes an item at once and offers Undo, so deleting never needs a confirmation prompt. */
export function useUndoRemove<T extends { id: number }>(items: T[], setItems: Dispatch<SetStateAction<T[]>>) {
  const toast = useToast();
  return (id: number, label: string) => {
    const index = items.findIndex(item => item.id === id);
    if (index < 0) return;
    const removed = items[index];
    setItems(current => current.filter(item => item.id !== id));
    toast.show('Removed ' + label, {
      label: 'Undo',
      run: () => setItems(current => current.some(item => item.id === id) ? current : [...current.slice(0, index), removed, ...current.slice(index)]),
    });
  };
}
