export interface Ingredient {
  name: string
}

export interface Recipe {
  id: number
  name: string
  image: string
  ingredients?: string
  instructions?: string
  shopping_list?: Ingredient[]
}