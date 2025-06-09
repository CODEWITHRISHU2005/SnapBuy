"use client"

import type React from "react"

import { useState, useEffect } from "react"
import SplashScreen from "./splash-screen"

interface SplashProviderProps {
  children: React.ReactNode
}

export default function SplashProvider({ children }: SplashProviderProps) {
  const [showSplash, setShowSplash] = useState(true)
  const [hasShownSplash, setHasShownSplash] = useState(false)

  useEffect(() => {
    // Check if splash has been shown in this session
    const splashShown = sessionStorage.getItem("splash-shown")
    if (splashShown) {
      setShowSplash(false)
      setHasShownSplash(true)
    }
  }, [])

  const handleSplashComplete = () => {
    setShowSplash(false)
    setHasShownSplash(true)
    sessionStorage.setItem("splash-shown", "true")
  }

  return (
    <>
      {showSplash && !hasShownSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <div className={showSplash && !hasShownSplash ? "hidden" : ""}>{children}</div>
    </>
  )
}
