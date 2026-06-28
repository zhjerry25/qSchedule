import { Component } from 'react'
import type { ReactNode } from 'react'
import { useI18n } from '../i18n'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

function ErrorFallback({ error }: { error: Error | null }) {
  const { t } = useI18n()
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-neutral-50 px-6 text-center">
      <h2 className="text-lg font-semibold text-neutral-900 mb-2">
        {t.error.somethingWentWrong}
      </h2>
      <p className="text-sm text-neutral-500 mb-4 max-w-md">
        {error?.message ?? t.error.unknown}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium text-white bg-neutral-900 rounded-smooth hover:bg-neutral-800 transition-colors"
      >
        {t.app.reload}
      </button>
    </div>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}
