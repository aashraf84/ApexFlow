import { create } from 'zustand'

// Flat key-value map for quick lookup
export type SiteSettingsMap = Record<string, string>

type SiteSettingsState = {
  settings: SiteSettingsMap
  loaded: boolean
  setSettings: (settings: SiteSettingsMap) => void
  getSetting: (key: string, fallback?: string) => string
  refresh: () => Promise<void>
}

// Flatten the grouped API response into a flat map
function flattenSettings(
  grouped: Record<string, Record<string, { value: string; description?: string }>>
): SiteSettingsMap {
  const flat: SiteSettingsMap = {}
  for (const category of Object.values(grouped)) {
    for (const [key, data] of Object.entries(category)) {
      flat[key] = data.value
    }
  }
  return flat
}

export const useSiteSettings = create<SiteSettingsState>((set, get) => ({
  settings: {},
  loaded: false,

  setSettings: (settings) => set({ settings, loaded: true }),

  getSetting: (key, fallback = '') => {
    return get().settings[key] ?? fallback
  },

  refresh: async () => {
    try {
      const res = await fetch('/api/admin/site-settings')
      if (!res.ok) return
      const data = await res.json()
      const flat = flattenSettings(data.settings || {})
      set({ settings: flat, loaded: true })
    } catch (err) {
      console.error('[SiteSettings] Failed to refresh:', err)
    }
  },
}))

// Initialize settings on load (client-side only)
if (typeof window !== 'undefined') {
  // Debounce to avoid multiple calls during initial mount
  let initialized = false
  const init = () => {
    if (initialized) return
    initialized = true
    useSiteSettings.getState().refresh()
  }

  // Use requestIdleCallback for non-blocking init
  if ('requestIdleCallback' in window) {
    ;(window as any).requestIdleCallback(init)
  } else {
    setTimeout(init, 100)
  }
}
