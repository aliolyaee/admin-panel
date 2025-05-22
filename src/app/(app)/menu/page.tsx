"use client";

import * as React from "react";
import { BookOpenText, PlusCircle, Search, ListOrdered, Tag } from "lucide-react";
import type { MenuItem as MenuItemType, Category as CategoryType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { useMockData } from "@/hooks/use-mock-data";
import { MenuItemTable } from "./components/menu-item-table";
import { MenuItemFormDialog } from "./components/menu-item-form-dialog";
import { CategoryManagement } from "./components/category-management"; // New component
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { debounce } from "@/lib/utils";

const initialMenuItems: MenuItemType[] = [
  { id: "m1", name: "Spaghetti Carbonara", description: "Classic Italian pasta with eggs, cheese, pancetta, and pepper.", price: 15.99, categoryId: "c1", categoryName: "Pasta", imageUrl: "https://placehold.co/100x100.png", createdAt: new Date().toISOString(), tags: ["pasta", "italian", "classic"] },
  { id: "m2", name: "Margherita Pizza", description: "Simple and delicious pizza with tomato, mozzarella, and basil.", price: 12.50, categoryId: "c2", categoryName: "Pizza", imageUrl: "https://placehold.co/100x100.png", createdAt: new Date().toISOString(), tags: ["pizza", "vegetarian"] },
  { id: "m3", name: "Caesar Salad", description: "Crisp romaine lettuce with Caesar dressing, croutons, and Parmesan cheese.", price: 9.75, categoryId: "c3", categoryName: "Salads", imageUrl: "https://placehold.co/100x100.png", createdAt: new Date().toISOString(), tags: ["salad", "healthy"] },
];

const initialCategories: CategoryType[] = [
  { id: "c1", name: "Pasta", description: "All pasta dishes", createdAt: new Date().toISOString() },
  { id: "c2", name: "Pizza", description: "Freshly baked pizzas", createdAt: new Date().toISOString() },
  { id: "c3", name: "Salads", description: "Healthy and fresh salads", createdAt: new Date().toISOString() },
  { id: "c4", name: "Desserts", description: "Sweet treats", createdAt: new Date().toISOString() },
];

export default function MenuPage() {
  const { toast } = useToast();
  // Menu Items Data
  const {
    paginatedData: menuItems,
    currentPage,
    totalPages,
    totalItems,
    isLoading: itemsLoading,
    onPageChange,
    onSearch: onItemsSearch,
    addItem: addMenuItem,
    updateItem: updateMenuItem,
    deleteItem: deleteMenuItem,
    getItem: getMenuItem,
    itemsPerPage,
    originalDataCount: originalItemsCount,
  } = useMockData<MenuItemType>({ initialData: initialMenuItems, itemsPerPage: 5 });

  // Categories Data (Separate state for simplicity, can be combined or use another useMockData instance)
  const [categories, setCategories] = React.useState<CategoryType[]>(initialCategories);
  const [isItemFormOpen, setIsItemFormOpen] = React.useState(false);
  const [editingMenuItem, setEditingMenuItem] = React.useState<MenuItemType | null>(null);
  
  const debouncedItemsSearch = React.useCallback(debounce(onItemsSearch, 300), [onItemsSearch]);

  const handleAddMenuItem = () => {
    setEditingMenuItem(null);
    setIsItemFormOpen(true);
  };

  const handleEditMenuItem = (id: string) => {
    const itemToEdit = getMenuItem(id);
    if (itemToEdit) {
      setEditingMenuItem(itemToEdit);
      setIsItemFormOpen(true);
    }
  };

  const handleSubmitMenuItemForm = async (itemData: Omit<MenuItemType, 'id' | 'createdAt' | 'categoryName'> | MenuItemType) => {
    try {
      const category = categories.find(c => c.id === itemData.categoryId);
      const dataWithCategoryName = { ...itemData, categoryName: category?.name || "Uncategorized" };
      
      if ('id' in dataWithCategoryName) {
        await updateMenuItem(dataWithCategoryName.id, dataWithCategoryName);
        toast({ title: "Menu Item Updated", description: `Item ${dataWithCategoryName.name} has been updated.` });
      } else {
        await addMenuItem(dataWithCategoryName);
        toast({ title: "Menu Item Added", description: `Item ${dataWithCategoryName.name} has been added.` });
      }
      setIsItemFormOpen(false);
      setEditingMenuItem(null);
    } catch (error) {
       toast({ title: "Error", description: "An error occurred while saving the menu item.", variant: "destructive" });
    }
  };

  // Category CRUD operations (Simplified)
  const handleAddCategory = (category: CategoryType) => {
    setCategories(prev => [...prev, category]);
    toast({ title: "Category Added", description: `Category ${category.name} has been added.` });
  };
  const handleUpdateCategory = (updatedCategory: CategoryType) => {
    setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    toast({ title: "Category Updated", description: `Category ${updatedCategory.name} has been updated.` });
  };
  const handleDeleteCategory = (categoryId: string) => {
    // Check if category is in use by menu items before deleting
    const isInUse = menuItems.some(item => item.categoryId === categoryId);
    if (isInUse) {
      toast({ title: "Cannot Delete Category", description: "This category is currently assigned to one or more menu items.", variant: "destructive" });
      return;
    }
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    toast({ title: "Category Deleted", description: "The category has been deleted." });
  };


  return (
    <div className="space-y-6">
      <PageHeader title="Menu Management" description="Manage menu items and categories.">
        <Button onClick={handleAddMenuItem}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Menu Item
        </Button>
      </PageHeader>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items"><ListOrdered className="mr-2 h-4 w-4" />Menu Items</TabsTrigger>
          <TabsTrigger value="categories"><Tag className="mr-2 h-4 w-4" />Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="items" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search menu items..." 
                className="pl-10"
                onChange={(e) => debouncedItemsSearch(e.target.value)}
              />
            </div>
          </div>

          <MenuItemTable
            menuItems={menuItems}
            onEdit={handleEditMenuItem}
            onDelete={async (id) => {
              await deleteMenuItem(id);
              toast({ title: "Menu Item Deleted", description: "The item has been deleted from the menu." });
            }}
            isLoading={itemsLoading}
          />
          {originalItemsCount > 0 && totalPages > 0 && (
            <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
            />
          )}
          { originalItemsCount > 0 && totalItems === 0 && !itemsLoading && (
            <p className="text-center text-muted-foreground py-4">No menu items found matching your search criteria.</p>
          )}
          { originalItemsCount === 0 && !itemsLoading && (
             <div className="text-center py-10">
                <BookOpenText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No menu items yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new menu item.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManagement 
            categories={categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        </TabsContent>
      </Tabs>

      <MenuItemFormDialog
        isOpen={isItemFormOpen}
        onOpenChange={setIsItemFormOpen}
        onSubmit={handleSubmitMenuItemForm}
        menuItem={editingMenuItem}
        categories={categories}
      />
    </div>
  );
}
