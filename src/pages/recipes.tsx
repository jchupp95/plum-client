import { useState, useEffect } from 'react'
import { Utensils } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MobileLayout, type AppPage } from '@/components/mobile-layout'
import type { Recipe } from '@/types/recipe'
import { RecipeService } from '@/services/recipe-service'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

interface RecipesPageProps {
  currentPage: AppPage
  onNavigate: (page: AppPage) => void
}

export function RecipesPage({ currentPage, onNavigate }: RecipesPageProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await RecipeService.getRecipes()
      setRecipes(data)
    } catch (err) {
      setError('Failed to load recipes')
      console.error('Error fetching recipes:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <MobileLayout title="Recipes" currentPage={currentPage} onNavigate={onNavigate} showBottomNav={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading recipes...</p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  if (error) {
    return (
      <MobileLayout title="Recipes" currentPage={currentPage} onNavigate={onNavigate} showBottomNav={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={fetchRecipes}
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
    <MobileLayout title="Recipes" currentPage={currentPage} onNavigate={onNavigate} showBottomNav={true}>
      <div className="container mx-auto px-4 py-4">
        <div className="grid gap-3">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden py-2">
              <CardContent className="py-0">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-16 w-16 rounded-full shrink-0">
                    <AvatarImage src={recipe.image.startsWith('/images/') ? `${API_BASE_URL}${recipe.image}` : recipe.image} alt={recipe.name} />
                    <AvatarFallback className="rounded-full">
                      <Utensils className="h-7 w-7" aria-hidden="true" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm leading-tight truncate">
                      {recipe.name}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MobileLayout>
  )
}
