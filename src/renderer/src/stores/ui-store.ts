import { create } from 'zustand'
import type { TaskWithTags } from '@shared/task'

export type ActiveView = 'tasks' | 'gantt'

interface UIState {
  // ── View Navigation ──
  activeView: ActiveView
  setActiveView: (view: ActiveView) => void

  // ── Tag Filter ──
  selectedTagIds: string[]
  toggleTagFilter: (tagId: string) => void
  clearTagFilters: () => void

  // ── Dialog Visibility ──
  isCreateDialogOpen: boolean
  openCreateDialog: () => void
  closeCreateDialog: () => void

  // ── Gantt Form ──
  isGanttFormOpen: boolean
  editingGanttTask: TaskWithTags | null
  openGanttForm: (task?: TaskWithTags) => void
  closeGanttForm: () => void

  // ── Settings ──
  isSettingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void
}

export const useUIStore = create<UIState>((set) => ({
  // View navigation
  activeView: 'tasks',
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

  // Gantt form
  isGanttFormOpen: false,
  editingGanttTask: null,
  openGanttForm: (task) =>
    set({ isGanttFormOpen: true, editingGanttTask: task ?? null }),
  closeGanttForm: () =>
    set({ isGanttFormOpen: false, editingGanttTask: null }),

  // Settings
  isSettingsOpen: false,
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
}))
