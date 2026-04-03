import type { Recipe } from '@/types/recipe'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export class RecipeService {
  static async getRecipes(): Promise<Recipe[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/recipe/overview`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to fetch recipes from API:', error)
      // Fallback to mock data if API is not available
      return this.getMockRecipes()
    }
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

  private static getMockRecipes(): Recipe[] {
    return [
      {
        id: 1,
        name: 'Classic Spaghetti Carbonara',
        image: 'https://images.unsplash.com/photo-1551892376-2c0c5f4c8e8d?w=400&h=300&fit=crop'
      },
      {
        id: 2,
        name: 'Chicken Tikka Masala',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop'
      },
      {
        id: 3,
        name: 'Beef Stroganoff',
        image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop'
      },
      {
        id: 4,
        name: 'Vegetable Stir Fry',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop'
      }
    ]
  }
}