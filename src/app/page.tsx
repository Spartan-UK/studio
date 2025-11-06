import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogIn, UserPlus, HardHat, LogOut, ArrowRight } from 'lucide-react';
import { SpartanIcon } from '@/components/icons';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <SpartanIcon className="h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Spartan Check-In</h1>
        </div>
        <Button asChild variant="ghost">
          <Link href="/admin/dashboard">
            Admin Login
            <LogIn className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col gap-6">
              <Button asChild className="h-20 text-xl" size="lg">
                <Link href="/check-in/visitor">
                  <UserPlus className="mr-4 h-8 w-8" />
                  Visitor Check-In
                </Link>
              </Button>
              <Button asChild className="h-20 text-xl" size="lg">
                <Link href="/check-in/contractor">
                  <HardHat className="mr-4 h-8 w-8" />
                  Contractor Check-In
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Button asChild variant="link" className="mt-8 text-lg text-foreground/80">
          <Link href="/check-out">
            Already checked in? <span className="font-semibold ml-1">Check Out Here</span>
            <LogOut className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </main>

      <footer className="w-full text-center p-6 text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Spartan IT. All rights reserved.
      </footer>
    </div>
  );
}
