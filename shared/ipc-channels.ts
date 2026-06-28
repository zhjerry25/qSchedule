export const Channels = {
  // Task operations
  TASK_LIST: 'task:list',
  TASK_GET_BY_ID: 'task:get-by-id',
  TASK_CREATE: 'task:create',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  TASK_COMPLETE: 'task:complete',
  TASK_UNCOMPLETE: 'task:uncomplete',
  TASK_GET_TODAY: 'task:get-today',

  // Window operations
  WINDOW_OPEN_MAIN: 'window:open-main',
  WINDOW_CLOSE_POPUP: 'window:close-popup',

  // Settings operations
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  // Popup window height
  WINDOW_SET_POPUP_HEIGHT: 'window:set-popup-height',

  // Tag operations
  TAG_LIST: 'tag:list',
  TAG_GET_BY_ID: 'tag:get-by-id',
  TAG_CREATE: 'tag:create',
  TAG_UPDATE: 'tag:update',
  TAG_DELETE: 'tag:delete',
  TAG_ADD_TO_TASK: 'tag:add-to-task',
  TAG_REMOVE_FROM_TASK: 'tag:remove-from-task',
  TAG_GET_FOR_TASK: 'tag:get-for-task',
} as const

export type ChannelName = (typeof Channels)[keyof typeof Channels]
