/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import * as z from "zod";
import { toast } from "sonner";
import DashboardShell from "@/components/dashboard-shell";
import { formSchema, ReferendumForm } from "@/components/referendum-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Update Referendum form
 */
export default function EditReferendum() {
  const { id } = useParams();
  const router = useRouter();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRef = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mslr/admin/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const all = await res.json();
        
        const current = Array.isArray(all) ? all.find((r: any) => r._id === id) : null;
        
        if (current) {
          if (current.status !== 'created') {
            toast.error("Referendums become read-only once they are opened.");
            router.push("/dashboard/admin");
            return;
          }

          setInitialData({
            referendum_title: current.referendum_title,
            referendum_desc: current.referendum_desc,
            referendum_options: current.referendum_options.map((o: any) => ({ text: o.text }))
          });
        } else {
          toast.error("Referendum not found");
          router.push("/dashboard/admin");
        }
      } catch (err) {
        toast.error("Failed to load referendum data");
      } finally {
        setLoading(false);
      }
    };
    fetchRef();
  }, [id, router]);

  const handleUpdate = async (values: z.infer<typeof formSchema>) => {
    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        referendum_title: values.referendum_title,
        referendum_desc: values.referendum_desc,
        referendum_options: values.referendum_options.map(o => ({ text: o.text, votes: 0 })) 
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mslr/admin/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Update failed");
      }

      toast.success("Referendum updated!");
      router.push("/dashboard/admin");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading referendum details...</div>;

  return (
    <DashboardShell>
      <div className="w-full py-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Edit Referendum</h1>
        <Card>
          <CardHeader>
            <CardTitle>Referendum Details</CardTitle>
          </CardHeader>
          <CardContent>
            {initialData && (
              <ReferendumForm 
                initialData={initialData} 
                onSubmit={handleUpdate} 
                submitLabel="Update Referendum" 
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}