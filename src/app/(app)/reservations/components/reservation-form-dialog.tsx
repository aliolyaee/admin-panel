"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDate } from "@/lib/utils";
import type { Reservation, Table as TableType } from "@/types";
import { CalendarIcon } from "lucide-react";

interface ReservationFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: Omit<Reservation, 'id' | 'createdAt' | 'tableName'> | Reservation) => Promise<void>;
  reservation?: Reservation | null;
  tables: Pick<TableType, 'id' | 'name' | 'capacity'>[]; // Simplified table type for selection
}

const formSchema = z.object({
  customerName: z.string().min(2, { message: "Customer name must be at least 2 characters." }),
  customerPhone: z.string().min(7, { message: "Phone number seems too short." }), // Basic validation
  customerEmail: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  tableId: z.string().min(1, { message: "Please select a table." }),
  dateTime: z.date({ required_error: "Reservation date and time are required." }),
  guests: z.coerce.number().min(1, { message: "Number of guests must be at least 1." }),
  status: z.enum(["confirmed", "pending", "cancelled", "completed"]),
  notes: z.string().optional(),
});

export function ReservationFormDialog({ isOpen, onOpenChange, onSubmit, reservation, tables }: ReservationFormDialogProps) {
  const isEditing = !!reservation;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      tableId: "",
      dateTime: new Date(),
      guests: 1,
      status: "pending",
      notes: "",
    },
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (reservation) {
      form.reset({
        customerName: reservation.customerName,
        customerPhone: reservation.customerPhone,
        customerEmail: reservation.customerEmail || "",
        tableId: reservation.tableId,
        dateTime: new Date(reservation.dateTime),
        guests: reservation.guests,
        status: reservation.status,
        notes: reservation.notes || "",
      });
    } else {
      // Set default time to next hour for new reservations
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      form.reset({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        tableId: "",
        dateTime: nextHour,
        guests: 1,
        status: "pending",
        notes: "",
      });
    }
  }, [reservation, form, isOpen]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    // Convert date to ISO string before submitting
    const submissionData: any = { 
      ...values, 
      dateTime: values.dateTime.toISOString() 
    };
    if (isEditing && reservation) {
      submissionData.id = reservation.id;
      submissionData.createdAt = reservation.createdAt;
    }
    await onSubmit(submissionData);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        form.reset();
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Reservation" : "Add New Reservation"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the reservation details." : "Fill in the details for the new reservation."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 py-2 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="555-123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Email (Optional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.smith@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             <FormField
                control={form.control}
                name="dateTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date & Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              formatDate(field.value.toISOString(), "PPPp") // Format with time
                            ) : (
                              <span>Pick a date and time</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            // Preserve time if date is selected, or set default time for new date
                            const newDateTime = date || new Date();
                            if(field.value) { // If there was a previous value, try to keep its time
                                newDateTime.setHours(field.value.getHours());
                                newDateTime.setMinutes(field.value.getMinutes());
                            } else { // Default time for a newly picked date (e.g. noon)
                                newDateTime.setHours(12,0,0,0);
                            }
                            field.onChange(newDateTime);
                          }}
                          initialFocus
                        />
                        {/* Simple Time Picker - replace with a better one if needed */}
                        <div className="p-2 border-t">
                           <Input 
                             type="time"
                             value={field.value ? `${String(field.value.getHours()).padStart(2,'0')}:${String(field.value.getMinutes()).padStart(2,'0')}` : "12:00"}
                             onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':').map(Number);
                                const newDate = field.value ? new Date(field.value) : new Date();
                                newDate.setHours(hours, minutes);
                                field.onChange(newDate);
                             }}
                             className="w-full"
                           />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="guests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Guests</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="e.g., 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               <FormField
                control={form.control}
                name="tableId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a table" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tables.map(table => (
                          <SelectItem key={table.id} value={table.id}>
                            {table.name} (Capacity: {table.capacity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Birthday celebration, dietary restrictions" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                 {isSubmitting ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {isSubmitting ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add Reservation")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
