"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "@/app/providers"

export function MouseMoveEffect() {
  const { themeColors } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { left, top, width, height } = container.getBoundingClientRect()
      
      const x = (clientX - left) / width
      const y = (clientY - top) / height

      const gradientX = x * 100
      const gradientY = y * 100

      container.style.background = `
        radial-gradient(
          600px circle at ${gradientX}% ${gradientY}%,
          ${themeColors.primary}20 0%,
          transparent 80%
        )
      `
    }

    const handleMouseLeave = () => {
      container.style.background = 'transparent'
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [themeColors.primary, isMounted])

  // Don't render anything during SSR to prevent hydration mismatch
  if (!isMounted) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-30 transition-colors duration-300"
      style={{ backgroundColor: 'transparent' }}
    />
  )
}
