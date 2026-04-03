import { useState } from 'react'

import { type AppPage } from '@/components/mobile-layout'
import { ShoppingListPage } from '@/pages/shopping-list'
import { RecipesPage } from '@/pages/recipes'

export function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('recipes')

  if (currentPage === 'shopping-list') {
    return <ShoppingListPage currentPage={currentPage} onNavigate={setCurrentPage} />
  }

  return <RecipesPage currentPage={currentPage} onNavigate={setCurrentPage} />
}

export default App
