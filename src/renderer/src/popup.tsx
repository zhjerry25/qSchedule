import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PopupApp } from './components/popup/PopupApp'
import { ErrorBoundary } from './components/ErrorBoundary'
import { I18nProvider } from './i18n'
import type { Locale } from './i18n/types'
import './globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
    },
  },
})

async function bootstrap() {
  let locale: Locale = 'en'
  try {
    const result = await window.api.settings.get('language')
    if (result.data === 'zh') locale = 'zh'
  } catch {
    // Use default 'en'
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <I18nProvider initialLocale={locale}>
          <ErrorBoundary>
            <PopupApp />
          </ErrorBoundary>
        </I18nProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  )
}

bootstrap()
