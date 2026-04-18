export interface IngredientRecipeReference {
  id?: number
  name: string
  image?: string
}

export interface Ingredient {
  id?: number
  name: string
  recipes: IngredientRecipeReference[] | string[]
}

export interface Recipe {
  id: number
  name: string
  image: string
  ingredients?: string
  instructions?: string
  shopping_list?: Ingredient[]
}
