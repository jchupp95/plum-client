import type { Recipe } from '@/types/recipe'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export class RecipeService {
  static async getRecipes(): Promise<Recipe[]> {
    const response = await fetch(`${API_BASE_URL}/recipe/overview`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  static async getRecipe(id: string): Promise<Recipe | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${id}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to fetch recipe from API:', error)
      return null
    }
  }
}
