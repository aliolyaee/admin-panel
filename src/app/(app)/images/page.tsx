"use client";

import * as React from "react";
import { Image as ImageIconLucide, PlusCircle, Search, UploadCloud } from "lucide-react";
import type { ManagedImage } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { useMockData } from "@/hooks/use-mock-data";
import { ImageGallery } from "./components/image-gallery";
import { ImageFormDialog } from "./components/image-form-dialog";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/utils";

const initialImages: ManagedImage[] = [
  { id: "img1", url: "https://placehold.co/600x400.png?text=Pasta+Dish", altText: "Delicious pasta dish", filename: "pasta.png", uploadedAt: new Date(2023, 5, 10).toISOString() },
  { id: "img2", url: "https://placehold.co/600x400.png?text=Restaurant+Interior", altText: "Cozy restaurant interior", filename: "interior.jpg", uploadedAt: new Date(2023, 5, 12).toISOString() },
  { id: "img3", url: "https://placehold.co/600x400.png?text=Pizza+Slice", altText: "Close-up of a pizza slice", filename: "pizza.png", uploadedAt: new Date(2023, 5, 15).toISOString() },
  { id: "img4", url: "https://placehold.co/600x400.png?text=Salad+Bowl", altText: "Fresh salad bowl", filename: "salad.jpg", uploadedAt: new Date(2023, 5, 18).toISOString() },
];

export default function ImagesPage() {
  const { toast } = useToast();
  const {
    paginatedData: images,
    currentPage,
    totalPages,
    totalItems,
    isLoading,
    onPageChange,
    onSearch,
    addItem,
    updateItem,
    deleteItem,
    getItem,
    itemsPerPage,
    originalDataCount
  } = useMockData<ManagedImage>({ initialData: initialImages, itemsPerPage: 8 }); // Show more images per page

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingImage, setEditingImage] = React.useState<ManagedImage | null>(null);
  
  const debouncedSearch = React.useCallback(debounce(onSearch, 300), [onSearch]);

  const handleAddImage = () => {
    setEditingImage(null);
    setIsFormOpen(true);
  };

  const handleEditImage = (id: string) => {
    const imageToEdit = getItem(id);
    if (imageToEdit) {
      setEditingImage(imageToEdit);
      setIsFormOpen(true);
    }
  };

  const handleSubmitForm = async (imageData: Omit<ManagedImage, 'id' | 'uploadedAt'> | ManagedImage) => {
    try {
      if ('id' in imageData) {
        await updateItem(imageData.id, imageData);
        toast({ title: "Image Updated", description: `Image ${imageData.filename || imageData.altText} has been updated.` });
      } else {
        // Simulate filename from URL if not provided
        const filename = imageData.url.substring(imageData.url.lastIndexOf('/') + 1) || "image.png";
        const newImageData = { ...imageData, filename: imageData.filename || filename };
        await addItem(newImageData);
        toast({ title: "Image Added", description: `Image ${newImageData.filename || newImageData.altText} has been added.` });
      }
      setIsFormOpen(false);
      setEditingImage(null);
    } catch (error) {
      toast({ title: "Error", description: "An error occurred while saving the image.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Image Management" description="Manage all images used in the system.">
        <Button onClick={handleAddImage}>
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
      </PageHeader>

      <div className="flex items-center justify-between gap-2">
         <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search images (alt text, filename)..." 
            className="pl-10"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
      </div>

      <ImageGallery
        images={images}
        onEdit={handleEditImage}
        onDelete={async (id) => {
          await deleteItem(id);
          toast({ title: "Image Deleted", description: "The image has been successfully deleted." });
        }}
        isLoading={isLoading}
      />
      
      {originalDataCount > 0 && totalPages > 0 && (
         <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
        />
      )}
       { originalDataCount > 0 && totalItems === 0 && !isLoading && (
        <p className="text-center text-muted-foreground py-4">No images found matching your search criteria.</p>
      )}
      { originalDataCount === 0 && !isLoading && (
        <div className="text-center py-10">
            <ImageIconLucide className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No images yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by uploading a new image.</p>
            <div className="mt-6">
                <Button onClick={handleAddImage}>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload Image
                </Button>
            </div>
        </div>
      )}

      <ImageFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitForm}
        image={editingImage}
      />
    </div>
  );
}
