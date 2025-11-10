
"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { HardHat, CheckCircle, Printer, FileText, UserCheck, UserCircle, Clock, Mail, Phone, Car, Shield, Building2, Construction, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { format, addDays, isBefore } from 'date-fns';
import { useCollection, useFirebase, addDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { Employee, Company, Visitor } from "@/lib/types";
import { collection, Timestamp, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const INDUCTION_VALIDITY_DAYS = 365;

type ContractorData = {
  firstName: string;
  surname: string;
  company: string;
  email: string;
  phone: string;
  vehicleReg?: string;
  personResponsible: string;
  inductionComplete: boolean;
  rulesAgreed: boolean;
  checkInTime: Date;
  existingInductionTimestamp?: Timestamp;
};

const initialData: ContractorData = {
  firstName: "",
  surname: "",
  company: "",
  email: "",
  phone: "",
  vehicleReg: "",
  personResponsible: "",
  inductionComplete: false,
  rulesAgreed: false,
  checkInTime: new Date(),
};


export default function ContractorCheckInPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ContractorData>(initialData);
  const [progress, setProgress] = useState(25);
  const [showAddCompanyDialog, setShowAddCompanyDialog] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [isCheckingInduction, setIsCheckingInduction] = useState(false);
  const [hasValidInduction, setHasValidInduction] = useState(false);

  const { firestore } = useFirebase();
  const { toast } = useToast();

  const employeesCol = useMemoFirebase(
    () => (firestore ? collection(firestore, "employees") : null),
    [firestore]
  );
  const { data: employees, isLoading: isLoadingEmployees } = useCollection<Employee>(employeesCol);

  const companiesCol = useMemoFirebase(
    () => (firestore ? collection(firestore, "companies") : null),
    [firestore]
  );
  const { data: companies, isLoading: isLoadingCompanies } = useCollection<Company>(companiesCol);

  const companyOptions = useMemo(() =>
    companies?.map(c => ({ value: c.name, label: c.name })) || [],
    [companies]
  );
  
  const calculateProgress = (currentStep: number, skipsInduction: boolean) => {
    const totalSteps = skipsInduction ? 3 : 5;
    if (currentStep > totalSteps) return 100;
    return ((currentStep-1) / (totalSteps-1)) * 100;
  }
  
  const advanceStep = (increment = 1) => {
    setStep(current => {
      const newStep = current + increment;
      setProgress(calculateProgress(newStep, hasValidInduction));
      return newStep;
    });
  }

  const handleBack = () => {
    setStep(current => {
      const newStep = current - 1;
      setProgress(calculateProgress(newStep, hasValidInduction));
      return newStep;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  
  const checkForExistingInduction = async () => {
    if (!firestore || !formData.firstName || !formData.surname || !formData.company) {
        return;
    }
    setIsCheckingInduction(true);
    setHasValidInduction(false);

    const q = query(
        collection(firestore, "visitors"),
        where("name", "==", `${formData.firstName} ${formData.surname}`),
        where("company", "==", formData.company),
        where("inductionComplete", "==", true),
        orderBy("inductionTimestamp", "desc"),
        limit(1)
    );

    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const latestRecord = querySnapshot.docs[0].data() as Visitor;
            if (latestRecord.inductionTimestamp) {
                const expiryDate = addDays(latestRecord.inductionTimestamp.toDate(), INDUCTION_VALIDITY_DAYS);
                if (isBefore(new Date(), expiryDate)) {
                    setHasValidInduction(true);
                    setFormData(fd => ({
                        ...fd,
                        inductionComplete: true,
                        rulesAgreed: true,
                        existingInductionTimestamp: latestRecord.inductionTimestamp,
                    }));
                    toast({
                        variant: "success",
                        title: "Valid Induction Found",
                        description: "Your site induction is up to date. You can proceed to check in.",
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error checking for existing induction:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not check your induction status. Please proceed with the manual induction.",
        });
    } finally {
        setIsCheckingInduction(false);
        // Regardless of outcome, move to the next step
        setProgress(calculateProgress(3, hasValidInduction));
        setStep(3);
    }
  };

  const handleDetailsContinue = () => {
    checkForExistingInduction();
  };
  
  const handleSubmit = () => {
    if (!firestore) return;
  
    const checkInTime = new Date();
    setFormData({ ...formData, checkInTime });
  
    // Determine the timestamp to use. Use existing if valid, otherwise create new.
    const inductionTimestamp = hasValidInduction 
      ? formData.existingInductionTimestamp 
      : (formData.inductionComplete ? Timestamp.fromDate(new Date()) : undefined);

    const contractorRecord: Partial<Visitor> = {
      type: 'contractor',
      firstName: formData.firstName,
      surname: formData.surname,
      name: `${formData.firstName} ${formData.surname}`,
      company: formData.company,
      email: formData.email,
      phone: formData.phone,
      vehicleReg: formData.vehicleReg || "",
      personResponsible: formData.personResponsible,
      inductionComplete: formData.inductionComplete,
      rulesAgreed: formData.rulesAgreed,
      checkInTime: Timestamp.fromDate(checkInTime),
      checkedOut: false,
      checkOutTime: null,
      photoURL: null,
      inductionTimestamp: inductionTimestamp,
    };
  
    const visitorsCol = collection(firestore, "visitors");
    addDocumentNonBlocking(visitorsCol, contractorRecord);
  
    const finalStep = hasValidInduction ? 4 : 6;
    setStep(finalStep);
    setProgress(100);
  };

  const handleCompanySelect = (value: string) => {
    setFormData({ ...formData, company: value });
  };

  const handleCompanyCreate = (value: string) => {
    setNewCompanyName(value);
    setShowAddCompanyDialog(true);
  };

  const confirmAddCompany = () => {
    if (!firestore || !newCompanyName) return;

    const companiesColRef = collection(firestore, "companies");
    addDocumentNonBlocking(companiesColRef, { name: newCompanyName });
    
    toast({
      variant: "success",
      title: "Company Added",
      description: `${newCompanyName} has been added to the system.`,
    });
    setFormData({ ...formData, company: newCompanyName });
    setShowAddCompanyDialog(false);
    setNewCompanyName("");
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield />Data Consent</CardTitle>
              <CardDescription>Please review our data policy before proceeding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>For health, safety, and security purposes, we need to collect and store your personal information during your visit. By proceeding, you agree to this.</p>
                  <p className="mt-2">For more details, please read our full <Link href="/privacy-policy" target="_blank" className="text-primary underline">Privacy Policy</Link>.</p>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={() => advanceStep()} className="w-full">Agree and Continue</Button>
            </CardFooter>
          </>
        );
      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HardHat />Contractor Details</CardTitle>
              <CardDescription>Please enter your work details for today.</CardDescription>
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
                <Label htmlFor="company">Your Company</Label>
                <Combobox
                  options={companyOptions || []}
                  value={formData.company}
                  onChange={handleCompanySelect}
                  onCreate={handleCompanyCreate}
                  placeholder="Select or type a company..."
                  searchPlaceholder="Search companies..."
                  noResultsText="No company found."
                  allowCreation
                  isLoading={isLoadingCompanies}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john.doe@example.com" value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" placeholder="07123456789" value={formData.phone} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleReg">Vehicle Registration (Optional)</Label>
                <Input id="vehicleReg" placeholder="AB12 CDE" value={formData.vehicleReg} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personResponsible">Spartan IT Contact</Label>
                 <Select
                  onValueChange={(value) => setFormData({ ...formData, personResponsible: value })}
                  value={formData.personResponsible}
                  disabled={isLoadingEmployees}
                >
                  <SelectTrigger id="personResponsible">
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
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={handleBack}>Back</Button>
                <Button onClick={handleDetailsContinue} disabled={!formData.firstName || !formData.surname || !formData.company || !formData.personResponsible || !formData.email || !formData.phone || isCheckingInduction}>
                    {isCheckingInduction ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Checking...</> : "Next"}
                </Button>
            </CardFooter>
          </>
        );
        case 3: // Logic bifurcation happens here
            if (isCheckingInduction) {
                return (
                    <CardContent className="flex flex-col items-center justify-center h-60">
                        <RefreshCw className="h-10 w-10 animate-spin text-primary mb-4" />
                        <p className="text-lg font-medium">Checking for existing induction...</p>
                    </CardContent>
                )
            }
            if (hasValidInduction) {
                // If valid, immediately call handleSubmit which will advance to the final badge step.
                handleSubmit();
                return ( // Show a brief loading state while it processes
                     <CardContent className="flex flex-col items-center justify-center h-60">
                        <CheckCircle className="h-10 w-10 text-green-500 mb-4" />
                        <p className="text-lg font-medium">Valid induction found. Proceeding to check-in...</p>
                    </CardContent>
                );
            }
            // If no valid induction, show the video step.
            return (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText />Site Induction Video</CardTitle>
                    <CardDescription>Please now watch the site induction video on the device provided.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center h-60">
                     <div className="text-center p-4 border-2 border-dashed rounded-lg">
                        <p className="text-lg font-medium">Please watch the induction video.</p>
                        <p className="text-sm text-muted-foreground">Once complete, tick the box below to continue.</p>
                     </div>
                      <div className="flex items-center space-x-2 mt-6">
                        <Checkbox id="inductionComplete" checked={formData.inductionComplete} onCheckedChange={(checked) => setFormData({ ...formData, inductionComplete: !!checked })} />
                        <label htmlFor="inductionComplete" className="text-sm font-medium">I confirm I have watched and understood the site induction video.</label>
                      </div>
                  </CardContent>
                  <CardFooter className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={handleBack}>Back</Button>
                    <Button onClick={() => advanceStep()} disabled={!formData.inductionComplete}>Next</Button>
                  </CardFooter>
                </>
            );
      case 4: // Site Rules (only shown if induction is required) or Final Badge (if induction was skipped)
         if (hasValidInduction) { // Final Badge step for skipped induction
            return (
                <>
                <CardHeader className="items-center text-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                    <CardTitle className="text-2xl">Check-In Complete!</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <div className="w-96 rounded-lg overflow-hidden border-2 border-dashed flex flex-col">
                        <div className="bg-red-600 text-white text-center py-2">
                            <h2 className="font-bold text-xl">SPARTAN UK</h2>
                        </div>
                        <div className="bg-white flex-grow p-4 flex items-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-red-600">
                                <UserCircle className="w-20 h-20" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-2xl text-black">{formData.firstName} {formData.surname}</h3>
                                <p className="text-gray-600 text-lg">{formData.company}</p>
                                <Badge className="gap-1.5 pl-1.5 pr-2.5 mt-2 bg-yellow-500 hover:bg-yellow-600">
                                    <HardHat className="h-3.5 w-3.5" />
                                    Contractor
                                </Badge>
                            </div>
                        </div>
                        <div className="bg-white px-4 pb-4 text-center">
                            <p className="text-gray-500 text-sm mt-1">Valid for: {format(new Date(), 'PPP')}</p>
                        </div>
                        <div className="bg-gray-200 p-2 text-xs text-gray-700 font-medium">
                            <div className="flex justify-center">
                            <div className="inline-grid grid-cols-2 gap-x-4 gap-y-1">
                                <div className="flex items-center gap-1.5">
                                    <UserCheck className="w-3 h-3" />
                                    <span>Contact: {formData.personResponsible}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    <span>Time In: {format(formData.checkInTime, 'HH:mm')}</span>
                                </div>
                                {formData.vehicleReg && (
                                <div className="flex items-center gap-1.5">
                                <Car className="w-3 h-3" />
                                <span>Reg: {formData.vehicleReg}</span>
                                </div>
                            )}
                            {formData.phone && (
                                <div className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3" />
                                <span>{formData.phone}</span>
                                </div>
                            )}
                            {formData.email && (
                                <div className="flex items-center gap-1.5 col-span-2">
                                <Mail className="w-3 h-3" />
                                <span>{formData.email}</span>
                                </div>
                            )}
                            </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <Button className="w-full"><Printer className="mr-2 h-4 w-4" /> Print Badge</Button>
                    <Button variant="outline" asChild className="w-full"><Link href="/">Finish</Link></Button>
                </CardFooter>
                </>
            );
         }
        return ( // Site Rules
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl"><UserCheck />Site Rules Agreement</CardTitle>
              <CardDescription>Please review and confirm your agreement to our site rules.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-bold text-base mb-2 text-primary">MANDATORY PPE RULES</h3>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Hard hat</li>
                        <li>Safety shoes/boots</li>
                        <li>Safety glasses</li>
                        <li>High visibility clothing</li>
                        <li>Hearing protection (inside ALL process buildings)</li>
                        <li>Long sleeve shirt and trousers (appropriate work wear for contractors)</li>
                        </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-bold text-base mb-2 text-primary">GENERAL RULES</h3>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>All persons must report to security upon entering and exiting site</li>
                        <li>No littering - Use bins provided</li>
                        <li>No smoking on Site</li>
                        <li>Max is 10 mph</li>
                        <li>Note: These premises are under 24hour CCTV surveillance</li>
                        <li>Follow all site rules and safety instructions</li>
                        <li>Use pedestrian walkways</li>
                        </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-bold text-base mb-2 text-primary">MAIN HAZARDS</h3>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                            <li>FLT and heavy plant movement</li>
                            <li>Overhead crane movement</li>
                            <li>Hot surfaces</li>
                            <li>Falls from height: NO access to height unless fall protection measures in place</li>
                            <li>Beware of uneven surfaces</li>
                            <li>Electromagnets in use across site. No permitted access to persons who have electronic implants or are pregnant. (excludes entry into office block)</li>
                        </ul>
                    </div>
                </div>

              <div className="flex items-center space-x-2 pt-4 justify-center">
                <Checkbox id="rulesAgreed" checked={formData.rulesAgreed} onCheckedChange={(checked) => setFormData({ ...formData, rulesAgreed: !!checked })} />
                <label htmlFor="rulesAgreed" className="text-sm font-medium">I have read, understood, and agree to abide by all site rules.</label>
              </div>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-4 pt-6">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={() => advanceStep()} disabled={!formData.rulesAgreed}>Finish Check-In</Button>
            </CardFooter>
          </>
        );
      case 5: // Badge for users who did induction this time
        return (
          <>
            <CardHeader className="items-center text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <CardTitle className="text-2xl">Check-In Complete!</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-96 rounded-lg overflow-hidden border-2 border-dashed flex flex-col">
                  <div className="bg-red-600 text-white text-center py-2">
                      <h2 className="font-bold text-xl">SPARTAN UK</h2>
                  </div>
                  <div className="bg-white flex-grow p-4 flex items-center gap-4">
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-red-600">
                          <UserCircle className="w-20 h-20" />
                      </div>
                      <div className="text-left">
                          <h3 className="font-bold text-2xl text-black">{formData.firstName} {formData.surname}</h3>
                          <p className="text-gray-600 text-lg">{formData.company}</p>
                           <Badge className="gap-1.5 pl-1.5 pr-2.5 mt-2 bg-yellow-500 hover:bg-yellow-600">
                              <HardHat className="h-3.5 w-3.5" />
                              Contractor
                          </Badge>
                      </div>
                  </div>
                  <div className="bg-white px-4 pb-4 text-center">
                     <p className="text-gray-500 text-sm mt-1">Valid for: {format(new Date(), 'PPP')}</p>
                  </div>
                  <div className="bg-gray-200 p-2 text-xs text-gray-700 font-medium">
                    <div className="flex justify-center">
                      <div className="inline-grid grid-cols-2 gap-x-4 gap-y-1">
                        <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3 h-3" />
                            <span>Contact: {formData.personResponsible}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            <span>Time In: {format(formData.checkInTime, 'HH:mm')}</span>
                        </div>
                        {formData.vehicleReg && (
                        <div className="flex items-center gap-1.5">
                          <Car className="w-3 h-3" />
                          <span>Reg: {formData.vehicleReg}</span>
                        </div>
                      )}
                      {formData.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3" />
                          <span>{formData.phone}</span>
                        </div>
                      )}
                      {formData.email && (
                        <div className="flex items-center gap-1.5 col-span-2">
                          <Mail className="w-3 h-3" />
                          <span>{formData.email}</span>
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <Button onClick={handleSubmit} className="w-full"><Printer className="mr-2 h-4 w-4" /> Print Badge</Button>
                <Button variant="outline" asChild className="w-full"><Link href="/">Finish</Link></Button>
            </CardFooter>
          </>
        );
      case 6: // final badge if they did it manually
        return (
             <>
                <CardHeader className="items-center text-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                    <CardTitle className="text-2xl">Check-In Complete!</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <div className="w-96 rounded-lg overflow-hidden border-2 border-dashed flex flex-col">
                        <div className="bg-red-600 text-white text-center py-2">
                            <h2 className="font-bold text-xl">SPARTAN UK</h2>
                        </div>
                        <div className="bg-white flex-grow p-4 flex items-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-red-600">
                                <UserCircle className="w-20 h-20" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-2xl text-black">{formData.firstName} {formData.surname}</h3>
                                <p className="text-gray-600 text-lg">{formData.company}</p>
                                <Badge className="gap-1.5 pl-1.5 pr-2.5 mt-2 bg-yellow-500 hover:bg-yellow-600">
                                    <HardHat className="h-3.5 w-3.5" />
                                    Contractor
                                </Badge>
                            </div>
                        </div>
                        <div className="bg-white px-4 pb-4 text-center">
                            <p className="text-gray-500 text-sm mt-1">Valid for: {format(new Date(), 'PPP')}</p>
                        </div>
                        <div className="bg-gray-200 p-2 text-xs text-gray-700 font-medium">
                            <div className="flex justify-center">
                            <div className="inline-grid grid-cols-2 gap-x-4 gap-y-1">
                                <div className="flex items-center gap-1.5">
                                    <UserCheck className="w-3 h-3" />
                                    <span>Contact: {formData.personResponsible}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    <span>Time In: {format(formData.checkInTime, 'HH:mm')}</span>
                                </div>
                                {formData.vehicleReg && (
                                <div className="flex items-center gap-1.5">
                                <Car className="w-3 h-3" />
                                <span>Reg: {formData.vehicleReg}</span>
                                </div>
                            )}
                            {formData.phone && (
                                <div className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3" />
                                <span>{formData.phone}</span>
                                </div>
                            )}
                            {formData.email && (
                                <div className="flex items-center gap-1.5 col-span-2">
                                <Mail className="w-3 h-3" />
                                <span>{formData.email}</span>
                                </div>
                            )}
                            </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <Button className="w-full"><Printer className="mr-2 h-4 w-4" /> Print Badge</Button>
                    <Button variant="outline" asChild className="w-full"><Link href="/">Finish</Link></Button>
                </CardFooter>
                </>
        )
      default:
        return null;
    }
  };

   useEffect(() => {
    setProgress(calculateProgress(step, hasValidInduction));
  }, [step, hasValidInduction]);
  
  return (
    <>
    <Card className={`w-full shadow-2xl ${step === 4 && !hasValidInduction ? 'max-w-4xl' : 'max-w-lg'}`}>
      <Progress value={progress} className="h-1 rounded-none" />
      {renderStep()}
    </Card>
     <AlertDialog open={showAddCompanyDialog} onOpenChange={setShowAddCompanyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Company?</AlertDialogTitle>
            <AlertDialogDescription>
              The company "<span className="font-semibold">{newCompanyName}</span>" is not in our system.
              Please confirm the spelling is correct before adding it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewCompanyName("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAddCompany}>
              Confirm and Add
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    