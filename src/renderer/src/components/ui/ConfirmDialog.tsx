import * as Dialog from '@radix-ui/react-dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  loading?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-smooth shadow-lg p-6 focus:outline-none">
          <Dialog.Title className="text-lg font-semibold text-neutral-900">
            {title}
          </Dialog.Title>
          {description && (
            <Dialog.Description className="mt-2 text-sm text-neutral-500">
              {description}
            </Dialog.Description>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-smooth hover:bg-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={[
                'inline-flex items-center justify-center h-9 px-4 text-sm font-medium text-white rounded-smooth transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50',
                variant === 'danger'
                  ? 'bg-rose-500 hover:bg-rose-600 focus-visible:ring-rose-400'
                  : 'bg-neutral-900 hover:bg-neutral-800 focus-visible:ring-neutral-400',
              ].join(' ')}
            >
              {loading ? '...' : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
