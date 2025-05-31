"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "@/app/providers"

export function MouseMoveEffect() {
  const { themeColors } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
  }, [themeColors.primary])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-30 transition-colors duration-300"
      style={{ backgroundColor: 'transparent' }}
    />
  )
}
