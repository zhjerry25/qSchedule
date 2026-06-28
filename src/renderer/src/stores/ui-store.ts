import { create } from 'zustand'
import type { View } from '../lib/constants'

interface UIState {
  // ── Navigation ──
  activeView: View
  setActiveView: (view: View) => void

  // ── Tag Filter (Phase 5) ──
  selectedTagIds: string[]
  toggleTagFilter: (tagId: string) => void
  clearTagFilters: () => void

  // ── Dialog Visibility ──
  isCreateDialogOpen: boolean
  openCreateDialog: () => void
  closeCreateDialog: () => void

  // ── Settings ──
  isSettingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void
}

export const useUIStore = create<UIState>((set) => ({
  // Navigation
  activeView: 'today',
  setActiveView: (view) => set({ activeView: view }),

  // Tag filter
  selectedTagIds: [],
  toggleTagFilter: (tagId) =>
    set((state) => ({
      selectedTagIds: state.selectedTagIds.includes(tagId)
        ? state.selectedTagIds.filter((id) => id !== tagId)
        : [...state.selectedTagIds, tagId],
    })),
  clearTagFilters: () => set({ selectedTagIds: [] }),

  // Dialogs
  isCreateDialogOpen: false,
  openCreateDialog: () => set({ isCreateDialogOpen: true }),
  closeCreateDialog: () => set({ isCreateDialogOpen: false }),

  // Settings
  isSettingsOpen: false,
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
}))
