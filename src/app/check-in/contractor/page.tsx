"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Camera, HardHat, Building, CheckCircle, Shield, Printer, FileText, UserCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Progress } from "@/components/ui/progress";

type ContractorData = {
  fullName: string;
  company: string;
  purpose: string;
  personResponsible: string;
  photo: string | null;
  inductionComplete: boolean;
  rulesAgreed: boolean;
};

const initialData: ContractorData = {
  fullName: "",
  company: "",
  purpose: "",
  personResponsible: "",
  photo: null,
  inductionComplete: false,
  rulesAgreed: false,
};

export default function ContractorCheckInPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ContractorData>(initialData);
  const [progress, setProgress] = useState(20);

  const handleNext = () => {
    setStep(step + 1);
    setProgress(progress + 20);
  };
  
  const handleBack = () => {
    setStep(step - 1);
    setProgress(progress - 20);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  
  const handleSubmit = () => {
    console.log("Submitting Contractor Data:", formData);
    // Here you would typically save to Firestore
    handleNext();
  };
  
  const contractorPhotoPlaceholder = PlaceHolderImages.find(p => p.id === 'visitor-photo-placeholder');

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HardHat />Contractor Details</CardTitle>
              <CardDescription>Please enter your work details for today.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Your Company</Label>
                <Input id="company" placeholder="Acme Services Ltd" value={formData.company} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Visit</Label>
                <Input id="purpose" placeholder="Server maintenance" value={formData.purpose} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personResponsible">Spartan IT Contact</Label>
                <Input id="personResponsible" placeholder="Jane Smith" value={formData.personResponsible} onChange={handleInputChange} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleNext} className="w-full" disabled={!formData.fullName || !formData.company || !formData.purpose || !formData.personResponsible}>Next</Button>
            </CardFooter>
          </>
        );
      case 2:
        return (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText />Site Induction</CardTitle>
                <CardDescription>Please read the following safety information carefully.</CardDescription>
              </CardHeader>
              <CardContent>
                  <ScrollArea className="h-60 w-full rounded-md border p-4 text-sm">
                      <h4 className="font-bold mb-2">Health & Safety Rules</h4>
                      <p className="mb-2">All contractors must adhere to the site safety rules. This includes wearing appropriate PPE at all times.</p>
                      <h4 className="font-bold mb-2 mt-4">Emergency Procedures</h4>
                      <p className="mb-2">In case of a fire alarm, please evacuate via the nearest fire exit. Do not use the elevators. Assemble at the designated fire assembly point in the main car park.</p>
                      <h4 className="font-bold mb-2 mt-4">First Aid</h4>
                      <p>First aid kits are located in the kitchen and reception. All accidents must be reported to your Spartan IT contact immediately.</p>
                  </ScrollArea>
                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox id="inductionComplete" checked={formData.inductionComplete} onCheckedChange={(checked) => setFormData({ ...formData, inductionComplete: !!checked })} />
                    <label htmlFor="inductionComplete" className="text-sm font-medium">I confirm I have read and understood the site induction.</label>
                  </div>
              </CardContent>
              <CardFooter className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={handleBack}>Back</Button>
                <Button onClick={handleNext} disabled={!formData.inductionComplete}>Next</Button>
              </CardFooter>
            </>
        );
      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCheck />Site Rules Agreement</CardTitle>
              <CardDescription>Confirm your agreement to our site rules.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg text-sm text-muted-foreground">
                <p>By checking in, you agree to abide by all site health and safety regulations, follow instructions from Spartan IT staff, and maintain a professional and safe working environment. Failure to comply may result in being asked to leave the site.</p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="rulesAgreed" checked={formData.rulesAgreed} onCheckedChange={(checked) => setFormData({ ...formData, rulesAgreed: !!checked })} />
                <label htmlFor="rulesAgreed" className="text-sm font-medium">I agree to the site rules.</label>
              </div>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={handleNext} disabled={!formData.rulesAgreed}>Next</Button>
            </CardFooter>
          </>
        );
    case 4:
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Camera />Photo Capture (Optional)</CardTitle>
              <CardDescription>Please take a photo for your badge.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {contractorPhotoPlaceholder && (
                  <Image
                    src={formData.photo || contractorPhotoPlaceholder.imageUrl}
                    alt="Contractor Photo"
                    width={192}
                    height={192}
                    data-ai-hint={contractorPhotoPlaceholder.imageHint}
                    className="object-cover"
                  />
                )}
              </div>
              <Button variant="outline"><Camera className="mr-2 h-4 w-4" />Take Photo</Button>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={handleSubmit}>Finish Check-In</Button>
            </CardFooter>
          </>
        );
      case 5:
        return (
          <>
            <CardHeader className="items-center text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <CardTitle className="text-2xl">Check-In Complete!</CardTitle>
              <CardDescription>Welcome, {formData.fullName}. You are now checked in.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center gap-4 w-64">
                <h3 className="text-lg font-bold">CONTRACTOR</h3>
                 <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {contractorPhotoPlaceholder && (
                      <Image
                        src={formData.photo || contractorPhotoPlaceholder.imageUrl}
                        alt="Contractor Photo"
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
