export type AuthChange = { status: 'login' | 'logout'; user?: unknown }

const EVENT_NAME = 'auth:changed'

export function emitAuthChanged(detail: AuthChange) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<AuthChange>(EVENT_NAME, { detail }))
}

export function onAuthChanged(cb: (detail: AuthChange) => void) {
  if (typeof window === 'undefined') return () => {}
  const handler = (e: Event) => {
    const ce = e as CustomEvent<AuthChange>
    cb(ce.detail)
  }
  window.addEventListener(EVENT_NAME, handler)
  return () => window.removeEventListener(EVENT_NAME, handler)
}

