"use client";

import { useState } from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SpartanIcon } from "@/components/icons";
import { ArrowLeft, LogOut, Search, User, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Visitor } from "@/lib/types";

const mockCheckedInUsers: (Visitor & {type: 'visitor' | 'contractor'})[] = [
    { id: '1', name: 'Alice Johnson', company: 'Innovate Inc.', visiting: 'Bob Vance', checkInTime: Date.now() - 3600000, consentGiven: true, type: 'visitor' },
    { id: '2', name: 'Charlie Davis', company: 'Solutions Co.', visiting: 'Phyllis Lapin', checkInTime: Date.now() - 7200000, consentGiven: true, type: 'visitor' },
    { id: '3', name: 'Eleanor Rigby', company: 'Plumb Co.', purpose: 'Fixing pipes', personResponsible: 'Stanley Hudson', checkInTime: Date.now() - 1800000, type: 'contractor' },
];

export default function CheckOutPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<(typeof mockCheckedInUsers[0]) | null>(null);
    const [isCheckedOut, setIsCheckedOut] = useState(false);
    const { toast } = useToast();

    const filteredUsers = mockCheckedInUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCheckOut = () => {
        if (selectedUser) {
            console.log(`Checking out ${selectedUser.name}`);
            // Here, you would update the user's record in Firestore with a checkout time.
            setIsCheckedOut(true);
            toast({
                title: "Check-Out Successful",
                description: `Goodbye, ${selectedUser.name}!`,
            });
        }
    };

    if (isCheckedOut && selectedUser) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
                <Card className="w-full max-w-md text-center shadow-xl">
                    <CardHeader>
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                        <CardTitle className="text-3xl">Checked Out!</CardTitle>
                        <CardDescription>Thank you for visiting, {selectedUser.name}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Have a great day!</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href="/">Return to Home</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (selectedUser) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
                 <Card className="w-full max-w-md text-center shadow-xl">
                    <CardHeader>
                        <Avatar className="mx-auto h-24 w-24 mb-4">
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${selectedUser.id}`} alt={selectedUser.name} />
                            <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-3xl">Hi, {selectedUser.name.split(' ')[0]}!</CardTitle>
                        <CardDescription>Please confirm you want to check out.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">{selectedUser.name}</p>
                        <p className="text-muted-foreground">{selectedUser.company}</p>
                        <p className="text-sm text-muted-foreground mt-2">Checked in at: {new Date(selectedUser.checkInTime).toLocaleTimeString()}</p>
                    </CardContent>
                    <CardFooter className="grid grid-cols-2 gap-4">
                        <Button variant="outline" onClick={() => setSelectedUser(null)}>Not me</Button>
                        <Button onClick={handleCheckOut}><LogOut className="mr-2 h-4 w-4"/>Check Out</Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-background w-full p-4">
            <header className="w-full max-w-4xl mx-auto py-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <SpartanIcon className="h-8 w-8 text-primary" />
                    <h1 className="text-xl font-bold text-foreground">Spartan Check-In</h1>
                </Link>
                <Button asChild variant="ghost">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </header>
            <main className="flex-1 flex flex-col items-center w-full max-w-4xl pt-10">
                <Card className="w-full shadow-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">Check Out</CardTitle>
                        <CardDescription>Search for your name to sign out.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name..."
                                className="pl-10 text-lg h-12"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="mt-6 space-y-2 max-h-80 overflow-y-auto">
                            {searchTerm && filteredUsers.map(user => (
                                <button key={user.id} onClick={() => setSelectedUser(user)} className="w-full text-left p-4 rounded-lg hover:bg-muted transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} />
                                            <AvatarFallback><User /></AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{user.name}</p>
                                            <p className="text-sm text-muted-foreground">{user.company}</p>
                                        </div>
                                    </div>
                                    <LogOut className="h-5 w-5 text-primary" />
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
