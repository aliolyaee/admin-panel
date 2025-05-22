"use client";

import * as React from "react";
import { CalendarCheck, PlusCircle, Search, Filter } from "lucide-react";
import type { Reservation as ReservationType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { useMockData } from "@/hooks/use-mock-data";
import { ReservationTable } from "./components/reservation-table";
import { ReservationFormDialog } from "./components/reservation-form-dialog";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn, debounce, formatDate } from "@/lib/utils";

const initialReservations: ReservationType[] = [
  { id: "r1", customerName: "John Smith", customerPhone: "555-1234", tableId: "t1", dateTime: new Date(2024, 6, 20, 18, 0).toISOString(), guests: 2, status: "confirmed", createdAt: new Date(2024, 6, 1).toISOString(), tableName: "Table 1" },
  { id: "r2", customerName: "Emily Jones", customerPhone: "555-5678", tableId: "t2", dateTime: new Date(2024, 6, 21, 19, 30).toISOString(), guests: 4, status: "pending", createdAt: new Date(2024, 6, 2).toISOString(), tableName: "Table 2" },
  { id: "r3", customerName: "Michael Brown", customerPhone: "555-8765", tableId: "t4", dateTime: new Date(2024, 6, 22, 20, 0).toISOString(), guests: 3, status: "cancelled", createdAt: new Date(2024, 6, 3).toISOString(), tableName: "Table 3 - Patio" },
];

// This is a simplified list of tables for the form. In a real app, this would be fetched.
const MOCK_TABLES = [
  { id: "t1", name: "Table 1", capacity: 4},
  { id: "t2", name: "Table 2", capacity: 2},
  { id: "t3", name: "Bar Seat 1", capacity: 1},
  { id: "t4", name: "Table 3 - Patio", capacity: 6},
  { id: "t5", name: "VIP Booth", capacity: 8},
];

export default function ReservationsPage() {
  const { toast } = useToast();
  const {
    paginatedData: reservations,
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
  } = useMockData<ReservationType>({ initialData: initialReservations, itemsPerPage: 5 });

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingReservation, setEditingReservation] = React.useState<ReservationType | null>(null);
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [filterDate, setFilterDate] = React.useState<Date | undefined>(undefined);
  
  const debouncedSearch = React.useCallback(debounce(onSearch, 300), [onSearch]);


  // Client-side filtering example (can be combined with server-side search/filter)
  const filteredReservations = React.useMemo(() => {
    return reservations.filter(res => {
      const statusMatch = filterStatus === "all" || res.status === filterStatus;
      const dateMatch = !filterDate || new Date(res.dateTime).toDateString() === filterDate.toDateString();
      return statusMatch && dateMatch;
    });
  }, [reservations, filterStatus, filterDate]);

  const handleAddReservation = () => {
    setEditingReservation(null);
    setIsFormOpen(true);
  };

  const handleEditReservation = (id: string) => {
    const reservationToEdit = getItem(id);
    if (reservationToEdit) {
      setEditingReservation(reservationToEdit);
      setIsFormOpen(true);
    }
  };

  const handleSubmitForm = async (reservationData: Omit<ReservationType, 'id' | 'createdAt'> | ReservationType) => {
     try {
      // Add tableName for display convenience
      const table = MOCK_TABLES.find(t => t.id === reservationData.tableId);
      const dataWithTableName = { ...reservationData, tableName: table?.name || "Unknown Table" };

      if ('id' in dataWithTableName) {
        await updateItem(dataWithTableName.id, dataWithTableName);
        toast({ title: "Reservation Updated", description: `Reservation for ${dataWithTableName.customerName} has been updated.` });
      } else {
        await addItem(dataWithTableName);
        toast({ title: "Reservation Added", description: `Reservation for ${dataWithTableName.customerName} has been added.` });
      }
      setIsFormOpen(false);
      setEditingReservation(null);
    } catch (error) {
      toast({ title: "Error", description: "An error occurred while saving the reservation.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reservation Management" description="Manage all customer reservations.">
        <Button onClick={handleAddReservation}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Reservation
        </Button>
      </PageHeader>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border rounded-lg shadow-sm bg-card">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, phone..." 
            className="pl-10"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full md:w-[240px] justify-start text-left font-normal",
                  !filterDate && "text-muted-foreground"
                )}
              >
                <CalendarCheck className="mr-2 h-4 w-4" />
                {filterDate ? formatDate(filterDate.toISOString(), 'PPP') : <span>Filter by date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filterDate}
                onSelect={setFilterDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {(filterStatus !== 'all' || filterDate) && (
            <Button variant="ghost" onClick={() => { setFilterStatus('all'); setFilterDate(undefined); }}>Clear Filters</Button>
          )}
        </div>
      </div>

      <ReservationTable
        reservations={filteredReservations} // Use client-side filtered data
        onEdit={handleEditReservation}
        onDelete={async (id) => {
          await deleteItem(id);
          toast({ title: "Reservation Deleted", description: "The reservation has been successfully deleted." });
        }}
        isLoading={isLoading}
      />
      
      {/* Pagination should consider the filtered data length if filtering is purely client-side */}
      {/* For server-side, totalItems would come from API based on filters */}
      {originalDataCount > 0 && Math.ceil(filteredReservations.length / itemsPerPage) > 0 && (
         <DataTablePagination
            currentPage={currentPage} // This needs to be adjusted if filtering is purely client-side
            totalPages={Math.ceil(filteredReservations.length / itemsPerPage)} // Adjust total pages based on filtered data
            onPageChange={onPageChange} // This might need adjustment for client-side filtering to reset page
            itemsPerPage={itemsPerPage}
            totalItems={filteredReservations.length} // Total items based on filtered data
        />
      )}
       { originalDataCount > 0 && filteredReservations.length === 0 && !isLoading && (
        <p className="text-center text-muted-foreground py-4">No reservations found matching your criteria.</p>
      )}
      { originalDataCount === 0 && !isLoading && (
        <div className="text-center py-10">
            <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No reservations yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new reservation.</p>
            <div className="mt-6">
                <Button onClick={handleAddReservation}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Reservation
                </Button>
            </div>
        </div>
      )}

      <ReservationFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitForm}
        reservation={editingReservation}
        tables={MOCK_TABLES}
      />
    </div>
  );
}
