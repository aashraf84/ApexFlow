'use client'

import { useSyncExternalStore } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// useContent — public-site content lookup hook
// ─────────────────────────────────────────────────────────────────────────────
// Fetches ALL content blocks from /api/content (public, no auth) on first
// mount, then shares the result across every page via a module-level
// singleton so we only hit the network once per session.
//
// Each public page calls `const { get } = useContent()` and then replaces its
// hardcoded strings with `get('Homepage', 'home_hero_title', 'fallback')`.
// The fallback is used until the fetch resolves (or forever if the fetch
// fails / the DB is down) so the site NEVER breaks because of content.
// ─────────────────────────────────────────────────────────────────────────────

export type ContentMap = Record<string, Record<string, string>>

interface ContentState {
  content: ContentMap
  loading: boolean
  get: (page: string, key: string, fallback: string) => string
}

// Module-level singleton — shared across every useContent() caller so the
// fetch only happens once per page load, regardless of how many components
// mount the hook.
let singleton: ContentMap = {}
let singletonLoaded = false
let singletonLoading = false
let singletonPromise: Promise<void> | null = null

// Listeners allow React components to subscribe to the singleton's updates.
// Combined with useSyncExternalStore below, this gives us a Zustand-style
// subscription model without pulling in another dependency.
const listeners = new Set<() => void>()

function notify() {
  for (const l of listeners) l()
}

function broadcast() {
  notify()
}

/**
 * Trigger the singleton fetch (idempotent — safe to call from many
 * components). Resolves once the content map is populated (or once the fetch
 * has failed, in which case callers fall back to their hardcoded fallbacks).
 */
function fetchContent(): Promise<void> {
  if (singletonLoaded) return Promise.resolve()
  if (singletonPromise) return singletonPromise

  singletonLoading = true
  singletonPromise = (async () => {
    try {
      const res = await fetch('/api/content', {
        // Always fetch fresh — the server itself caches for 60s.
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { content?: ContentMap }
      if (data.content) {
        singleton = data.content
        singletonLoaded = true
        broadcast()
      }
    } catch (err) {
      // Network or parse failure — leave singleton as `{}` so callers fall
      // back to their hardcoded strings. Logged once for visibility.
      console.error('[useContent] fetch failed — using fallbacks:', err)
    } finally {
      singletonLoading = false
      singletonPromise = null
    }
  })()

  return singletonPromise
}

// ─── useSyncExternalStore plumbing ──────────────────────────────────────────
// This is the React 18+ pattern for subscribing to external (non-React)
// state. It avoids the `react-hooks/set-state-in-effect` lint error that
// would fire if we used useState + useEffect.

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  // Kick off the fetch if it hasn't started yet. SSR safety: useSyncExternal
  // -Store's subscribe callback only runs on the client, so fetch never
  // fires during server rendering.
  if (!singletonLoaded && !singletonLoading) {
    void fetchContent()
  }
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): ContentMap {
  return singleton
}

// On the server, render with an empty map — callers fall back to their
// hardcoded strings, and the client takes over post-hydration.
function getServerSnapshot(): ContentMap {
  return {}
}

export function useContent(): ContentState {
  const content = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
  const loading = !singletonLoaded

  const get = (page: string, key: string, fallback: string): string => {
    const pageMap = content[page]
    if (!pageMap) return fallback
    const v = pageMap[key]
    return v !== undefined && v !== '' ? v : fallback
  }

  return { content, loading, get }
}

/**
 * Imperatively refresh the content (e.g. after an admin saves a new block
 * and we want the public site to pick up the change immediately instead of
 * waiting for the next page load).
 */
export function refreshContent(): Promise<void> {
  // Force the next fetchContent call to actually hit the network.
  singletonLoaded = false
  singletonPromise = null
  return fetchContent()
}
