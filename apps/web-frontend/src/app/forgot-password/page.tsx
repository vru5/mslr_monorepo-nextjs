/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

/**
 * Forgot password schema
 */
const verifySchema = z.object({
  email: z.string().email("Invalid email address"),
  scc: z.string().length(10, "SCC must be exactly 10 characters"),
  dob: z.string().min(1, "Date of birth is required"),
});

/**
 * Password schema
 */
const passwordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

/**
 * Forgot Password page
 */
const ForgotPasswordPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);

  // 1. Setup Verification Form
  const verifyForm = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: { email: "", scc: "", dob: "" }
  });

  // 2. Setup Password Form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" }
  });

  // Step 1 Handler: Verify identity with backend
  const onVerify = async (values: z.infer<typeof verifySchema>) => {
    setIsVerifying(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mslr/auth/verify-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      toast.success("Identity verified successfully");
      setStep(2);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const onUpdatePassword = async (values: z.infer<typeof passwordSchema>) => {
    try {
      const email = verifyForm.getValues("email");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mslr/auth/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newPassword: values.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      toast.success("Password updated! Please login with your new credentials.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            {step === 1 ? (
              <ShieldCheck className="h-10 w-10 text-primary" />
            ) : (
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 1 ? "Verify Resident Identity" : "Reset Your Password"}
          </CardTitle>
          <CardDescription>
            {step === 1 
              ? "Provide your SCC and Date of Birth to prove your identity." 
              : "Identity confirmed. Enter your new secure password below."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          {step === 1 && (
            <Form {...verifyForm}>
              <form onSubmit={verifyForm.handleSubmit(onVerify)} className="space-y-4">
                <FormField
                  control={verifyForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registered Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={verifyForm.control}
                  name="scc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Security Challenge Code (SCC)</FormLabel>
                      <FormControl>
                        <Input placeholder="10-digit code" {...field} className="uppercase font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={verifyForm.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isVerifying}>
                  {isVerifying ? "Verifying..." : "Verify Details"}
                </Button>
              </form>
            </Form>
          )}

          {step === 2 && (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="*******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={passwordForm.formState.isSubmitting}>
                  {passwordForm.formState.isSubmitting ? "Saving..." : "Update Password"}
                </Button>
                <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full text-muted-foreground" 
                    onClick={() => setStep(1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
              </form>
            </Form>
          )}

        </CardContent>
        <CardFooter className="justify-center">
            <Button variant="link" onClick={() => router.push("/login")}>
                Return to Login
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;