
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex justify-center items-start w-full">
        <Card className="w-full max-w-4xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-3xl"><Shield />Data Protection & Privacy Policy</CardTitle>
            <CardDescription>How we collect, use, and protect your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm ">
            <div className="space-y-6 text-muted-foreground">
                <div>
                    <h4 className="font-bold text-lg text-foreground mb-2">Our Commitment</h4>
                    <p>Spartan IT is committed to protecting your privacy. This notice explains how we collect, use, and protect your personal information during your visit.</p>
                </div>
                
                <div>
                    <h4 className="font-bold text-lg text-foreground mt-4 mb-2">What Information We Collect</h4>
                    <p>For health, safety, and security purposes, we collect the following information upon check-in: your full name, company, the person you are visiting, and a photograph for your visitor badge. Your vehicle registration may also be collected for parking management.</p>
                </div>

                <div>
                    <h4 className="font-bold text-lg text-foreground mt-4 mb-2">How We Use Your Information</h4>
                    <p>Your information is used solely for managing your visit, ensuring site security, and for emergency contact purposes. It allows us to know who is on-site at any given time, which is critical in case of an evacuation or other emergency.</p>
                </div>

                <div>
                    <h4 className="font-bold text-lg text-foreground mt-4 mb-2">Data Storage and Retention</h4>
                    <p>Your personal data is stored securely within our visitor management system. In compliance with GDPR, your information will be automatically and permanently deleted from our records after 365 days. We do not share your data with any third parties unless required by law.</p>
                </div>
            </div>
        </CardContent>
        </Card>
    </div>
  );
}

    