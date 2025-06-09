"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type TransitionType = "fade" | "slide" | "zoom" | "flip" | "none"

interface BannerSettings {
  autoRotationSpeed: number // in milliseconds
  transitionType: TransitionType
  transitionDuration: number // in seconds
  pauseOnHover: boolean
  showArrows: boolean
  showDots: boolean
  enableAutoRotation: boolean
}

interface BannerSettingsStore extends BannerSettings {
  updateSettings: (settings: Partial<BannerSettings>) => void
  resetSettings: () => void
}

const DEFAULT_SETTINGS: BannerSettings = {
  autoRotationSpeed: 5000,
  transitionType: "fade",
  transitionDuration: 0.5,
  pauseOnHover: true,
  showArrows: true,
  showDots: true,
  enableAutoRotation: true,
}

export const useBannerSettings = create<BannerSettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSettings: (settings) => {
        set((state) => ({
          ...state,
          ...settings,
        }))
      },

      resetSettings: () => {
        set(DEFAULT_SETTINGS)
      },
    }),
    {
      name: "banner-settings",
    },
  ),
)
