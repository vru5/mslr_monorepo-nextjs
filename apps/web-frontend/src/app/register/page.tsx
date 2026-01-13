/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Camera, Upload, User, Mail, Calendar, Lock } from "lucide-react";

/**
 * Registration Schema
 */
const registrationSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    dob: z.string().refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if(m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age >= 18;
    }, "You must be at least 18 years old to register"),
    scc: z.string().length(10, "SCC must be exactly 10 characters"),
    password: z.string().min(8, "Password must be at least 8 characters")
});

/**
 * Registration Page for new users
 */
const RegisterPage = () => {
    const router = useRouter();
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const qrInstance = useRef<Html5Qrcode | null>(null);

    const form = useForm<z.infer<typeof registrationSchema>>({
        resolver: zodResolver(registrationSchema),
        defaultValues: { fullName: "", email: "", dob: "", scc: "", password: ""}
    });

    useEffect(() => {
        if (isScannerOpen) {
            const timer = setTimeout(() => {
                const html5QrCode = new Html5Qrcode("reader");
                qrInstance.current = html5QrCode;

                html5QrCode.start(
                    { facingMode: "environment" }, 
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        form.setValue("scc", decodedText, { shouldValidate: true });
                        toast.success("QR Code Scanned!");
                        handleCloseScanner();
                    },
                    () => {} 
                ).catch(err => {
                    console.error("Scanner error:", err);
                    toast.error("Camera access denied or error occurred.");
                });
            }, 300); // Wait for modal animation
            return () => clearTimeout(timer);
        }
    }, [isScannerOpen]);

    const handleCloseScanner = async () => {
        if (qrInstance.current && qrInstance.current.isScanning) {
            await qrInstance.current.stop();
        }
        setIsScannerOpen(false);
    };

    const handleUploadQR = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const html5QrCode = new Html5Qrcode("upload-process-node");
        try {
            const decodedText = await html5QrCode.scanFile(file, true);
            form.setValue("scc", decodedText, { shouldValidate: true });
            toast.success("SCC extracted from image!");
        } catch (err) {
            toast.error("Could not find a valid QR code in that image.");
        }
    };

    const onSubmit = async (values: z.infer<typeof registrationSchema>) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mslr/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
            });
            const data = await response.json();
            if(!response.ok) throw new Error(data.message || "Registration failed");
            toast.success("Account created successfully!");
            router.push("/login");
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <div id="upload-process-node" className="hidden"></div>

            <Card className="w-full max-w-xl shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight">Create an Account</CardTitle>
                    <CardDescription>Enter your details and scan your SCC to register</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-10" placeholder="Name" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} 
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field })=> (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-10" type="email" placeholder="name@example.com" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} 
                                />
                                <FormField
                                    control={form.control}
                                    name="dob"
                                    render={({ field })=> (
                                        <FormItem>
                                            <FormLabel>Date of Birth</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-10" type="date" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} 
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="scc"
                                render={({ field }) => (
                                    <FormItem className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                                        <FormLabel className="text-primary font-semibold">Shangri-La Citizen Code (SCC)</FormLabel>
                                        <FormControl>
                                            <Input className="bg-white uppercase font-mono tracking-widest" placeholder="10-DIGIT CODE" {...field} />
                                        </FormControl>
                                        
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => document.getElementById('qr-upload')?.click()}
                                            >
                                                <Upload className="w-4 h-4 mr-2" /> Upload QR
                                            </Button>
                                            <input id="qr-upload" type="file" accept="image/*" className="hidden" onChange={handleUploadQR} />

                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => setIsScannerOpen(true)}
                                            >
                                                <Camera className="w-4 h-4 mr-2" /> Scan QR
                                            </Button>
                                        </div>
                                        <FormDescription>Code found on your Council letter</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} 
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-10" type="password" placeholder="••••••••" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} 
                            />

                            <Button type="submit" className="w-full h-11" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Creating Account..." : "Register"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center border-t bg-slate-50/50">
                    <Button variant="link" className="text-muted-foreground" onClick={() => router.push("/login")}>
                        Already registered? <span className="text-primary ml-1">Login here</span>
                    </Button>
                </CardFooter>
            </Card>

            <Dialog open={isScannerOpen} onOpenChange={(v) => !v && handleCloseScanner()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Scan Council QR Code</DialogTitle></DialogHeader>
                    <div id="reader" className="w-full aspect-square bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center text-white">
                        Initializing Camera...
                    </div>
                    <p className="text-xs text-center text-muted-foreground italic">
                        Align the QR code within the frame
                    </p>
                    <Button variant="secondary" onClick={handleCloseScanner}>Cancel Scan</Button>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RegisterPage;