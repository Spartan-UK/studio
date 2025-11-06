import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogIn, UserPlus, HardHat, LogOut } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <Card className="w-full max-w-2xl shadow-2xl bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-4xl font-bold">Spartan Visitor Register</CardTitle>
            <CardDescription className="text-lg text-foreground/80">Please select your check-in type or check out.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/check-in/visitor">
                <Card className="bg-transparent hover:bg-white/20 transition-all duration-300 h-full hover:scale-105 transform">
                  <CardHeader>
                    <div className="flex justify-center mb-2">
                        <UserPlus className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle>Visitor</CardTitle>
                    <CardDescription>For guests, clients, and other visitors.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Check-In Here</Button>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/check-in/contractor">
                <Card className="bg-transparent hover:bg-white/20 transition-all duration-300 h-full hover:scale-105 transform">
                  <CardHeader>
                    <div className="flex justify-center mb-2">
                        <HardHat className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle>Contractor</CardTitle>
                    <CardDescription>For maintenance and service personnel.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Check-In Here</Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
            <Button asChild variant="destructive" className="mt-6 w-full h-16 text-lg hover:scale-[1.02] transform transition-all duration-300 hover:bg-destructive/90">
                <Link href="/check-out">
                    <LogOut className="mr-3 h-6 w-6" />
                    Check Out
                </Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="w-full text-center p-6 text-sm text-muted-foreground flex justify-between items-center">
        <span>&copy; {new Date().getFullYear()} Spartan IT. All rights reserved.</span>
        <Button asChild variant="ghost">
          <Link href="/login">
            Login
            <LogIn className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </footer>
    </div>
  );
}
