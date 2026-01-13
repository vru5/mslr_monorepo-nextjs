/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import DashboardShell from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/**
 * @returns Graph Analytics for referendums
 */
export default function AnalyticsPage() {
  const [referendums, setReferendums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    const token = localStorage.getItem("token");
    try {
      // Note: Ensure this matches the route where you get the data
      const res = await fetch("http://localhost:3001/mslr/admin/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setReferendums(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <DashboardShell><div className="p-10 text-center text-muted-foreground">Loading voting results...</div></DashboardShell>;

  const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#0891b2'];

  return (
    <DashboardShell>
      <div className="w-full px-4 py-8 max-w-none space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">EC Analytics Dashboard</h1>
          <p className="text-muted-foreground text-lg">Detailed breakdown of live participation results.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {referendums.length > 0 ? (
            referendums.map((ref: any) => {
              // MATCHING YOUR STRUCTURE: ref.referendum_options is the array
              const chartData = (ref.referendum_options || []).map((opt: any) => {
                return {
                  label: opt.text || "Option",
                  value: Number(opt.votes) || 0
                };
              });

              // Sum the votes from the processed chartData
              const totalVotes = chartData.reduce((acc: number, curr: any) => acc + curr.value, 0);

              return (
                <Card key={ref._id} className="rounded-md border bg-white shadow-none overflow-hidden">
                  <CardHeader className="flex flex-row items-start justify-between border-b bg-slate-50/50 p-6">
                    <div className="space-y-1 pr-4">
                      <CardTitle className="text-xl font-bold text-slate-900 leading-snug">
                        {ref.referendum_title}
                      </CardTitle>
                      <CardDescription className="text-sm font-semibold text-blue-600">
                        Total Participation: {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={ref.status === 'open' ? 'default' : 'secondary'} 
                      className={
                        ref.status === 'open' ? 'bg-green-400' : 
                        (ref.status === 'created' ? 'bg-amber-500' : 'bg-red-400')
                      }
                    >
                      {ref.status?.toUpperCase()}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-[300px] w-full mt-2">
                      {totalVotes > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 40, top: 10, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide domain={[0, 'auto']} />
                            <YAxis 
                              dataKey="label" 
                              type="category" 
                              width={150} 
                              tick={{ fontSize: 11, fill: '#475569' }}
                            />
                            <Tooltip 
                              cursor={{ fill: '#f8fafc' }}
                              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={35}>
                              {chartData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground italic border border-dashed rounded-lg bg-slate-50">
                          Waiting for first votes...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-md bg-white">
              <p className="text-muted-foreground text-lg italic">No referendums available for analysis.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}