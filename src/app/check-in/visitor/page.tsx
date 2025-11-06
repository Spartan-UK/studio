"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, User, Building, Car, CheckCircle, Shield, Printer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Progress } from "@/components/ui/progress";

type VisitorData = {
  fullName: string;
  company: string;
  personVisiting: string;
  vehicleReg: string;
  photo: string | null;
  consent: boolean;
};

const initialData: VisitorData = {
  fullName: "",
  company: "",
  personVisiting: "",
  vehicleReg: "",
  photo: null,
  consent: false,
};

export default function VisitorCheckInPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<VisitorData>(initialData);
  const [progress, setProgress] = useState(25);

  const handleNext = () => {
    setStep(step + 1);
    setProgress(progress + 25);
  };
  
  const handleBack = () => {
    setStep(step - 1);
    setProgress(progress - 25);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  
  const handleSubmit = () => {
    console.log("Submitting Visitor Data:", formData);
    // Here you would typically save to Firestore
    handleNext();
  };

  const visitorPhotoPlaceholder = PlaceHolderImages.find(p => p.id === 'visitor-photo-placeholder');

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User/>Visitor Details</CardTitle>
              <CardDescription>Please enter your information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Your Company</Label>
                <Input id="company" placeholder="Acme Corporation" value={formData.company} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personVisiting">Person Visiting</Label>
                <Input id="personVisiting" placeholder="Jane Smith" value={formData.personVisiting} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleReg">Vehicle Registration (Optional)</Label>
                <Input id="vehicleReg" placeholder="AB12 CDE" value={formData.vehicleReg} onChange={handleInputChange} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleNext} className="w-full" disabled={!formData.fullName || !formData.company || !formData.personVisiting}>Next</Button>
            </CardFooter>
          </>
        );
      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Camera />Photo Capture (Optional)</CardTitle>
              <CardDescription>Please take a photo for your visitor badge.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {visitorPhotoPlaceholder && (
                  <Image
                    src={formData.photo || visitorPhotoPlaceholder.imageUrl}
                    alt="Visitor Photo"
                    width={192}
                    height={192}
                    data-ai-hint={visitorPhotoPlaceholder.imageHint}
                    className="object-cover"
                  />
                )}
              </div>
              <Button variant="outline"><Camera className="mr-2 h-4 w-4" />Take Photo</Button>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={handleNext}>Next</Button>
            </CardFooter>
          </>
        );
      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield />Data Consent</CardTitle>
              <CardDescription>Please review and accept our data policy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg text-sm text-muted-foreground">
                <p>We need to store your personal information (name, company, photo) for health and safety reasons. Your data will be stored securely and will be automatically deleted after 365 days. We will not share your data with any third parties.</p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="consent" checked={formData.consent} onCheckedChange={(checked) => setFormData({ ...formData, consent: !!checked })} />
                <label htmlFor="consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I consent to my data being stored for 365 days.
                </label>
              </div>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={handleSubmit} disabled={!formData.consent}>Finish Check-In</Button>
            </CardFooter>
          </>
        );
      case 4:
        return (
          <>
            <CardHeader className="items-center text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <CardTitle className="text-2xl">Check-In Complete!</CardTitle>
              <CardDescription>Welcome, {formData.fullName}. Your badge is ready to be printed.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center gap-4 w-64">
                <h3 className="text-lg font-bold">VISITOR</h3>
                 <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {visitorPhotoPlaceholder && (
                      <Image
                        src={formData.photo || visitorPhotoPlaceholder.imageUrl}
                        alt="Visitor Photo"
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    )}
                 </div>
                 <div className="text-center">
                    <p className="font-bold text-xl">{formData.fullName}</p>
                    <p className="text-muted-foreground">{formData.company}</p>
                 </div>
                 <p className="text-sm">Valid for: {new Date().toLocaleDateString()}</p>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <Button className="w-full"><Printer className="mr-2 h-4 w-4" /> Print Badge</Button>
                <Button variant="outline" asChild className="w-full"><Link href="/">Finish</Link></Button>
            </CardFooter>
          </>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card className="w-full max-w-lg shadow-2xl">
      <Progress value={progress} className="h-1 rounded-none" />
      {renderStep()}
    </Card>
  );
}
