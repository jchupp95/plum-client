import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MobileLayout, type AppPage } from '@/components/mobile-layout'
import type { Recipe, Ingredient } from '@/types/recipe'
import { RecipeService } from '@/services/service'

interface RecipeCreatePageProps {
  currentPage: AppPage
  onNavigate: (page: AppPage, recipeId?: number) => void
  onBack: () => void
}

interface FormDataWithImage extends Omit<Recipe, 'id'> {
  imageFile?: File
}

export function RecipeCreatePage({
  currentPage,
  onNavigate,
  onBack,
}: RecipeCreatePageProps) {
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<FormDataWithImage>({
    name: '',
    image: '',
    ingredients: '',
    instructions: '',
    shopping_list: [],
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [newIngredient, setNewIngredient] = useState('')
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([])
  const [suggestedIngredients, setSuggestedIngredients] = useState<Ingredient[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAllIngredients()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchAllIngredients = async () => {
    try {
      const ingredients = await RecipeService.getAllIngredients()
      setAllIngredients(ingredients)
    } catch (err) {
      console.error('Failed to fetch ingredients:', err)
    }
  }

  const handleIngredientInputChange = (value: string) => {
    setNewIngredient(value)

    if (value.trim().length === 0) {
      setSuggestedIngredients([])
      setShowSuggestions(false)
      return
    }

    // Filter ingredients that match the input and aren't already added
    const currentNames = formData.shopping_list?.map((item) =>
      item.name.toLowerCase()
    ) || []
    const filtered = allIngredients.filter(
      (ingredient) =>
        ingredient.name.toLowerCase().includes(value.toLowerCase()) &&
        !currentNames.includes(ingredient.name.toLowerCase())
    )

    setSuggestedIngredients(filtered)
    setShowSuggestions(filtered.length > 0 || value.trim().length > 0)
  }

  const handleSelectIngredient = (ingredient: Ingredient) => {
    const updatedList = [...(formData.shopping_list || [])]
    // Check if already exists
    const exists = updatedList.some(
      (item) => item.name.toLowerCase() === ingredient.name.toLowerCase()
    )
    if (!exists) {
      updatedList.push(ingredient)
      setFormData({
        ...formData,
        shopping_list: updatedList,
      })
    }

    setNewIngredient('')
    setSuggestedIngredients([])
    setShowSuggestions(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({
        ...formData,
        imageFile: file,
      })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Recipe name is required')
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      const { imageFile, ...recipeData } = formData
      const created = await RecipeService.createRecipe(recipeData, imageFile)
      if (created) {
        onNavigate('recipes')
      } else {
        setError('Failed to create recipe')
      }
    } catch (err) {
      setError('Failed to create recipe')
      console.error('Error creating recipe:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (
    field: keyof Recipe,
    value: string | Ingredient[]
  ) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleAddIngredient = () => {
    if (!newIngredient.trim()) return

    const updatedList = [...(formData.shopping_list || [])]
    // Check if ingredient already exists (case-insensitive)
    const exists = updatedList.some(
      (item) => item.name.toLowerCase() === newIngredient.toLowerCase()
    )

    if (!exists) {
      updatedList.push({ name: newIngredient, recipes: [] })
      setFormData({
        ...formData,
        shopping_list: updatedList,
      })
    }

    setNewIngredient('')
    setSuggestedIngredients([])
    setShowSuggestions(false)
  }

  const handleRemoveIngredient = (index: number) => {
    const updatedList = formData.shopping_list?.filter((_, i) => i !== index) || []
    setFormData({
      ...formData,
      shopping_list: updatedList,
    })
  }

  return (
    <MobileLayout
      title="Create Recipe"
      currentPage={currentPage}
      onNavigate={onNavigate}
      showBottomNav={false}
    >
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-primary mb-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <Card className="mb-4">
          <CardContent className="pt-6">
            {/* Image Section */}
            <div className="mb-4 rounded-lg overflow-hidden bg-muted">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Recipe preview"
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">No image selected</p>
                </div>
              )}

              <div className="p-4 border-t">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm"
                />
                {imagePreview && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Image will be saved with the recipe
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Recipe Name */}
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Recipe Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  placeholder="Enter recipe name"
                />
              </div>

              {/* Ingredients Section */}
              <div>
                <h3 className="font-semibold mb-2">Ingredients</h3>
                <textarea
                  value={formData.ingredients}
                  onChange={(e) => handleInputChange('ingredients', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-[100px] font-mono text-sm"
                  placeholder="Enter ingredients (one per line)"
                />
              </div>

              {/* Instructions Section */}
              <div>
                <h3 className="font-semibold mb-2">Instructions</h3>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-[100px] font-mono text-sm"
                  placeholder="Enter instructions"
                />
              </div>

              {/* Shopping List Items Section */}
              <div>
                <h3 className="font-semibold mb-2">Shopping List Items</h3>
                <div className="space-y-2">
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(formData.shopping_list || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 bg-muted rounded"
                      >
                        <span className="text-sm flex-1">{item.name}</span>
                        <button
                          onClick={() => handleRemoveIngredient(idx)}
                          className="p-1 hover:bg-destructive/20 rounded transition-colors"
                          type="button"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2 relative">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newIngredient}
                        onChange={(e) => handleIngredientInputChange(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddIngredient()
                          }
                        }}
                        onFocus={() => {
                          if (newIngredient.trim().length > 0) {
                            setShowSuggestions(true)
                          }
                        }}
                        placeholder="Search or add item..."
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                        autoComplete="off"
                      />

                      {/* Suggestions Dropdown */}
                      {showSuggestions && (
                        <div
                          ref={suggestionsRef}
                          className="absolute top-full left-0 right-0 mt-1 border border-input rounded-md bg-background shadow-lg z-10 max-h-40 overflow-y-auto"
                        >
                          {suggestedIngredients.length > 0 ? (
                            <>
                              {suggestedIngredients.map((ingredient) => (
                                <button
                                  key={ingredient.name}
                                  onClick={() => handleSelectIngredient(ingredient)}
                                  className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm"
                                  type="button"
                                >
                                  {ingredient.name}
                                </button>
                              ))}
                              {newIngredient.trim().length > 0 &&
                                !suggestedIngredients.some(
                                  (i) =>
                                    i.name.toLowerCase() ===
                                    newIngredient.toLowerCase()
                                ) && (
                                  <button
                                    onClick={handleAddIngredient}
                                    className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm border-t font-semibold text-primary"
                                    type="button"
                                  >
                                    + Create new: &quot;{newIngredient}&quot;
                                  </button>
                                )}
                            </>
                          ) : (
                            <button
                              onClick={handleAddIngredient}
                              className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm font-semibold text-primary"
                              type="button"
                            >
                              + Create new: &quot;{newIngredient}&quot;
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleAddIngredient}
                      className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      type="button"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && <p className="text-destructive text-sm">{error}</p>}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1"
                  variant="default"
                >
                  {isSaving ? 'Creating...' : 'Create Recipe'}
                </Button>
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="flex-1"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}
