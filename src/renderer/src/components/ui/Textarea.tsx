import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export function Textarea({
  error,
  className = '',
  disabled,
  rows = 3,
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      <textarea
        rows={rows}
        className={[
          'w-full px-3 py-2 text-sm rounded-smooth border transition-colors resize-vertical',
          'placeholder:text-neutral-400',
          'focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent',
          error
            ? 'border-rose-300 focus:ring-rose-400'
            : 'border-neutral-200',
          disabled && 'opacity-50 bg-neutral-50',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-rose-500">{error}</p>
      )}
    </div>
  )
}
