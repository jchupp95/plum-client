import { useState, useEffect } from 'react'
import { Utensils, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MobileLayout, type AppPage } from '@/components/mobile-layout'
import { getRecipeImageUrl, RecipeService, type Menu } from '@/services/service'

interface MenuPageProps {
  currentPage: AppPage
  onNavigate: (page: AppPage, recipeId?: number) => void
}

export function MenuPage({ currentPage, onNavigate }: MenuPageProps) {
  const [menu, setMenu] = useState<Menu | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await RecipeService.getCurrentMenu()
      setMenu(data)
    } catch (err) {
      setError('Failed to load menu')
      console.error('Error fetching menu:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRecipeClick = (recipeId: number) => {
    onNavigate('recipe-details', recipeId)
  }

  const handleRemoveFromMenu = async (recipeId: number) => {
    if (!menu) {
      setError('Menu not loaded yet')
      return
    }

    const recipeIds = menu.recipes.map((recipe) => recipe.id)
    const success = await RecipeService.removeFromMenu(menu.id, recipeId, recipeIds)
    if (success) {
      setMenu({
        ...menu,
        recipes: menu.recipes.filter((recipe) => recipe.id !== recipeId),
      })
    } else {
      setError('Failed to remove recipe from menu')
    }
  }

  if (loading) {
    return (
      <MobileLayout title="Menu" currentPage={currentPage} onNavigate={onNavigate} showBottomNav={true}>
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading menu...</p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  if (error) {
    return (
      <MobileLayout title="Menu" currentPage={currentPage} onNavigate={onNavigate} showBottomNav={true}>
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={fetchMenu}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout title="Menu" currentPage={currentPage} onNavigate={onNavigate} showBottomNav={true}>
      <div className="container mx-auto px-4 py-4">
        {(menu?.recipes.length ?? 0) === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recipes in the menu yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Add recipes from the Recipes page.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {menu?.recipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="overflow-hidden py-2 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleRecipeClick(recipe.id)}
              >
                <CardContent className="py-0">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-16 w-16 rounded-full shrink-0">
                      <AvatarImage src={getRecipeImageUrl(recipe.image)} alt={recipe.name} />
                      <AvatarFallback className="rounded-full">
                        <Utensils className="h-7 w-7" aria-hidden="true" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-tight truncate">
                        {recipe.name}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFromMenu(recipe.id)
                      }}
                      className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
