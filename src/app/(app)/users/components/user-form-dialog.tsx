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
import type { User } from "@/types";

interface UserFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: Omit<User, 'id' | 'createdAt'> | User) => Promise<void>;
  user?: User | null; // For editing
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  role: z.enum(["admin", "staff"]),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional(),
});

// If editing, password is not required to change
const editFormSchema = formSchema.extend({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional().or(z.literal('')),
});


export function UserFormDialog({ isOpen, onOpenChange, onSubmit, user }: UserFormDialogProps) {
  const isEditing = !!user;
  const currentFormSchema = isEditing ? editFormSchema : formSchema;

  const form = useForm<z.infer<typeof currentFormSchema>>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "staff",
      password: "",
    },
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        role: user.role,
        password: "", // Don't prefill password for editing
      });
    } else {
      form.reset({
        name: "",
        email: "",
        role: "staff",
        password: "",
      });
    }
  }, [user, form, isOpen]); // Added isOpen to reset form when dialog opens for new user

  const handleSubmit = async (values: z.infer<typeof currentFormSchema>) => {
    setIsSubmitting(true);
    const submissionData: any = { ...values };
    if (isEditing && user) {
      submissionData.id = user.id;
      submissionData.createdAt = user.createdAt; // Preserve original creation date
      if (!values.password) { // If password field is empty during edit, don't update it
        delete submissionData.password;
      }
    }
    
    // For new users, if password is not provided, it's an error by schema unless optionalised further
    // The current schema requires password for new user.

    await onSubmit(submissionData);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) { // Reset form if dialog is closed without submitting
        form.reset();
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the user's details." : "Fill in the details for the new user."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEditing ? "New Password (optional)" : "Password"}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={isEditing ? "Leave blank to keep current" : "••••••••"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
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
                {isSubmitting ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add User")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
