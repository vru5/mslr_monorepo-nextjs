/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required")
});

/**
 * Login Page
 */
const LoginPage = () => {
    const router = useRouter();

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" }
    });

    const onSubmit = async (values: z.infer<typeof loginSchema>) => {
        try{
            const response = await fetch("http://localhost:3001/mslr/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
            });

            const data = await response.json();

            if(!response.ok) {
                throw new Error(data.message || "Login Failed");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.user.role);

            toast.success("Login Successful!");

            if(data.user.role === "admin") {
                router.push("/dashboard/admin");
            } else {
                router.push("/dashboard/voter");
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">
                        Official Login
                    </CardTitle>
                    <CardDescription>
                        Enter your credentials to access the referendum system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                    <Input placeholder="ec@referendum.gov.sr" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Password</FormLabel>
                                        <Button 
                                            variant="link" 
                                            type="button" 
                                            className="px-0 font-normal h-auto text-xs text-muted-foreground"
                                            onClick={() => router.push("/forgot-password")}
                                        >
                                            Forgot password?
                                        </Button>
                                    </div>
                                    <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Authenticating..." : "Login"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center border-t bg-slate-50/50">
                    <Button variant="link" className="text-muted-foreground" onClick={() => router.push("/register")}>
                        {`Don't have an account?`} <span className="text-primary ml-1"> Please Register</span>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default LoginPage;