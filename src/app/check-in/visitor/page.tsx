
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, CheckCircle, Shield, Printer, UserCircle } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useFirebase, addDocumentNonBlocking, useCollection, useMemoFirebase } from "@/firebase";
import { collection, Timestamp } from "firebase/firestore";
import { Employee } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type VisitorData = {
  firstName: string;
  surname: string;
  email?: string;
  phone?: string;
  company: string;
  personVisiting: string;
  visitType: "office" | "site";
  vehicleReg: string;
  consent: boolean;
};

const initialData: VisitorData = {
  firstName: "",
  surname: "",
  email: "",
  phone: "",
  company: "",
  personVisiting: "",
  visitType: "office",
  vehicleReg: "",
  consent: false,
};

export default function VisitorCheckInPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<VisitorData>(initialData);
  const [progress, setProgress] = useState(33);
  const { firestore } = useFirebase();

  const employeesCol = useMemoFirebase(
    () => (firestore ? collection(firestore, "employees") : null),
    [firestore]
  );
  const { data: employees, isLoading: isLoadingEmployees } = useCollection<Employee>(employeesCol);

  const handleNext = () => {
    setStep(step + 1);
    setProgress(progress + 33);
  };
  
  const handleBack = () => {
    setStep(step - 1);
    setProgress(progress - 33);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  
  const handleSubmit = () => {
    if (!firestore) return;
    
    const visitorsCol = collection(firestore, "visitors");
    const visitorRecord = {
      firstName: formData.firstName,
      surname: formData.surname,
      name: `${formData.firstName} ${formData.surname}`,
      email: formData.email || "",
      phone: formData.phone || "",
      company: formData.company,
      visiting: formData.personVisiting,
      visitType: formData.visitType,
      vehicleReg: formData.vehicleReg,
      photoURL: null, // No photo URL
      consentGiven: formData.consent,
      checkInTime: Timestamp.now(),
      checkOutTime: null,
      checkedOut: false,
    };
    
    addDocumentNonBlocking(visitorsCol, visitorRecord);
    
    handleNext();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield />Data Consent</CardTitle>
              <CardDescription>Please review and accept our data policy before proceeding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg text-sm text-muted-foreground h-60 overflow-y-auto">
                <h4 className="font-bold mb-2">Data Protection and Privacy</h4>
                <p>Spartan IT is committed to protecting your privacy. This notice explains how we collect, use, and protect your personal information during your visit.</p>
                <h4 className="font-bold mt-4 mb-2">What Information We Collect</h4>
                <p>For health, safety, and security purposes, we collect the following information upon check-in: your full name, company, the person you are visiting, and a photograph for your visitor badge. Your vehicle registration may also be collected for parking management.</p>
                <h4 className="font-bold mt-4 mb-2">How We Use Your Information</h4>
                <p>Your information is used solely for managing your visit, ensuring site security, and for emergency contact purposes. It allows us to know who is on-site at any given time, which is critical in case of an evacuation or other emergency.</p>
                <h4 className="font-bold mt-4 mb-2">Data Storage and Retention</h4>
                <p>Your personal data is stored securely within our visitor management system. In compliance with GDPR, your information will be automatically and permanently deleted from our records after 365 days. We do not share your data with any third parties unless required by law.</p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="consent" checked={formData.consent} onCheckedChange={(checked) => setFormData({ ...formData, consent: !!checked })} />
                <label htmlFor="consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I consent to my data being stored for 365 days as described above.
                </label>
              </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleNext} className="w-full" disabled={!formData.consent}>Accept and Continue</Button>
            </CardFooter>
          </>
        );
      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User/>Visitor Details</CardTitle>
              <CardDescription>Please enter your information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" value={formData.firstName} onChange={handleInputChange} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="surname">Surname</Label>
                  <Input id="surname" placeholder="Doe" value={formData.surname} onChange={handleInputChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address (Optional)</Label>
                <Input id="email" type="email" placeholder="john.doe@example.com" value={formData.email} onChange={handleInputChange} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input id="phone" type="tel" placeholder="07123456789" value={formData.phone} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Your Company</Label>
                <Input id="company" placeholder="Acme Corporation" value={formData.company} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personVisiting">Person Visiting</Label>
                <Select
                  onValueChange={(value) => setFormData({ ...formData, personVisiting: value })}
                  value={formData.personVisiting}
                  disabled={isLoadingEmployees}
                >
                  <SelectTrigger id="personVisiting">
                    <SelectValue placeholder="Select an employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {!isLoadingEmployees && employees?.map((employee) => (
                      <SelectItem key={employee.id} value={employee.displayName}>
                        {employee.displayName}
                      </SelectItem>
                    ))}
                    {isLoadingEmployees && <SelectItem value="loading" disabled>Loading employees...</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                  <Label>Visit Type</Label>
                  <RadioGroup
                    defaultValue="office"
                    className="flex gap-4"
                    onValueChange={(value: "office" | "site") => setFormData({ ...formData, visitType: value})}
                    value={formData.visitType}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="office" id="r-office" />
                      <Label htmlFor="r-office">Office Visit</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="site" id="r-site" />
                      <Label htmlFor="r-site">Site Visit</Label>
                    </div>
                  </RadioGroup>
                </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleReg">Vehicle Registration (Optional)</Label>
                <Input id="vehicleReg" placeholder="AB12 CDE" value={formData.vehicleReg} onChange={handleInputChange} />
              </div>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={handleSubmit} disabled={!formData.firstName || !formData.surname || !formData.company || !formData.personVisiting}>Finish Check-In</Button>
            </CardFooter>
          </>
        );
      case 3:
        return (
          <>
            <CardHeader className="items-center text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <CardTitle className="text-2xl">Check-In Complete!</CardTitle>
              <CardDescription>Welcome, {formData.firstName}. Your badge is ready to be printed.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center gap-4 w-64">
                <h3 className="text-lg font-bold">VISITOR</h3>
                 <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center text-muted-foreground">
                    <UserCircle className="w-20 h-20" />
                 </div>
                 <div className="text-center">
                    <p className="font-bold text-xl">{formData.firstName} {formData.surname}</p>
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
