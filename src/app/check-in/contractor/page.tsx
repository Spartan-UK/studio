
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HardHat, CheckCircle, Printer, FileText, UserCheck, UserCircle, Clock, Mail, Phone, Car } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { format } from 'date-fns';
import { useCollection, useFirebase, addDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { Employee, Company } from "@/lib/types";
import { collection, Timestamp } from "firebase/firestore";
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
  email?: string;
  phone?: string;
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

export default function ContractorCheckInPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ContractorData>(initialData);
  const [progress, setProgress] = useState(25);
  const [showAddCompanyDialog, setShowAddCompanyDialog] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");

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
    if (!firestore) return;
  
    const checkInTime = new Date();
    setFormData({ ...formData, checkInTime });
  
    const contractorRecord = {
      firstName: formData.firstName,
      surname: formData.surname,
      name: `${formData.firstName} ${formData.surname}`,
      company: formData.company,
      email: formData.email || "",
      phone: formData.phone || "",
      vehicleReg: formData.vehicleReg || "",
      personResponsible: formData.personResponsible,
      inductionComplete: formData.inductionComplete,
      rulesAgreed: formData.rulesAgreed,
      checkInTime: Timestamp.fromDate(checkInTime),
      checkedOut: false,
      checkOutTime: null,
      photoURL: null,
    };
  
    const contractorsCol = collection(firestore, "contractors");
    addDocumentNonBlocking(contractorsCol, contractorRecord);
  
    handleNext();
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
                <Label htmlFor="email">Email (Optional)</Label>
                <Input id="email" type="email" placeholder="john.doe@example.com" value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
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
            <CardFooter>
              <Button onClick={handleNext} className="w-full" disabled={!formData.firstName || !formData.surname || !formData.company || !formData.personResponsible}>Next</Button>
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
              <Button onClick={handleSubmit} disabled={!formData.rulesAgreed}>Finish Check-In</Button>
            </CardFooter>
          </>
        );
      case 4:
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
    <Card className="w-full max-w-lg shadow-2xl">
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
