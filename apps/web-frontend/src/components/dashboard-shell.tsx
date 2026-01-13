/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

interface DashboardShellProps {
    children: React.ReactNode;
}

/**
 * Common side navigation bar for dashboard
 * @param param0 
 * @returns Side Navigation bar
 */
const DashboardShell = ({ children }: DashboardShellProps) => {
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("role");

        if(!token) {
            router.push("/login");
        } else {
            setRole(userRole);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.clear();
        router.push("/");
    }

    return (
        <div className="flex min-h-screen flex-col">
            {/** Top Navigation */}
            <header className="sticky top-0 z-40 border-b bg-blue-300">
                <div className="container flex h-16 items-center justify-between py-4">
                <div className="flex gap-6 md:gap-10">
                    <span className="font-bold text-xl text-primary">My Shangri-La Referendum System</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-black mr-2 capitalize">
                    {role} Account
                    </div>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
                </div>
            </header>
            <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] py-8">
                {/* Sidebar Navigation */}
                <aside className="hidden w-[200px] flex-col md:flex">
                <nav className="grid items-start gap-2">
                    <Button variant="ghost" className="justify-start font-medium" onClick={() => router.push(role === 'admin' ? '/dashboard/admin' : '/dashboard/voter')}>
                    Home
                    </Button>
                    {role === 'admin' && (
                    <Button variant="ghost" className="justify-start" onClick={() => router.push('/dashboard/admin/analytics')}>
                        View Analytics
                    </Button>
                    )}
                    <Button variant="ghost" className="justify-start" onClick={() => router.push('/dashboard/profile')}>
                    Profile
                    </Button>
                </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex w-full flex-1 flex-col overflow-hidden">
                {children}
                </main>
            </div>
        </div>
    );

}

export default DashboardShell;