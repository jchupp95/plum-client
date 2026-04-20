import { useEffect, useRef, useState, type TouchEvent } from 'react'
import { ArrowLeftRight, Search, Utensils, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxEmpty,
} from '@/components/ui/combobox'
import { MobileLayout, type AppPage } from '@/components/mobile-layout'
import type { Recipe } from '@/types/recipe'
import { getRecipeImageUrl, RecipeService, type Menu } from '@/services/service'

interface SchedulePageProps {
  currentPage: AppPage
  onNavigate: (page: AppPage, recipeId?: number) => void
}

export function SchedulePage({ currentPage, onNavigate }: SchedulePageProps) {
  const [menus, setMenus] = useState<Menu[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [currentMenuIndex, setCurrentMenuIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  useEffect(() => {
    void fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [menuData, recipeData] = await Promise.all([
        RecipeService.getMenus(),
        RecipeService.getRecipes(),
      ])
      setMenus(menuData)
      setRecipes(recipeData)
      setCurrentMenuIndex(0)
    } catch (err) {
      setError('Failed to load schedule data')
      console.error('Error fetching schedule data:', err)
    } finally {
      setLoading(false)
    }
  }

  const currentMenu = menus[currentMenuIndex]
  const currentRecipeIds = currentMenu?.recipes.map((recipe) => recipe.id) ?? []
  const searchResults = searchQuery.trim().length > 0
    ? recipes.filter((recipe) => recipe.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : recipes

  const handleRemoveFromMenu = async (recipeId: number) => {
    if (!currentMenu) {
      setError('Menu not loaded yet')
      return
    }

    const success = await RecipeService.removeFromMenu(currentMenu.id, recipeId, currentRecipeIds)
    if (success) {
      setMenus((currentMenus) =>
        currentMenus.map((menu, index) =>
          index === currentMenuIndex
            ? { ...menu, recipes: menu.recipes.filter((recipe) => recipe.id !== recipeId) }
            : menu
        )
      )
    } else {
      setError('Failed to remove recipe from schedule')
    }
  }

  const handleAddToMenu = async (recipeId: number) => {
    if (!currentMenu) {
      setError('Menu not loaded yet')
      return
    }

    if (currentRecipeIds.includes(recipeId)) {
      return
    }

    const success = await RecipeService.addToMenu(currentMenu.id, recipeId, currentRecipeIds)
    if (success) {
      const addedRecipe = recipes.find((recipe) => recipe.id === recipeId)
      if (!addedRecipe) return

      setMenus((currentMenus) =>
        currentMenus.map((menu, index) =>
          index === currentMenuIndex
            ? { ...menu, recipes: [...menu.recipes, addedRecipe] }
            : menu
        )
      )
      setSearchQuery('')
    } else {
      setError('Failed to add recipe to schedule')
    }
  }

  const goToMenuIndex = (index: number) => {
    if (menus.length === 0) {
      return
    }
    const nextIndex = (index + menus.length) % menus.length
    setCurrentMenuIndex(nextIndex)
    setSearchQuery('')
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0].clientX)
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) {
      return
    }

    const diff = event.changedTouches[0].clientX - touchStartX
    const threshold = 50

    if (diff > threshold) {
      goToMenuIndex(currentMenuIndex + 1)
    } else if (diff < -threshold) {
      goToMenuIndex(currentMenuIndex - 1)
    }

    setTouchStartX(null)
  }

  if (loading) {
    return (
      <MobileLayout title="Schedule" currentPage={currentPage} onNavigate={onNavigate} showBottomNav={true}>
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading schedule...</p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  if (error) {
    return (
      <MobileLayout title="Schedule" currentPage={currentPage} onNavigate={onNavigate} showBottomNav={true}>
        <div className="flex items-center justify-center min-h-100 px-4">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchData} className="w-full">
              Try Again
            </Button>
          </div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout title="Schedule" currentPage={currentPage} onNavigate={onNavigate} showBottomNav={true}>
      <div
        className="container mx-auto px-4 pb-4 pt-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">{currentMenu?.name ?? 'No menu available'}</h2>
          <div className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <ArrowLeftRight className="h-4 w-4" />
            Swipe
          </div>
        </div>

        <div className="grid gap-3 pb-12">
          {currentMenu?.recipes.length ? (
            currentMenu.recipes.map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden py-2 hover:bg-accent transition-colors">
                <CardContent className="py-0">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-16 w-16 rounded-full shrink-0">
                      <AvatarImage
                        src={getRecipeImageUrl(recipe.image)}
                        alt={recipe.name}
                      />
                      <AvatarFallback className="rounded-full">
                        <Utensils className="h-7 w-7" aria-hidden="true" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-tight truncate">{recipe.name}</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        void handleRemoveFromMenu(recipe.id)
                      }}
                      className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-muted/50 bg-muted/5 p-6 text-center">
              <p className="text-sm text-muted-foreground">No recipes are assigned to this schedule yet.</p>
            </div>
          )}
        </div>

        <div className="fixed inset-x-0 bottom-safe-offset-20 z-30 flex justify-center px-4">
          <div className="w-full max-w-xl">
            <Combobox
              inputValue={searchQuery}
              onInputValueChange={(value) => {
                if (value === '') {
                  searchInputRef.current?.blur()
                }
                setSearchQuery(value)
              }}
              itemToStringLabel={(item: any) => item.label}
              itemToStringValue={(item: any) => item.value}
              onValueChange={(value: any) => {
                if (!value || Array.isArray(value)) return
                const recipeId = Number(value.value)
                if (!Number.isNaN(recipeId)) {
                  void handleAddToMenu(recipeId)
                  setSearchQuery('')
                  searchInputRef.current?.blur()
                }
              }}
              items={searchResults.map((recipe) => ({
                value: recipe.id.toString(),
                label: recipe.name,
                disabled: currentRecipeIds.includes(recipe.id),
              }))}
            >
              <div className="mx-auto flex w-fit items-center">
                <Search className="h-4 w-4 m-2 text-muted-foreground" />
                <ComboboxInput ref={searchInputRef} className="min-w-[18rem]" placeholder="Add Recipes" />
              </div>
              <ComboboxContent>
              <ComboboxList>
                {searchResults.length > 0 ? (
                  searchResults.map((recipe) => (
                    <ComboboxItem
                      key={recipe.id}
                      value={{
                        value: recipe.id.toString(),
                        label: recipe.name,
                        disabled: currentRecipeIds.includes(recipe.id),
                      }}
                      disabled={currentRecipeIds.includes(recipe.id)}
                    >
                      <span className="truncate">{recipe.name}</span>
                      <span className={currentRecipeIds.includes(recipe.id) ? 'text-muted-foreground' : 'text-primary'}>
                        {currentRecipeIds.includes(recipe.id) ? 'Added' : 'Add'}
                      </span>
                    </ComboboxItem>
                  ))
                ) : (
                  <ComboboxEmpty>No recipes match that search.</ComboboxEmpty>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}
