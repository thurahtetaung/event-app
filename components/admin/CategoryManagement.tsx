"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import { getCategoryIcon, ICON_NAMES } from "@/lib/category-icons"

interface Category {
  id: string
  name: string
  icon: string
  createdAt: string
  updatedAt: string
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null)

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.categories.getAll()
      setCategories(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load categories')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateDialog = () => {
    setIsEditing(false)
    setCurrentCategory({ name: '', icon: 'Globe' })
    setDialogOpen(true)
  }

  const handleOpenEditDialog = (category: Category) => {
    setIsEditing(true)
    setCurrentCategory({ ...category })
    setDialogOpen(true)
  }

  const handleOpenDeleteDialog = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setCurrentCategory(null)
  }

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentCategory) return
    setCurrentCategory({
      ...currentCategory,
      [e.target.name]: e.target.value,
    })
  }

  const handleIconChange = (value: string) => {
    if (!currentCategory) return
    setCurrentCategory({
      ...currentCategory,
      icon: value,
    })
  }

  const handleSaveCategory = async () => {
    if (!currentCategory?.name) return

    setLoading(true)
    setError(null)

    try {
      if (isEditing && currentCategory.id) {
        // Update existing category
        await apiClient.categories.update(currentCategory.id, {
          name: currentCategory.name,
          icon: currentCategory.icon,
        })
      } else {
        // Create new category
        await apiClient.categories.create({
          name: currentCategory.name,
          icon: currentCategory.icon,
        })
      }

      // Refresh categories and close dialog
      await fetchCategories()
      handleDialogClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save category')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    setLoading(true)
    setError(null)

    try {
      await apiClient.categories.delete(categoryToDelete.id)

      // Refresh categories and close dialog
      await fetchCategories()
      handleDeleteDialogClose()
    } catch (err: any) {
      setError(err.message || 'Failed to delete category')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const renderIcon = (iconName: string) => {
    const Icon = getCategoryIcon(iconName)
    return <Icon className="h-5 w-5" />
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Button onClick={handleOpenCreateDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {loading && categories.length === 0 ? (
        <div className="flex justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center justify-center bg-muted w-8 h-8 rounded-full">
                      {renderIcon(category.icon)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(category)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(category)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Create/Edit Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the details of this category'
                : 'Create a new category for events'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={currentCategory?.name || ''}
                onChange={handleInputChange}
                placeholder="Category name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Select
                value={currentCategory?.icon || 'Globe'}
                onValueChange={handleIconChange}
              >
                <SelectTrigger id="icon">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ICON_NAMES.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center">
                          <span className="mr-2">{renderIcon(icon)}</span>
                          <span>{icon}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} disabled={loading || !currentCategory?.name}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "{categoryToDelete?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteDialogClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}