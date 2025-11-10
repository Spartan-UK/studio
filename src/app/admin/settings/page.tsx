
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DebugConsole } from "@/components/admin/debug-console";

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      variant: "success",
      title: "Settings Saved",
      description: "Your changes have been successfully saved.",
    });
  };

  const badgeLogoPlaceholder = PlaceHolderImages.find(p => p.id === 'badge-logo-placeholder');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="debug">Debug Console</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>Manage general site settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input id="siteName" defaultValue="Spartan IT Headquarters" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications" className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email alerts for important events.</p>
                </div>
                <Switch id="emailNotifications" defaultChecked />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Badge Customization</CardTitle>
              <CardDescription>Customize the visitor and contractor badges.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Label>Badge Logo</Label>
                <div className="flex items-start gap-6">
                    <div className="p-2 border rounded-lg bg-muted">
                        {badgeLogoPlaceholder && (
                            <Image 
                                src={badgeLogoPlaceholder.imageUrl} 
                                alt="Badge Logo"
                                width={200}
                                height={100}
                                data-ai-hint={badgeLogoPlaceholder.imageHint}
                                className="rounded-md"
                            />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">Upload your company logo. Recommended size: 200x100px.</p>
                        <Button variant="outline">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Logo
                        </Button>
                    </div>
                </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </TabsContent>
        <TabsContent value="debug" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Firestore Permission Tester</CardTitle>
              <CardDescription>
                Use this tool to test read/write/delete permissions for different Firestore collections. 
                This helps diagnose security rule issues. Tests are performed on a dedicated 'debug_tests' collection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DebugConsole />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
