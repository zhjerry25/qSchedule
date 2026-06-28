import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Locale, Translations } from './types'
import { en } from './locales/en'
import { zh } from './locales/zh'

const localeMap: Record<Locale, Translations> = { en, zh }

const I18nContext = createContext<{
  locale: Locale
  t: Translations
  setLocale: (l: Locale) => void
} | null>(null)

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode
  initialLocale: Locale
}) {
  const [locale, setLocaleState] = useState(initialLocale)

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
  }, [])

  const t = localeMap[locale]

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
