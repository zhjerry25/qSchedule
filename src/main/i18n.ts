/**
 * Minimal translation map for tray/menu strings used in the main process.
 * The renderer has its own full Translation interface — main process only
 * needs these 4 strings for the tray context menu and tooltip.
 */
export const TRAY_STRINGS: Record<string, Record<string, string>> = {
  en: {
    openMain: 'Open Main',
    todaysTasks: "Today's Tasks",
    quit: 'Quit',
    tooltip: 'qSchedule',
  },
  zh: {
    openMain: '打开主窗口',
    todaysTasks: '今日任务',
    quit: '退出',
    tooltip: 'qSchedule',
  },
}
