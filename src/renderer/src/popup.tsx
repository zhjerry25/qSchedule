import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true
    }
  }
})

function PopupApp() {
  return (
    <div className="p-4 bg-white rounded-smooth shadow-lg">
      <h2 className="text-lg font-semibold text-neutral-900">Today</h2>
      <p className="text-sm text-neutral-500 mt-1">MVP v0.1 — Coming soon</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <PopupApp />
    </QueryClientProvider>
  </React.StrictMode>
)
