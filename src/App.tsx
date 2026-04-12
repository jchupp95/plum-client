import { useState } from 'react'

import { type AppPage } from '@/components/mobile-layout'
import { ShoppingListPage } from '@/pages/shopping-list'
import { RecipesPage } from '@/pages/recipes'
import { MenuPage } from '@/pages/menu'
import { RecipeDetailsPage } from '@/pages/recipe-details'
import { RecipeCreatePage } from '@/pages/recipe-create'

export function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('recipes')
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null)

  const handleNavigate = (page: AppPage, recipeId?: number) => {
    setCurrentPage(page)
    if (recipeId !== undefined) {
      setSelectedRecipeId(recipeId)
    }
  }

  const handleBackFromDetails = () => {
    setCurrentPage('recipes')
    setSelectedRecipeId(null)
  }

  if (currentPage === 'recipe-create') {
    return (
      <RecipeCreatePage
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onBack={handleBackFromDetails}
      />
    )
  }

  if (currentPage === 'recipe-details' && selectedRecipeId) {
    return (
      <RecipeDetailsPage
        currentPage={currentPage}
        recipeId={selectedRecipeId}
        onNavigate={handleNavigate}
        onBack={handleBackFromDetails}
      />
    )
  }

  if (currentPage === 'shopping-list') {
    return <ShoppingListPage currentPage={currentPage} onNavigate={handleNavigate} />
  }

  if (currentPage === 'menu') {
    return <MenuPage currentPage={currentPage} onNavigate={handleNavigate} />
  }

  return <RecipesPage currentPage={currentPage} onNavigate={handleNavigate} />
}

export default App
