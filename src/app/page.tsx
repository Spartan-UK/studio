import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogIn, UserPlus, HardHat, LogOut } from 'lucide-react';
import { SpartanIcon } from '@/components/icons';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <header className="absolute top-0 left-0 w-full p-6 flex justify-end items-center">
        <Button asChild variant="ghost">
          <Link href="/admin/dashboard">
            Admin Login
            <LogIn className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <Card className="w-full max-w-2xl shadow-2xl bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <div className="mx-auto mb-2">
                <SpartanIcon className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-4xl font-bold">Welcome to Spartan Check-In</CardTitle>
            <CardDescription className="text-lg text-foreground/80">Please select your check-in type or check out.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button asChild className="h-24 text-xl glass-button">
                <Link href="/check-in/visitor">
                  <UserPlus className="mr-4 h-8 w-8" />
                  Visitor
                </Link>
              </Button>
              <Button asChild className="h-24 text-xl glass-button">
                <Link href="/check-in/contractor">
                  <HardHat className="mr-4 h-8 w-8" />
                  Contractor
                </Link>
              </Button>
            </div>
            <Button asChild variant="destructive" className="mt-6 w-full h-16 text-lg">
                <Link href="/check-out">
                    <LogOut className="mr-3 h-6 w-6" />
                    Check Out
                </Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="w-full text-center p-6 text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Spartan IT. All rights reserved.
      </footer>
    </div>
  );
}
