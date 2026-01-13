/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, ShieldCheck, Mail, Calendar } from "lucide-react";

/**
 * Displays the profile details
 */
export default function ProfilePage() {
  const [user, setUser] = useState<{ role: string; id?: string } | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUser({ role: role || "voter" });
  }, []);

  return (
    <DashboardShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">User Profile</h1>
        
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl capitalize">{user?.role} Account</CardTitle>
              <CardDescription>Official Registered Identity</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-slate-50/50">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Account Status</p>
                <p className="text-xs text-muted-foreground">Verified & Active</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Verified
              </Badge>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" /> System Role
                  </span>
                  <span className="font-medium capitalize">{user?.role}</span>
               </div>
               <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Session Started
                  </span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
               </div>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground italic">
          To change your official details, please contact the Council Election Office.
        </p>
      </div>
    </DashboardShell>
  );
}