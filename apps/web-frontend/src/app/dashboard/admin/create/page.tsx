/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DashboardShell from "@/components/dashboard-shell";
import { formSchema, ReferendumForm } from "@/components/referendum-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as z from "zod";

/**
 * Create referendum form
 */
const CreateReferendum = () => {
  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mslr/admin/create`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create referendum");
      }

      toast.success("Referendum created successfully!");
      router.push("/dashboard/admin");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <DashboardShell>
      <div className="w-full py-4 py-8">
          <h1 className="text-3xl font-bold">Create Referendum</h1>
          <p className="text-muted-foreground">
            Fill in the details below to launch a new public vote.
          </p>
          <br />
        <Card>
          <CardHeader>
            <CardTitle>Referendum Details</CardTitle>
          </CardHeader>
          <CardContent>
            {/* We don't need initialData for creation as the component 
                defaults to empty strings and Yes/No options.
            */}
            <ReferendumForm 
              onSubmit={onSubmit} 
              submitLabel="Launch Referendum" 
            />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
};

export default CreateReferendum;