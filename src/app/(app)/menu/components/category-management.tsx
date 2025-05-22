"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MoreHorizontal, Edit3, Trash2, PlusCircle, Tag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { generateMockId, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryManagementProps {
  categories: Category[];
  onAddCategory: (category: Category) => void;
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const categoryFormSchema = z.object({
  name: z.string().min(2, { message: "Category name must be at least 2 characters." }),
  description: z.string().optional(),
});

export function CategoryManagement({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryManagementProps) {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false); // For form submission
  const [isDeleting, setIsDeletingState] = React.useState(false); // For delete confirmation

  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "", description: "" },
  });

  React.useEffect(() => {
    if (editingCategory) {
      form.reset({ name: editingCategory.name, description: editingCategory.description || "" });
    } else {
      form.reset({ name: "", description: "" });
    }
  }, [editingCategory, form, isFormOpen]);

  const handleFormSubmit = async (values: z.infer<typeof categoryFormSchema>) => {
    setIsSubmitting(true);
    if (editingCategory) {
      onUpdateCategory({ ...editingCategory, ...values });
    } else {
      onAddCategory({ id: generateMockId(), createdAt: new Date().toISOString(), ...values });
    }
    setIsSubmitting(false);
    setIsFormOpen(false);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (categoryId: string) => {
    setDeletingCategoryId(categoryId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingCategoryId) {
      setIsDeletingState(true);
      onDeleteCategory(deletingCategoryId); // Assuming this might be async in future
      setIsDeletingState(false);
      setIsDeleteDialogOpen(false);
      setDeletingCategoryId(null);
    }
  };
  
  const isLoading = false; // Categories are managed locally, no async loading state for now

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>Add, edit, or delete menu categories.</CardDescription>
        </div>
        <Button onClick={openAddDialog} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && categories.length === 0 ? (
          <div className="space-y-2">
             {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-10">
            <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No categories yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new category.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {category.description || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                        {formatDate(category.createdAt, 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(category)}>
                            <Edit3 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(category.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Add/Edit Category Dialog */}
        <Dialog open={isFormOpen} onOpenChange={(open) => {
            if(!open) form.reset();
            setIsFormOpen(open);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
              <DialogDescription>
                {editingCategory ? "Update category details." : "Enter details for the new category."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Appetizers, Main Courses" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Briefly describe the category" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : (editingCategory ? "Save Changes" : "Add Category")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={confirmDelete}
          itemName="category"
          isLoading={isDeleting}
        />
      </CardContent>
    </Card>
  );
}
