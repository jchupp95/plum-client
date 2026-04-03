import { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'

import { MobileLayout, type AppPage } from '@/components/mobile-layout'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RecipeService } from '@/services/recipe-service'
import type { ShoppingListItem } from '@/types/shopping-list'

interface ShoppingListPageProps {
  currentPage: AppPage
  onNavigate: (page: AppPage) => void
}

export function ShoppingListPage({ currentPage, onNavigate }: ShoppingListPageProps) {
  const [items, setItems] = useState<ShoppingListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchShoppingList()
  }, [])

  const fetchShoppingList = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await RecipeService.getShoppingList()
      setItems(data.items)
    } catch (err) {
      setError('Failed to load shopping list')
      console.error('Error fetching shopping list:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <MobileLayout title="Shopping List" currentPage={currentPage} onNavigate={onNavigate} showBottomNav={true}>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading shopping list...</p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  if (error) {
    return (
      <MobileLayout title="Shopping List" currentPage={currentPage} onNavigate={onNavigate} showBottomNav={true}>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-destructive">{error}</p>
            <Button onClick={fetchShoppingList}>
              Try Again
            </Button>
          </div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout title="Shopping List" currentPage={currentPage} onNavigate={onNavigate} showBottomNav={true}>
      <div className="container mx-auto px-4 py-4">
        <Card className="py-2">
          <CardContent className="py-0">
            {items.length === 0 ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 py-6 text-center">
                <ClipboardList className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="font-medium">No shopping list items</p>
                  <p className="text-sm text-muted-foreground">Your shopping list will show up here once ingredients are grouped.</p>
                </div>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {items.map((item) => (
                  <AccordionItem key={item.ingredient} value={item.ingredient}>
                    <AccordionTrigger className="gap-4">
                      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                        <span className="truncate text-base font-semibold">{item.ingredient}</span>
                        <Badge variant="secondary" className="shrink-0">
                          {item.recipes.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {item.recipes.map((recipe) => (
                          <li key={recipe} className="rounded-md bg-muted px-3 py-2 text-sm text-foreground">
                            {recipe}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}
