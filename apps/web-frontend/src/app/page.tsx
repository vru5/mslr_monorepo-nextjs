"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MoveRight, Vote, ShieldCheck, BarChart3 } from "lucide-react";

const LandingPage = () => {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Decorative Background Element */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      <main className="container relative flex flex-col items-center gap-8 py-20 text-center md:py-32">

        {/* Hero Title */}
        <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
          My Shangri-La Referendum (MSLR)
        </h1>

        {/* Call to Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" className="h-12 px-8" onClick={() => router.push("/register")}>
            New User? Register here <MoveRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8" onClick={() => router.push("/login")}>
            Sign In
          </Button>
        </div>

        {/* Features Preview */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold">Secure SCC Login</h3>
            <p className="text-sm text-muted-foreground">Encrypted security challenge codes for every resident.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Vote className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold">Anonymous Voting</h3>
            <p className="text-sm text-muted-foreground">Cast your ballot with complete privacy and integrity.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold">Real-time Analytics</h3>
            <p className="text-sm text-muted-foreground">EC monitors results as they happen with 50% auto-close logic.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;