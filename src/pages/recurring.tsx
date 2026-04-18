import { useEffect, useState, type FormEvent } from 'react'
import { Package2, Plus, Trash2 } from 'lucide-react'

import { MobileLayout, type AppPage } from '@/components/mobile-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { RecipeService } from '@/services/service'
import type { StockItem } from '@/types/stock-item'

interface RecurringPageProps {
  currentPage: AppPage
  onNavigate: (page: AppPage, recipeId?: number) => void
}

export function RecurringPage({ currentPage, onNavigate }: RecurringPageProps) {
  const [items, setItems] = useState<StockItem[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchStockItems()
  }, [])

  const fetchStockItems = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await RecipeService.getStockItems()
      setItems(data)
    } catch (err) {
      setError('Failed to load recurring stock items')
      console.error('Error fetching stock items:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = newItemName.trim()
    if (!trimmedName) {
      return
    }

    setSaving(true)
    setError(null)

    const createdItem = await RecipeService.createStockItem(trimmedName)

    if (createdItem) {
      setItems((currentItems) => [...currentItems, createdItem])
      setNewItemName('')
    } else {
      setError('Failed to add stock item')
    }

    setSaving(false)
  }

  const handleDeleteItem = async (stockItemId: number) => {
    setError(null)

    const success = await RecipeService.deleteStockItem(stockItemId)

    if (success) {
      setItems((currentItems) => currentItems.filter((item) => item.id !== stockItemId))
    } else {
      setError('Failed to delete stock item')
    }
  }

  if (loading) {
    return (
      <MobileLayout title="Recurring" currentPage={currentPage} onNavigate={onNavigate} showBottomNav={true}>
        <div className="flex min-h-100 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading stock items...</p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout title="Recurring" currentPage={currentPage} onNavigate={onNavigate} showBottomNav={true}>
      <div className="container mx-auto space-y-4 px-4 py-4">
        {error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <Card className="py-2">
          <CardContent className="py-0">
            {items.length === 0 ? (
              <div className="flex min-h-55 flex-col items-center justify-center gap-3 py-6 text-center">
                <Package2 className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="font-medium">No recurring stock items yet</p>
                  <p className="text-sm text-muted-foreground">Add items below to build your reusable stock list.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void handleDeleteItem(item.id)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardContent>
            <form className="space-y-3" onSubmit={handleAddItem}>
              <div className="flex gap-2">
                <Input
                  value={newItemName}
                  onChange={(event) => setNewItemName(event.target.value)}
                  placeholder="Add New"
                  disabled={saving}
                />
                <Button type="submit" disabled={saving || newItemName.trim().length === 0}>
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add stock item</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}
