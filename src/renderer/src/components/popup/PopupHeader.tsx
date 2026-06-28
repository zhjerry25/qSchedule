import { windowApi } from '../../lib/ipc'
import { useI18n } from '../../i18n'

export function PopupHeader() {
  const { t, locale } = useI18n()
  const today = new Date()
  const dateStr = today.toLocaleDateString(
    locale === 'zh' ? 'zh-CN' : 'en-US',
    { weekday: 'long', month: 'long', day: 'numeric' },
  )

  return (
    <div className="flex items-center justify-between px-3 py-2.5 border-b border-neutral-100 shrink-0">
      <div>
        <h2 className="text-sm font-semibold text-neutral-900">{t.popup.today}</h2>
        <p className="text-xs text-neutral-400 mt-0.5">{dateStr}</p>
      </div>
      <button
        onClick={() => windowApi.openMain()}
        className="text-xs text-accent-violet hover:text-violet-700 transition-colors"
      >
        {t.popup.openApp}
      </button>
    </div>
  )
}
