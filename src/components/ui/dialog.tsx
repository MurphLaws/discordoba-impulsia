'use client'

import { ReactNode, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

interface DialogContentProps {
  children: ReactNode
  className?: string
}

interface DialogHeaderProps {
  children: ReactNode
  className?: string
}

interface DialogTitleProps {
  children: ReactNode
  className?: string
}

interface DialogDescriptionProps {
  children: ReactNode
  className?: string
}

interface DialogFooterProps {
  children: ReactNode
  className?: string
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onOpenChange(false)
            }
          }}
        >
          <div onClick={(e) => e.stopPropagation()}>{children}</div>
        </div>
      )}
    </>
  )
}

export function DialogContent({ children, className }: DialogContentProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-lg border border-gray-200 max-w-md w-full p-6',
        className
      )}
    >
      {children}
    </div>
  )
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2 className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h2>
  )
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
  return (
    <p className={cn('text-sm text-gray-500 mt-1', className)}>
      {children}
    </p>
  )
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div className={cn('mt-6 flex gap-3 justify-end', className)}>
      {children}
    </div>
  )
}
