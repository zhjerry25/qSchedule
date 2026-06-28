export type Locale = 'en' | 'zh'

export interface Translations {
  app: {
    name: string
    loading: string
    error: string
    reload: string
  }
  frequency: Record<'once' | 'daily' | 'weekly' | 'deadline', string>
  section: Record<'today' | 'week' | 'later', string>
  empty: {
    todayTitle: string
    todayDesc: string
    weekTitle: string
    weekDesc: string
    laterTitle: string
    laterDesc: string
    createTask: string
    noTags: string
    noTasks: string
    popupAllClear: string
  }
  todo: {
    newTask: string
    editTask: string
    title: string
    description: string
    descriptionPlaceholder: string
    titlePlaceholder: string
    quickAddPlaceholder: string
    frequency: string
    scheduledDate: string
    deadline: string
    tags: string
    optional: string
    create: string
    save: string
    cancel: string
    saving: string
    edit: string
    delete: string
    deleteTitle: string
    deleteConfirm: string
    today: string
    tomorrow: string
    yesterday: string
    due: string
    pickDate: string
    todayDefault: string
    pickDeadline: string
  }
  tag: {
    addTags: string
    create: string
    creating: string
    clear: string
    deleteTag: string
    deleteTagConfirm: string
    failedToLoad: string
    noTags: string
  }
  popup: {
    today: string
    openApp: string
    couldNotLoad: string
    loading: string
  }
  settings: {
    title: string
    language: string
    languageEn: string
    languageZh: string
    close: string
  }
  tray: {
    openMain: string
    todaysTasks: string
    quit: string
    tooltip: string
  }
  error: {
    unknown: string
    somethingWentWrong: string
    tagSyncFailed: string
    tagAssignFailed: string
  }
}
