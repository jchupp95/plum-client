import { useState } from 'react'

import { type AppPage } from '@/components/mobile-layout'
import { ShoppingListPage } from '@/pages/shopping-list'
import { RecipesPage } from '@/pages/recipes'
import { MenuPage } from '@/pages/menu'
import { SchedulePage } from '@/pages/schedule'
import { RecipeDetailsPage } from '@/pages/recipe-details'
import { RecipeCreatePage } from '@/pages/recipe-create'
import { RecurringPage } from '@/pages/recurring'
import { IngredientsPage } from '@/pages/ingredients'

export function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('menu')
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

  let page = <RecipesPage currentPage={currentPage} onNavigate={handleNavigate} />

  if (currentPage === 'recipe-create') {
    page = (
      <RecipeCreatePage
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onBack={handleBackFromDetails}
      />
    )
  }
  else if (currentPage === 'recipe-details' && selectedRecipeId) {
    page = (
      <RecipeDetailsPage
        currentPage={currentPage}
        recipeId={selectedRecipeId}
        onNavigate={handleNavigate}
        onBack={handleBackFromDetails}
      />
    )
  }
  else if (currentPage === 'shopping-list') {
    page = <ShoppingListPage currentPage={currentPage} onNavigate={handleNavigate} />
  }
  else if (currentPage === 'ingredients') {
    page = <IngredientsPage currentPage={currentPage} onNavigate={handleNavigate} />
  }
  else if (currentPage === 'menu') {
    page = <MenuPage currentPage={currentPage} onNavigate={handleNavigate} />
  }
  else if (currentPage === 'schedule') {
    page = <SchedulePage currentPage={currentPage} onNavigate={handleNavigate} />
  }
  else if (currentPage === 'recurring') {
    page = <RecurringPage currentPage={currentPage} onNavigate={handleNavigate} />
  }

  return page
}

export default App
