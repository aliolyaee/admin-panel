"use client";

import * as React from "react";
import { User, PlusCircle, Search } from "lucide-react";
import type { User as UserType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { useMockData } from "@/hooks/use-mock-data";
import { UserTable } from "./components/user-table";
import { UserFormDialog } from "./components/user-form-dialog";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/utils";

const initialUsers: UserType[] = [
  { id: "1", name: "Alice Wonderland", email: "alice@example.com", role: "admin", createdAt: new Date(2023, 0, 15).toISOString() },
  { id: "2", name: "Bob The Builder", email: "bob@example.com", role: "staff", createdAt: new Date(2023, 1, 20).toISOString() },
  { id: "3", name: "Charlie Chaplin", email: "charlie@example.com", role: "staff", createdAt: new Date(2023, 2, 10).toISOString() },
  { id: "4", name: "Diana Prince", email: "diana@example.com", role: "admin", createdAt: new Date(2023, 3, 5).toISOString() },
  { id: "5", name: "Edward Scissorhands", email: "edward@example.com", role: "staff", createdAt: new Date(2023, 4, 12).toISOString() },
];

export default function UsersPage() {
  const { toast } = useToast();
  const {
    paginatedData: users,
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
  } = useMockData<UserType>({ initialData: initialUsers, itemsPerPage: 5 });

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserType | null>(null);
  
  const debouncedSearch = React.useCallback(debounce(onSearch, 300), [onSearch]);


  const handleAddUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (id: string) => {
    const userToEdit = getItem(id);
    if (userToEdit) {
      setEditingUser(userToEdit);
      setIsFormOpen(true);
    }
  };

  const handleSubmitForm = async (userData: Omit<UserType, 'id' | 'createdAt'> | UserType) => {
    try {
      if ('id' in userData) { // Editing existing user
        await updateItem(userData.id, userData);
        toast({ title: "User Updated", description: `User ${userData.name} has been updated.` });
      } else { // Adding new user
        await addItem(userData);
        toast({ title: "User Added", description: `User ${userData.name} has been added.` });
      }
      setIsFormOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast({ title: "Error", description: "An error occurred while saving the user.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="Manage all users in the system.">
        <Button onClick={handleAddUser}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </PageHeader>

      <div className="flex items-center justify-between gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search users (name, email, role)..." 
            className="pl-10"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
      </div>
      
      <UserTable
        users={users}
        onEdit={handleEditUser}
        onDelete={async (id) => {
          await deleteItem(id);
          toast({ title: "User Deleted", description: "The user has been successfully deleted." });
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
        <p className="text-center text-muted-foreground py-4">No users found matching your search criteria.</p>
      )}
      { originalDataCount === 0 && !isLoading && (
        <div className="text-center py-10">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No users yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new user.</p>
            <div className="mt-6">
                <Button onClick={handleAddUser}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>
        </div>
      )}


      <UserFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitForm}
        user={editingUser}
      />
    </div>
  );
}
