import { useEffect, useState, type FormEvent } from 'react'
import { ClipboardList, Plus, Trash2 } from 'lucide-react'

import { MobileLayout, type AppPage } from '@/components/mobile-layout'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { RecipeService } from '@/services/service'
import type { Ingredient } from '@/types/recipe'

interface IngredientPageProps {
  currentPage: AppPage
  onNavigate: (page: AppPage, recipeId?: number) => void
}

export function IngredientsPage({ currentPage, onNavigate }: IngredientPageProps) {
  const [items, setItems] = useState<Ingredient[]>([])
  const [newIngredientName, setNewIngredientName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchIngredients()
  }, [])

  const fetchIngredients = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await RecipeService.getAllIngredients()
      setItems(data)
    } catch (err) {
      setError('Failed to load ingredients')
      console.error('Error fetching ingredients:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRecipeNames = (ingredient: Ingredient) => {
    return ingredient.recipes
      .map((recipe) => (typeof recipe === 'string' ? recipe : recipe.name))
      .filter((recipeName) => recipeName.length > 0)
  }

  const handleAddIngredient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = newIngredientName.trim()
    if (!trimmedName) {
      return
    }

    setSaving(true)
    setError(null)

    const createdIngredient = await RecipeService.createIngredient(trimmedName)

    if (createdIngredient) {
      setItems((currentItems) => [...currentItems, createdIngredient])
      setNewIngredientName('')
    } else {
      setError('Failed to add ingredient')
    }

    setSaving(false)
  }

  const handleDeleteIngredient = async (ingredient: Ingredient) => {
    if (ingredient.id === undefined) {
      setError(`Unable to delete ${ingredient.name}`)
      return
    }

    try {
      setDeletingId(ingredient.id)
      setError(null)

      const success = await RecipeService.deleteIngredient(ingredient.id)

      if (!success) {
        setError(`Failed to delete ${ingredient.name}`)
        return
      }

      setItems((currentItems) => currentItems.filter((item) => item.id !== ingredient.id))
    } catch (err) {
      setError(`Failed to delete ${ingredient.name}`)
      console.error('Error deleting ingredient:', err)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <MobileLayout title="Ingredients" currentPage={currentPage} onNavigate={onNavigate} showBottomNav={true}>
        <div className="flex min-h-100 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading ingredients...</p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  if (error && items.length === 0) {
    return (
      <MobileLayout title="Ingredients" currentPage={currentPage} onNavigate={onNavigate} showBottomNav={true}>
        <div className="flex min-h-100 items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-destructive">{error}</p>
            <Button onClick={() => void fetchIngredients()}>
              Try Again
            </Button>
          </div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout title="Ingredients" currentPage={currentPage} onNavigate={onNavigate} showBottomNav={true}>
      <div className="container mx-auto space-y-4 px-4 py-4">
        {error ? (
          <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <Card className="py-2">
          <CardContent className="py-0">
            {items.length === 0 ? (
              <div className="flex min-h-60 flex-col items-center justify-center gap-3 py-6 text-center">
                <ClipboardList className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="font-medium">No ingredients available</p>
                  <p className="text-sm text-muted-foreground">Your ingredients will show up here once added.</p>
                </div>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {items.map((item) => (
                  <AccordionItem key={item.id ?? item.name} value={item.name}>
                    {item.recipes.length > 0 ? (
                      <>
                        <AccordionTrigger className="gap-4">
                          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                            <span className="truncate text-base font-semibold">{item.name}</span>
                            <Badge variant="secondary" className="shrink-0">
                              {item.recipes.length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2">
                            {getRecipeNames(item).map((recipeName) => (
                              <li key={recipeName} className="rounded-md bg-muted px-3 py-2 text-sm text-foreground">
                                {recipeName}
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </>
                    ) : (
                      <div className="flex items-center justify-between gap-3 py-4">
                        <span className="truncate text-base font-semibold">{item.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleDeleteIngredient(item)}
                          disabled={deletingId === item.id}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete ingredient</span>
                        </Button>
                      </div>
                    )}
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardContent>
            <form className="space-y-3" onSubmit={handleAddIngredient}>
              <div className="flex gap-2">
                <Input
                  value={newIngredientName}
                  onChange={(event) => setNewIngredientName(event.target.value)}
                  placeholder="Add New"
                  disabled={saving}
                />
                <Button type="submit" disabled={saving || newIngredientName.trim().length === 0}>
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add ingredient</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}
