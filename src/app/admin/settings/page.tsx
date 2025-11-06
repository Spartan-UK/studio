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

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your changes have been successfully saved.",
    });
  };

  const badgeLogoPlaceholder = PlaceHolderImages.find(p => p.id === 'badge-logo-placeholder');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
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
    </div>
  );
}
