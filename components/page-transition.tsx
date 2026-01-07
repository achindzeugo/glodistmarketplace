"use client"

import { ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <div
      className={`animate-in fade-in-0 slide-in-from-bottom-4 duration-300 ${className}`}
    >
      {children}
    </div>
  )
}

export function FadeTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <div
      className={`animate-in fade-in-0 duration-200 ${className}`}
    >
      {children}
    </div>
  )
}

export function SlideTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <div
      className={`animate-in fade-in-0 slide-in-from-left-8 duration-400 ${className}`}
    >
      {children}
    </div>
  )
}