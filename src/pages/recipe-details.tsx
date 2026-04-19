import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Trash2, Plus, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MobileLayout, type AppPage } from '@/components/mobile-layout'
import type { Recipe, Ingredient } from '@/types/recipe'
import { getRecipeImageUrl, RecipeService } from '@/services/service'

interface RecipeDetailsPageProps {
  currentPage: AppPage
  recipeId: number
  onNavigate: (page: AppPage) => void
  onBack: () => void
}

interface FormDataWithImage extends Omit<Recipe, 'id'> {
  imageFile?: File
}

export function RecipeDetailsPage({
  currentPage,
  recipeId,
  onNavigate,
  onBack,
}: RecipeDetailsPageProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<FormDataWithImage | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [newIngredient, setNewIngredient] = useState('')
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([])
  const [suggestedIngredients, setSuggestedIngredients] = useState<Ingredient[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchRecipeDetails()
    fetchAllIngredients()
  }, [recipeId])

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

  const fetchRecipeDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await RecipeService.getRecipe(recipeId)
      if (data) {
        setRecipe(data)
        setFormData(data)
        setImagePreview(null)
      } else {
        setError('Recipe not found')
      }
    } catch (err) {
      setError('Failed to load recipe details')
      console.error('Error fetching recipe details:', err)
    } finally {
      setLoading(false)
    }
  }

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
    const currentNames = formData?.shopping_list?.map((item) =>
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
    if (!formData) return

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
    if (file && formData) {
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
    if (!formData) return

    try {
      setIsSaving(true)
      setError(null)
      const { imageFile, ...recipeData } = formData
      const updated = await RecipeService.updateRecipe(
        recipeId,
        recipeData,
        imageFile
      )
      if (updated) {
        setRecipe(updated)
        setFormData(updated)
        setImagePreview(null)
        setIsEditing(false)
      } else {
        setError('Failed to save recipe')
      }
    } catch (err) {
      setError('Failed to save recipe')
      console.error('Error saving recipe:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe?')) {
      return
    }

    try {
      setError(null)
      const success = await RecipeService.deleteRecipe(recipeId)
      if (success) {
        onBack()
      } else {
        setError('Failed to delete recipe')
      }
    } catch (err) {
      setError('Failed to delete recipe')
      console.error('Error deleting recipe:', err)
    }
  }

  const handleInputChange = (
    field: keyof Recipe,
    value: string | Ingredient[]
  ) => {
    if (formData) {
      setFormData({
        ...formData,
        [field]: value,
      })
    }
  }

  const handleAddIngredient = () => {
    if (!newIngredient.trim() || !formData) return

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
    if (!formData) return

    const updatedList = formData.shopping_list?.filter((_, i) => i !== index) || []
    setFormData({
      ...formData,
      shopping_list: updatedList,
    })
  }

  if (loading) {
    return (
      <MobileLayout
        title="Recipe Details"
        currentPage={currentPage}
        onNavigate={onNavigate}
        showBottomNav={false}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading recipe...</p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  if (error || !recipe) {
    return (
      <MobileLayout
        title="Recipe Details"
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
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-destructive mb-4">{error || 'Recipe not found'}</p>
              <button
                onClick={fetchRecipeDetails}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </MobileLayout>
    )
  }

  const displayImage = imagePreview || getRecipeImageUrl(recipe.image)

  return (
    <MobileLayout
      title={isEditing ? 'Edit Recipe' : 'Recipe Details'}
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
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={recipe.name}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">No image</p>
                </div>
              )}

              {isEditing && (
                <div className="p-4 border-t">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm"
                  />
                  {imagePreview && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Image will be updated on save
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Recipe Name */}
              {isEditing ? (
                <input
                  type="text"
                  value={formData?.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  placeholder="Recipe name"
                />
              ) : (
                <h2 className="text-2xl font-bold">{recipe.name}</h2>
              )}

              {/* Ingredients Section */}
              <div>
                <h3 className="font-semibold mb-2">Ingredients</h3>
                {isEditing ? (
                  <textarea
                    value={formData?.ingredients || ''}
                    onChange={(e) => handleInputChange('ingredients', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-[100px] font-mono text-sm"
                    placeholder="Enter ingredients (one per line)"
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {recipe.ingredients || 'No ingredients listed'}
                  </p>
                )}
              </div>

              {/* Instructions Section */}
              <div>
                <h3 className="font-semibold mb-2">Instructions</h3>
                {isEditing ? (
                  <textarea
                    value={formData?.instructions || ''}
                    onChange={(e) => handleInputChange('instructions', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-[100px] font-mono text-sm"
                    placeholder="Enter instructions"
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {recipe.instructions || 'No instructions listed'}
                  </p>
                )}
              </div>

              {/* Shopping List Items Section */}
              <div>
                <h3 className="font-semibold mb-2">Shopping List Items</h3>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {(formData?.shopping_list || []).map((item, idx) => (
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
                ) : (
                  <div className="space-y-1">
                    {(recipe.shopping_list || []).length > 0 ? (
                      (recipe.shopping_list || []).map((item, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          • {item.name}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No shopping list items
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && <p className="text-destructive text-sm">{error}</p>}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1"
                      variant="default"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false)
                        setFormData(recipe)
                        setImagePreview(null)
                      }}
                      variant="outline"
                      className="flex-1"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="default"
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={handleDelete}
                      variant="destructive"
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}
