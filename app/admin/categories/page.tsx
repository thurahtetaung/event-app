"use client"

import { CategoryManagement } from "@/components/admin/CategoryManagement"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CategoriesPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Category Management</h1>
        <p className="text-muted-foreground">Manage event categories and their icons</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Create, edit, or delete event categories. Changes will be reflected across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryManagement />
        </CardContent>
      </Card>
    </div>
  )
}