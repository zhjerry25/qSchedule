import * as Dialog from '@radix-ui/react-dialog'
import { useI18n } from '../../i18n'
import { settingsApi } from '../../lib/ipc'
import type { Locale } from '../../i18n/types'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { locale, t, setLocale } = useI18n()

  const handleLocaleChange = async (newLocale: Locale) => {
    setLocale(newLocale)
    try {
      await settingsApi.set('language', newLocale)
    } catch {
      // Silently fail — locale persists in React state even if DB write fails
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-smooth shadow-lg p-6 focus:outline-none">
          <Dialog.Title className="text-lg font-semibold text-neutral-900">
            {t.settings.title}
          </Dialog.Title>

          <div className="mt-4 space-y-4">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t.settings.language}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleLocaleChange('en')}
                  className={[
                    'flex-1 px-4 py-2 text-sm font-medium rounded-smooth border transition-colors',
                    locale === 'en'
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50',
                  ].join(' ')}
                >
                  {t.settings.languageEn}
                </button>
                <button
                  type="button"
                  onClick={() => handleLocaleChange('zh')}
                  className={[
                    'flex-1 px-4 py-2 text-sm font-medium rounded-smooth border transition-colors',
                    locale === 'zh'
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50',
                  ].join(' ')}
                >
                  {t.settings.languageZh}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium text-white bg-neutral-900 rounded-smooth hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
            >
              {t.settings.close}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
