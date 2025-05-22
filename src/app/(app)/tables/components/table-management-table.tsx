"use client";

import * as React from "react";
import type { Table as TableType } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit3, Trash2, CheckCircle, XCircle, Clock, Tool } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface TableManagementTableProps {
  tables: TableType[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const statusConfig = {
  available: { label: "Available", icon: CheckCircle, color: "bg-green-500 dark:bg-green-400" },
  occupied: { label: "Occupied", icon: XCircle, color: "bg-red-500 dark:bg-red-400" },
  reserved: { label: "Reserved", icon: Clock, color: "bg-yellow-500 dark:bg-yellow-400" },
  maintenance: { label: "Maintenance", icon: Tool, color: "bg-gray-500 dark:bg-gray-400" },
};


export function TableManagementTable({ tables, onEdit, onDelete, isLoading }: TableManagementTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedTableId, setSelectedTableId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteClick = (id: string) => {
    setSelectedTableId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedTableId) {
      setIsDeleting(true);
      await onDelete(selectedTableId);
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedTableId(null);
    }
  };
  
  if (isLoading && tables.length === 0) {
    return (
      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="w-[100px]">Capacity</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[180px]">Created At</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="w-[100px]">Capacity</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[180px]">Created At</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map((table) => {
              const currentStatus = statusConfig[table.status] || { label: table.status, icon: CheckCircle, color: "bg-gray-400" };
              return (
                <TableRow key={table.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{table.name}</TableCell>
                  <TableCell>{table.capacity}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-xs">
                       <currentStatus.icon className={`mr-1.5 h-3 w-3 ${currentStatus.color.replace('bg-','text-')}`} />
                      {currentStatus.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(table.createdAt, 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(table.id)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(table.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemName="table"
        isLoading={isDeleting}
      />
    </>
  );
}
