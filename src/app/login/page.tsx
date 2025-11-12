
"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { LiveLogViewer } from "@/components/admin/live-log-viewer";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { login, loading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const [showLogs, setShowLogs] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password, { redirect: !showLogs, redirectPath: '/' });
    } catch (err: any) {
       toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
      });
    }
  };

  const isSignedIn = !!user;

  return (
    <div className={cn(
        "flex min-h-screen w-full justify-center bg-background p-4 transition-all duration-300",
        showLogs ? "items-start pt-16" : "items-center"
      )}>
        <div className="flex flex-col gap-8 w-full max-w-sm">
            <Card className="shadow-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Admin Login</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSignedIn}
                    autoComplete="off"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSignedIn}
                    autoComplete="new-password"
                    />
                </div>
                <Button
                    type="submit"
                    disabled={loading || isSignedIn}
                    className={cn(
                        "w-full",
                        isSignedIn && "bg-green-600 hover:bg-green-700"
                    )}
                >
                    {loading ? "Signing in..." : (isSignedIn ? "Signed In" : "Sign In")}
                </Button>
                </form>
            </CardContent>
            </Card>
            
            <div className="flex items-center space-x-2 justify-center">
                <Switch id="show-logs" checked={showLogs} onCheckedChange={setShowLogs} />
                <Label htmlFor="show-logs">Show Authentication Log</Label>
            </div>

            {showLogs && <LiveLogViewer />}
        </div>
    </div>
  );
}
