"use client";

import * as React from "react";
import { Archive, PlusCircle, Search } from "lucide-react";
import type { Table as TableType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { useMockData } from "@/hooks/use-mock-data";
import { TableManagementTable } from "./components/table-management-table"; // Renamed for clarity
import { TableFormDialog } from "./components/table-form-dialog";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/utils";

const initialTables: TableType[] = [
  { id: "t1", name: "Table 1", capacity: 4, status: "available", createdAt: new Date(2023, 0, 10).toISOString() },
  { id: "t2", name: "Table 2", capacity: 2, status: "occupied", createdAt: new Date(2023, 0, 11).toISOString() },
  { id: "t3", name: "Bar Seat 1", capacity: 1, status: "reserved", createdAt: new Date(2023, 0, 12).toISOString() },
  { id: "t4", name: "Table 3 - Patio", capacity: 6, status: "available", createdAt: new Date(2023, 1, 5).toISOString() },
  { id: "t5", name: "VIP Booth", capacity: 8, status: "maintenance", createdAt: new Date(2023, 1, 15).toISOString() },
];

export default function TablesPage() {
  const { toast } = useToast();
  const {
    paginatedData: tables,
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
  } = useMockData<TableType>({ initialData: initialTables, itemsPerPage: 5 });

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTable, setEditingTable] = React.useState<TableType | null>(null);
  
  const debouncedSearch = React.useCallback(debounce(onSearch, 300), [onSearch]);

  const handleAddTable = () => {
    setEditingTable(null);
    setIsFormOpen(true);
  };

  const handleEditTable = (id: string) => {
    const tableToEdit = getItem(id);
    if (tableToEdit) {
      setEditingTable(tableToEdit);
      setIsFormOpen(true);
    }
  };

  const handleSubmitForm = async (tableData: Omit<TableType, 'id' | 'createdAt'> | TableType) => {
    try {
      if ('id' in tableData) {
        await updateItem(tableData.id, tableData);
        toast({ title: "Table Updated", description: `Table ${tableData.name} has been updated.` });
      } else {
        await addItem(tableData);
        toast({ title: "Table Added", description: `Table ${tableData.name} has been added.` });
      }
      setIsFormOpen(false);
      setEditingTable(null);
    } catch (error) {
      toast({ title: "Error", description: "An error occurred while saving the table.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Table Management" description="Manage all restaurant tables.">
        <Button onClick={handleAddTable}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Table
        </Button>
      </PageHeader>

      <div className="flex items-center justify-between gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tables (name, status)..." 
            className="pl-10"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
      </div>

      <TableManagementTable
        tables={tables}
        onEdit={handleEditTable}
        onDelete={async (id) => {
          await deleteItem(id);
          toast({ title: "Table Deleted", description: "The table has been successfully deleted." });
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
        <p className="text-center text-muted-foreground py-4">No tables found matching your search criteria.</p>
      )}
      { originalDataCount === 0 && !isLoading && (
        <div className="text-center py-10">
            <Archive className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No tables yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new table.</p>
            <div className="mt-6">
                <Button onClick={handleAddTable}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Table
                </Button>
            </div>
        </div>
      )}

      <TableFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitForm}
        table={editingTable}
      />
    </div>
  );
}

