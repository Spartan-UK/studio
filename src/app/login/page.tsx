
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
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("it@spartanuk.co.uk");
  const [password, setPassword] = useState("123123");
  const { toast } = useToast();
  const [showLogs, setShowLogs] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err: any) {
       toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
      });
    }
  };

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
                    />
                </div>
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                >
                    {loading ? "Signing in..." : "Sign In"}
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
