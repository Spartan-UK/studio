
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { HardHat, CheckCircle, Printer, FileText, UserCheck, UserCircle, Clock, Mail, Phone, Car, Shield } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { format, differenceInDays } from 'date-fns';
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

const INDUCTION_VALIDITY_DAYS = 365;

export default function ContractorCheckInPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ContractorData>(initialData);
  const [progress, setProgress] = useState(20);
  const [showAddCompanyDialog, setShowAddCompanyDialog] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  
  const [foundVisitor, setFoundVisitor] = useState<Visitor | null>(null);
  const [showConfirmVisitorDialog, setShowConfirmVisitorDialog] = useState(false);
  const [showInductionStatusDialog, setShowInductionStatusDialog] = useState(false);
  const [isInductionValid, setIsInductionValid] = useState(false);
  const [isSearching, setIsSearching] = useState(false);


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
  
  const advanceStep = (increment = 1) => {
    setStep(current => current + increment);
    setProgress(current => current + (20 * increment));
  }

  const handleNext = () => {
    if (step === 2) {
      findPreviousVisit();
    } else {
      advanceStep();
    }
  };
  
  const handleBack = () => {
    setStep(step - 1);
    setProgress(progress - 20);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  
  const findPreviousVisit = async () => {
    if (!firestore) return;
    setIsSearching(true);

    const { firstName, surname, email, phone } = formData;
    const fullName = `${firstName} ${surname}`.trim();

    const nameQuery = query(collection(firestore, "visitors"), where("name", "==", fullName), where("type", "==", "contractor"), orderBy("checkInTime", "desc"), limit(1));
    const emailQuery = query(collection(firestore, "visitors"), where("email", "==", email), where("type", "==", "contractor"), orderBy("checkInTime", "desc"), limit(1));
    const phoneQuery = query(collection(firestore, "visitors"), where("phone", "==", phone), where("type", "==", "contractor"), orderBy("checkInTime", "desc"), limit(1));

    try {
        const [nameSnapshot, emailSnapshot, phoneSnapshot] = await Promise.all([
            getDocs(nameQuery),
            getDocs(emailQuery),
            getDocs(phoneQuery),
        ]);

        const results: Record<string, Visitor> = {};
        const addToResults = (doc: any) => {
            if (doc.exists() && !results[doc.id]) {
                results[doc.id] = { id: doc.id, ...doc.data() } as Visitor;
            }
        };

        nameSnapshot.docs.forEach(addToResults);
        emailSnapshot.docs.forEach(addToResults);
        phoneSnapshot.docs.forEach(addToResults);
        
        const matchingVisitors = Object.values(results);
        
        if (matchingVisitors.length > 0) {
            const mostRecentVisit = matchingVisitors[0]; // Already ordered by time
            setFoundVisitor(mostRecentVisit);
            setShowConfirmVisitorDialog(true);
        } else {
            advanceStep();
        }
    } catch (e) {
        console.error("Error searching for previous visits:", e);
        toast({
            variant: "destructive",
            title: "Search Error",
            description: "Could not check for previous visits. Please proceed with check-in."
        });
        advanceStep();
    } finally {
        setIsSearching(false);
    }
  };
  
  const handleConfirmVisitor = (isConfirmed: boolean) => {
    setShowConfirmVisitorDialog(false);

    if (isConfirmed && foundVisitor) {
        const inductionDate = foundVisitor.inductionTimestamp?.toDate();
        if (inductionDate && differenceInDays(new Date(), inductionDate) < INDUCTION_VALIDITY_DAYS) {
            setIsInductionValid(true);
            setFormData(prev => ({
                ...prev,
                inductionComplete: true,
                firstName: foundVisitor.firstName,
                surname: foundVisitor.surname,
                company: foundVisitor.company,
                email: foundVisitor.email!,
                phone: foundVisitor.phone!,
                vehicleReg: foundVisitor.vehicleReg || '',
            }));
        } else {
            setIsInductionValid(false);
        }
        setShowInductionStatusDialog(true);
    } else {
        // Not the same person, or no visitor found, proceed normally
        advanceStep();
    }
  };

  const handleInductionStatusDialogClose = () => {
    setShowInductionStatusDialog(false);
    if (isInductionValid) {
        advanceStep(2); // Skip induction video, go to rules
    } else {
        advanceStep(); // Go to induction video
    }
  };

  const handleSubmit = () => {
    if (!firestore) return;
  
    const checkInTime = new Date();
    setFormData({ ...formData, checkInTime });
  
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
    };

    if (formData.inductionComplete) {
        if (!isInductionValid) { // Only set new timestamp if they just did the induction
            contractorRecord.inductionTimestamp = Timestamp.fromDate(new Date());
        } else if (foundVisitor?.inductionTimestamp) { // Carry over old timestamp if still valid
            contractorRecord.inductionTimestamp = foundVisitor.inductionTimestamp;
        }
    }
  
    const visitorsCol = collection(firestore, "visitors");
    addDocumentNonBlocking(visitorsCol, contractorRecord);
  
    advanceStep();
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
                <Button onClick={handleNext} className="w-full">Agree and Continue</Button>
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
                <Button onClick={handleNext} disabled={isSearching || !formData.firstName || !formData.surname || !formData.company || !formData.personResponsible || !formData.email || !formData.phone}>
                    {isSearching ? "Searching..." : "Next"}
                </Button>
            </CardFooter>
          </>
        );
      case 3:
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
                <Button onClick={handleNext} disabled={!formData.inductionComplete}>Next</Button>
              </CardFooter>
            </>
        );
      case 4:
        return (
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
              <Button onClick={handleSubmit} disabled={!formData.rulesAgreed}>Finish Check-In</Button>
            </CardFooter>
          </>
        );
      case 5:
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
                          <p className="text-gray-500 text-sm mt-1">Valid for: {format(new Date(), 'PPP')}</p>
                      </div>
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
      default:
        return null;
    }
  };
  
  return (
    <>
    <Card className={`w-full shadow-2xl ${step === 4 ? 'max-w-4xl' : 'max-w-lg'}`}>
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
      <AlertDialog open={showConfirmVisitorDialog} onOpenChange={setShowConfirmVisitorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Welcome Back!</AlertDialogTitle>
            <AlertDialogDescription>
                It looks like you last visited us on{' '}
                {foundVisitor?.checkInTime ? format(foundVisitor.checkInTime.toDate(), 'PPP') : 'a previous date'}.
                <br />
                Is this you, <span className="font-semibold">{foundVisitor?.name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleConfirmVisitor(false)}>No, that's not me</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleConfirmVisitor(true)}>Yes, this is me</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showInductionStatusDialog} onOpenChange={setShowInductionStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Induction Status</AlertDialogTitle>
            <AlertDialogDescription>
                {isInductionValid
                    ? "Your site induction is still valid."
                    : "Your site induction has expired and needs to be renewed."
                }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
             <AlertDialogAction onClick={handleInductionStatusDialogClose}>
                {isInductionValid ? "Next" : "Continue"}
             </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    
    