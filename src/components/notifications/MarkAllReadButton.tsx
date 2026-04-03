'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MarkAllReadButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleMarkAllRead = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        // Refresh page to show updated notifications
        window.location.reload()
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleMarkAllRead}
      disabled={isLoading}
      variant="ghost"
      size="sm"
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
    >
      <Check className="h-4 w-4" />
      {isLoading ? 'Marcando...' : 'Marcar todo como leído'}
    </Button>
  )
}
