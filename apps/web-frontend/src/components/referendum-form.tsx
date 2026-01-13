"use client";

import * as z from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

/**
 * Form schema validation using zod
 */
export const formSchema = z.object({
  referendum_title: z.string().min(5, "Title must be at least 5 characters"),
  referendum_desc: z.string().min(10, "Description must be at least 10 characters"),
  referendum_options: z.array(z.object({
    text: z.string().min(1, "Option text cannot be empty")
  })).min(2, "At least two referendum_options are required"),
});

/**
 * Interface for Reeferendum Form
 */
interface ReferendumFormProps {
  initialData?: z.infer<typeof formSchema>;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  submitLabel: string;
}

/**
 * Common Referendum form for reusability
 */
export function ReferendumForm({ initialData, onSubmit, submitLabel }: ReferendumFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      referendum_title: "",
      referendum_desc: "",
      referendum_options: [{ text: "Yes" }, { text: "No" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "referendum_options",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="referendum_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input placeholder="Referendum Title" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="referendum_desc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea placeholder="Details..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Options</FormLabel>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ text: "" })}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <FormField
                control={form.control}
                name={`referendum_options.${index}.text`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {fields.length > 2 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Form>
  );
}