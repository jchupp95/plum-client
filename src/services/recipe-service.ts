import type { Recipe, Ingredient } from '@/types/recipe'
import type { ShoppingList } from '@/types/shopping-list'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export class RecipeService {
  static async getAllIngredients(): Promise<Ingredient[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ingredient/`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to fetch ingredients:', error)
      return []
    }
  }
  static async getRecipes(): Promise<Recipe[]> {
    const response = await fetch(`${API_BASE_URL}/recipe/overview`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  static async getShoppingList(): Promise<ShoppingList> {
    const response = await fetch(`${API_BASE_URL}/shopping-list/`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  static async getRecipe(id: number): Promise<Recipe | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/recipe/${id}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to fetch recipe from API:', error)
      return null
    }
  }

  static async updateRecipe(
    id: number,
    recipe: Omit<Recipe, 'id'>,
    imageFile?: File
  ): Promise<Recipe | null> {
    try {
      const formData = new FormData()
      formData.append('name', recipe.name)
      formData.append('ingredients', recipe.ingredients || '')
      formData.append('instructions', recipe.instructions || '')
      if (recipe.shopping_list) {
        formData.append('shopping_list', JSON.stringify(recipe.shopping_list))
      }
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const response = await fetch(`${API_BASE_URL}/recipe/${id}`, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to update recipe:', error)
      return null
    }
  }

  static async deleteRecipe(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/recipe/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to delete recipe:', error)
      return false
    }
  }

  static async createRecipe(
    recipe: Omit<Recipe, 'id'>,
    imageFile?: File
  ): Promise<Recipe | null> {
    try {
      const formData = new FormData()
      formData.append('name', recipe.name)
      formData.append('ingredients', recipe.ingredients || '')
      formData.append('instructions', recipe.instructions || '')
      if (recipe.shopping_list) {
        formData.append('shopping_list', JSON.stringify(recipe.shopping_list))
      }
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const response = await fetch(`${API_BASE_URL}/recipe/`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to create recipe:', error)
      return null
    }
  }
}
