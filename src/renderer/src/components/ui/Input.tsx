import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function Input({ error, className = '', disabled, ...props }: InputProps) {
  return (
    <div className="w-full">
      <input
        className={[
          'w-full h-9 px-3 text-sm rounded-smooth border transition-colors',
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
