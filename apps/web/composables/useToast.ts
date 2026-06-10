// App-wide toast notifications. Replaces native alert().
// Shared singleton state via Nuxt useState so any component can push a toast
// and the single <UiToastHost /> (mounted in app.vue) renders them.

export type ToastKind = 'success' | 'error' | 'info'
export interface Toast { id: number; message: string; kind: ToastKind }

let counter = 0

export function useToast() {
  const toasts = useState<Toast[]>('rc-toasts', () => [])

  function push(message: string, kind: ToastKind = 'success', duration = 3600) {
    const id = ++counter
    toasts.value = [...toasts.value, { id, message, kind }]
    if (import.meta.client && duration > 0) {
      setTimeout(() => {
        toasts.value = toasts.value.filter((t) => t.id !== id)
      }, duration)
    }
    return id
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts,
    dismiss,
    toast: push,
    success: (m: string) => push(m, 'success'),
    error: (m: string) => push(m, 'error'),
    info: (m: string) => push(m, 'info'),
  }
}
