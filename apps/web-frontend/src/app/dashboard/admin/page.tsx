/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DashboardShell from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Option {
    text: string;
    votes: number;
}

interface Referendum {
    _id: string;
    referendum_title: string;
    status: 'created' | 'open' | 'closed';
    referendum_options: Option[];
}

/**
 * Admin Dashboard displaying Referendum details which user can create, edit or view analytics
 * @returns table with referendum details
 */
const AdminDashboard = () => {
    const router = useRouter();
    const [referendums, setReferendums] = useState<Referendum[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReferendums = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mslr/admin/all`, {
                headers: { Authorization: `Bearer ${token}`},
            });

            const data = await response.json();
            setReferendums(data);
        } catch (err: any) {
            toast.error("Failed to load referndums");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferendums();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mslr/admin/${id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) { 
            toast.success(`Referendum is now ${newStatus}`);
            fetchReferendums();
        } else {
            const errorData = await response.json();
            toast.error(errorData.message || "Failed to update status");
        }
    } catch (err: any) {
        toast.error("Could not update status");
    }
};
    
    return (
        <DashboardShell>
            <div className="w-full px-2 sm:px-6 lg:px-8 py-8 max-w-none">
                
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">EC Control Panel</h1>
                        <p className="text-muted-foreground">Manage and monitor live voting analytics.</p>
                    </div>
                    <Button onClick={() => router.push('/dashboard/admin/create')}>
                        Create Referendum
                    </Button>
                </div>

                <div className="rounded-md border bg-white w-full overflow-hidden">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total Votes</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.isArray(referendums) && referendums.map((ref) => {
                                const totalVotes = ref.referendum_options.reduce((sum, opt) => sum + opt.votes, 0);
                                const isEditable = ref.status === 'created';

                                return (
                                    <TableRow key={ref._id} className="hover:bg-slate-50 transition-colors">
                                        <TableCell className="font-medium py-4">{ref.referendum_title}</TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={ref.status === 'open' ? 'default' : 'secondary'} 
                                                className={ref.status === 'open' ? 'bg-green-500' : (ref.status === 'created' ? 'bg-amber-500' : 'bg-red-400')}
                                            >
                                                {ref.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{totalVotes}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {ref.status === 'created' && (
                                                <Button size="sm" onClick={() => updateStatus(ref._id, 'open')}>Open Voting</Button>
                                            )}
                                            {ref.status === 'open' && (
                                                <Button size="sm" variant="destructive" className="bg-red-500" onClick={() => updateStatus(ref._id, 'closed')}>Close</Button>
                                            )}
                                            {isEditable ? (
                                                <Button size="sm" variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50" onClick={() => router.push(`/dashboard/admin/edit/${ref._id}`)}>
                                                    Edit
                                                </Button>
                                            ) : (
                                                <Button size="sm" variant="outline" className="border-blue-400 text-blue-600 hover:bg-blue-50" onClick={() => router.push(`/dashboard/admin/analytics`)}>
                                                    View Analytics
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </DashboardShell>
  );
}

export default AdminDashboard;